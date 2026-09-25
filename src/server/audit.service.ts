import crypto from 'crypto';
import { databaseService } from './database.service.js';

export interface AuditEntry {
  requestId: string;
  userId: string;
  action: string;
  query: string;
  status: 'SUCCESS' | 'BLOCKED' | 'FAILED' | 'AMBIGUOUS';
  durationMs: number;
  details?: string;
}

export class AuditService {
  /**
   * Generates a deterministic SHA-256 hash of a query string for indexing and deduplication.
   */
  public generateQueryHash(query: string): string {
    return crypto.createHash('sha256').update(query.trim().toLowerCase()).digest('hex').substring(0, 16);
  }

  public async logEvent(entry: AuditEntry): Promise<void> {
    const hash = this.generateQueryHash(entry.query);

    // Structured server log without sensitive info
    console.log(
      JSON.stringify({
        timestamp: new Date().toISOString(),
        service: 'ArcAI',
        requestId: entry.requestId,
        userId: entry.userId,
        action: entry.action,
        queryHash: hash,
        status: entry.status,
        durationMs: entry.durationMs,
        details: entry.details,
      })
    );

    try {
      await databaseService.insertAuditLog(
        entry.userId,
        entry.action,
        hash,
        entry.status,
        entry.details
      );
    } catch (err) {
      console.error('Failed to persist audit log to database:', err);
    }
  }
}

export const auditService = new AuditService();
