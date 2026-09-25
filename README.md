# Arc AI - Natural-Language Data Query Translation (GEN-09)

Arc AI is an enterprise-grade full-stack natural-language-to-database query system. Designed for non-technical organizational users, it translates plain-English questions into verified, read-only PostgreSQL queries without exposing raw database complexity or writing SQL.

---

## 🎯 Project Purpose

This application implements **GEN-09: Natural-Language Data Query Translation**.

Unlike generic conversational chatbots, Arc AI is a **secure, schema-aware query engine**. It features a 7-stage deterministic and AI-powered translation pipeline with strict read-only execution guarantees, zero-guessing ambiguity handling, self-correction, and automatic visualization selection.

### Demonstration Domain
- **College Management Database**
  - 5 Academic Departments: AIML, CSE, ECE, MECH, IT
  - 1,000 Enrolled Students with realistic GPA distributions
  - 50 Faculty Members & Department Heads
  - 40 Curriculum Courses & Subjects
  - Attendance Tracking with institutional threshold flags (< 75%)
  - Academic Exam Scores, Midterms, and Evaluations
  - Fee Payment Ledgers (Paid, Pending, Overdue)

> **Note:** The underlying translation and validation architecture is domain-agnostic and designed to operate on corporate HR, finance, healthcare, enterprise ERP, and public-sector databases.

---

## 🛡️ Security Architecture & Guardrails

Arc AI adheres to an uncompromising SQL security model:

1. **Read-Only Enforcement:** Only single `SELECT` or `WITH ... SELECT` statements are permitted.
2. **Strict Operation Blocklist:** Blocks all DDL/DML mutation commands:
   - `DROP`, `DELETE`, `UPDATE`, `INSERT`, `ALTER`, `TRUNCATE`, `CREATE`, `GRANT`, `REVOKE`, `EXEC`, `EXECUTE`, `CALL`, `COPY`, `VACUUM`
3. **Stacked Query & Injection Protection:** Semicolon statement splitting and SQL comment injection (`--`, `/* */`) are rejected before execution.
4. **Table Whitelist:** Only approved application data tables may be queried. Access to internal tables (`pg_catalog`, `information_schema`, `audit_logs`) is blocked.
5. **Memory & Exhaustion Protection:** All queries are bounded by a mandatory limit (default `LIMIT 200`, max capped at `LIMIT 500`).
6. **Zero Raw Stacktraces:** Users never see raw database error traces. Errors are routed through a structured 2-attempt self-correction loop.

---

## ⚡ 7-Stage Execution Pipeline

1. **Understanding Question:** Semantic parsing of user intent.
2. **Identifying Relevant Data:** Verifying role permissions and entity boundaries.
3. **Retrieving Schema:** Dynamically injecting relevant table DDLs rather than blindly dumping the entire database.
4. **Generating SQL:** Synthesizing standards-compliant PostgreSQL via Gemini 3.8 Flash (`@google/genai`).
5. **Validating Query:** Security AST inspection, keyword verification, and table authorization check.
6. **Executing Database Query:** Executing the sanitized query against PostgreSQL.
7. **Preparing Answer & Visualization:** Producing a natural-language synthesis, recommending chart type (Recharts: Bar, Line, Pie, Area), and compiling execution metadata.

---

## 👥 Demonstration Users (RBAC)

The prototype includes 3 demonstration roles for testing server-side authorization:

| User | Role | Department | Scope |
|------|------|------------|-------|
| **Dr. Eleanor Vance** | Admin | All | Institutional oversight, audit logs, user role governance |
| **Prof. Rajesh Kumar** | HOD | AIML | Departmental reporting, attendance compliance, student tracking |
| **Dr. Sarah Jenkins** | Faculty | CSE | Course-level performance, exam evaluations, grades |

---

## 🧪 Demo Verification Questions

The application reliably demonstrates the following canonical inquiries:

1. `"How many students are there in each department?"`
2. `"Which AIML students have attendance below 75%?"`
3. `"What is the average CGPA of each department?"`
4. `"Which subject has the lowest average marks?"`
5. `"Show third-year AIML students with attendance below 75%."`
6. `"Compare average marks between AIML and CSE."`
7. `"Show students who scored below 40 in Data Structures."`
8. `"Which department has the highest average CGPA?"`

### Security Test Cases
- `"DROP TABLE students"` &rarr; **Blocked** by security layer.
- `"DELETE all students"` &rarr; **Blocked** by security layer.
- `"Show students with attendance below 75%"` &rarr; **Allowed & Executed**.

---

## 🔧 Environment Variables

Defined in `.env.example`:

```bash
# GEMINI_API_KEY: Required for Gemini AI API calls on the server
GEMINI_API_KEY="MY_GEMINI_API_KEY"

# APP_URL: Cloud Run / Hosting service URL
APP_URL="MY_APP_URL"

# Optional: Supabase PostgreSQL Connection URL
DATABASE_URL="postgresql://user:password@host:port/database"
SUPABASE_URL="https://your-project.supabase.co"
SUPABASE_ANON_KEY="your-anon-key"

# Session Security
SESSION_SECRET="your-session-secret-key"
```

---

## 🚀 Running Locally

```bash
# 1. Install dependencies
npm install

# 2. Run full-stack dev server
npm run dev

# 3. Production build
npm run build
npm start
```
