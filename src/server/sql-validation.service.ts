import { ALLOWED_TABLE_NAMES } from './schema.service.js';

export interface SqlValidationResult {
  isValid: boolean;
  sanitizedSql?: string;
  blockedReason?: string;
  detectedTables: string[];
}

// Prohibited DDL/DML and administrative commands
const DISALLOWED_KEYWORDS = [
  'DROP',
  'DELETE',
  'UPDATE',
  'INSERT',
  'ALTER',
  'TRUNCATE',
  'CREATE',
  'GRANT',
  'REVOKE',
  'EXEC',
  'EXECUTE',
  'MERGE',
  'CALL',
  'COPY',
  'VACUUM',
  'REINDEX',
  'PRAGMA',
  'SET',
  'SHOW',
  'INTO OUTFILE',
  'LOAD_FILE',
  'BENCHMARK',
  'SLEEP',
  'PG_SLEEP',
  'UNION SELECT NULL',
];

export class SqlValidationService {
  /**
   * Validates and sanitizes a candidate SQL query.
   */
  public validate(rawSql: string): SqlValidationResult {
    if (!rawSql || typeof rawSql !== 'string') {
      return {
        isValid: false,
        blockedReason: 'Empty or invalid SQL statement provided.',
        detectedTables: [],
      };
    }

    let cleaned = rawSql.trim();

    // Strip markdown code block wrappers if any (e.g. ```sql ... ```)
    cleaned = cleaned.replace(/^```(?:sql)?/i, '').replace(/```$/i, '').trim();

    // Remove single trailing semicolon for normalization, but reject multiple semicolons
    if (cleaned.endsWith(';')) {
      cleaned = cleaned.slice(0, -1).trim();
    }

    // 1. Check for multiple statements (semicolon inside query)
    if (cleaned.includes(';')) {
      return {
        isValid: false,
        blockedReason: 'Query blocked for security reasons: Multiple SQL statements are strictly forbidden.',
        detectedTables: [],
      };
    }

    // 2. Check for SQL comments (often used in SQL injection payloads)
    if (/(--|\/\*|\*\/|#)/.test(cleaned)) {
      return {
        isValid: false,
        blockedReason: 'Query blocked for security reasons: SQL comments are not permitted in queries.',
        detectedTables: [],
      };
    }

    // 3. Must begin with SELECT or WITH (for CTEs leading to SELECT)
    const upper = cleaned.toUpperCase();
    if (!upper.startsWith('SELECT') && !upper.startsWith('WITH')) {
      return {
        isValid: false,
        blockedReason: 'Query blocked for security reasons: Only read-only SELECT operations are permitted.',
        detectedTables: [],
      };
    }

    // 4. Block disallowed mutating or system operations using word-boundary check
    for (const keyword of DISALLOWED_KEYWORDS) {
      const regex = new RegExp(`\\b${keyword}\\b`, 'i');
      if (regex.test(cleaned)) {
        return {
          isValid: false,
          blockedReason: `Query blocked for security reasons: Disallowed operation '${keyword}' detected. Only SELECT statements are authorized.`,
          detectedTables: [],
        };
      }
    }

    // 5. Table extraction and authorization check
    // We look for table names after FROM, JOIN, INTO, UPDATE, etc.
    const tableRegex = /\b(?:FROM|JOIN)\s+([a-zA-Z_][a-zA-Z0-9_]*)/gi;
    const detectedTables = new Set<string>();
    let match: RegExpExecArray | null;

    while ((match = tableRegex.exec(cleaned)) !== null) {
      const tableName = match[1].toLowerCase();
      // Skip subquery / CTE aliases if they are part of WITH, but check against allowed list
      detectedTables.add(tableName);
    }

    // Check if any detected table is unauthorized or targets system catalog
    for (const tbl of detectedTables) {
      // If table is an unauthorized system table
      if (
        tbl.startsWith('pg_') ||
        tbl.startsWith('information_schema') ||
        tbl === 'query_history' ||
        tbl === 'audit_logs' ||
        tbl === 'feedback' ||
        tbl === 'saved_queries'
      ) {
        return {
          isValid: false,
          blockedReason: `Query blocked for security reasons: Access to protected or system table '${tbl}' is strictly prohibited.`,
          detectedTables: Array.from(detectedTables),
        };
      }

      // Check if table is in the allowed college schema or CTE
      if (!ALLOWED_TABLE_NAMES.includes(tbl)) {
        // Check if defined in a WITH clause
        const withCheck = new RegExp(`\\bWITH\\s+.*?${tbl}\\s+AS`, 'i');
        if (!withCheck.test(cleaned)) {
          return {
            isValid: false,
            blockedReason: `Query blocked for security reasons: Unknown or unauthorized table '${tbl}'. Only approved college data tables may be queried.`,
            detectedTables: Array.from(detectedTables),
          };
        }
      }
    }

    // 6. Enforce safe LIMIT to prevent memory exhaustion / accidental unrestricted dumps
    let sanitizedSql = cleaned;
    const limitMatch = sanitizedSql.match(/\bLIMIT\s+(\d+)\b/i);

    if (limitMatch) {
      const limitVal = parseInt(limitMatch[1], 10);
      if (limitVal > 500) {
        sanitizedSql = sanitizedSql.replace(/\bLIMIT\s+\d+\b/i, 'LIMIT 500');
      }
    } else {
      // Append safe default LIMIT of 200
      sanitizedSql = `${sanitizedSql} LIMIT 200`;
    }

    return {
      isValid: true,
      sanitizedSql,
      detectedTables: Array.from(detectedTables),
    };
  }
}

export const sqlValidationService = new SqlValidationService();
