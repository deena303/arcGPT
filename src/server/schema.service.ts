import { TableSchema } from '../types/index.js';

export const CORE_TABLES: TableSchema[] = [
  {
    name: 'departments',
    description: 'Academic departments offering degree programs',
    columns: [
      { name: 'id', type: 'SERIAL', isPrimary: true, description: 'Unique department ID' },
      { name: 'name', type: 'VARCHAR(100)', description: 'Full department name (e.g. Artificial Intelligence & Machine Learning)' },
      { name: 'code', type: 'VARCHAR(20)', description: 'Department code abbreviation (e.g. AIML, CSE, ECE, MECH, IT)' },
    ],
  },
  {
    name: 'students',
    description: 'Enrolled college students across all years and departments',
    columns: [
      { name: 'id', type: 'SERIAL', isPrimary: true, description: 'Unique student identifier' },
      { name: 'roll_number', type: 'VARCHAR(30)', description: 'Unique college roll number (e.g. 23AIML001)' },
      { name: 'name', type: 'VARCHAR(100)', description: 'Full name of the student' },
      { name: 'department_id', type: 'INT', isForeignKey: true, references: { table: 'departments', field: 'id' }, description: 'Foreign key referencing departments.id' },
      { name: 'year', type: 'INT', description: 'Academic year (1, 2, 3, or 4)' },
      { name: 'section', type: 'VARCHAR(5)', description: 'Section letter (A or B)' },
      { name: 'cgpa', type: 'NUMERIC(4,2)', description: 'Cumulative Grade Point Average on a scale of 10.0' },
    ],
  },
  {
    name: 'faculty',
    description: 'Faculty professors and instructors teaching departments',
    columns: [
      { name: 'id', type: 'SERIAL', isPrimary: true, description: 'Unique faculty identifier' },
      { name: 'name', type: 'VARCHAR(100)', description: 'Full name with academic title (e.g. Dr. Robert Chen)' },
      { name: 'department_id', type: 'INT', isForeignKey: true, references: { table: 'departments', field: 'id' }, description: 'Foreign key referencing departments.id' },
    ],
  },
  {
    name: 'subjects',
    description: 'Courses and subjects offered in the college curriculum',
    columns: [
      { name: 'id', type: 'SERIAL', isPrimary: true, description: 'Unique subject identifier' },
      { name: 'name', type: 'VARCHAR(100)', description: 'Subject title (e.g. Data Structures, Machine Learning)' },
      { name: 'code', type: 'VARCHAR(20)', description: 'Subject course code (e.g. CS201, AI301)' },
      { name: 'department_id', type: 'INT', isForeignKey: true, references: { table: 'departments', field: 'id' }, description: 'Foreign key referencing departments.id' },
      { name: 'semester', type: 'INT', description: 'Semester number (1 to 8)' },
      { name: 'credits', type: 'INT', description: 'Credit hours (e.g. 3 or 4)' },
    ],
  },
  {
    name: 'attendance',
    description: 'Student attendance tracking per subject',
    columns: [
      { name: 'id', type: 'SERIAL', isPrimary: true, description: 'Unique attendance record id' },
      { name: 'student_id', type: 'INT', isForeignKey: true, references: { table: 'students', field: 'id' }, description: 'Foreign key referencing students.id' },
      { name: 'subject_id', type: 'INT', isForeignKey: true, references: { table: 'subjects', field: 'id' }, description: 'Foreign key referencing subjects.id' },
      { name: 'classes_attended', type: 'INT', description: 'Number of classes attended by the student' },
      { name: 'total_classes', type: 'INT', description: 'Total number of classes held for the subject' },
      { name: 'percentage', type: 'NUMERIC(5,2)', description: 'Attendance percentage calculated as (classes_attended/total_classes)*100' },
    ],
  },
  {
    name: 'marks',
    description: 'Academic exam scores achieved by students in subjects',
    columns: [
      { name: 'id', type: 'SERIAL', isPrimary: true, description: 'Unique mark record identifier' },
      { name: 'student_id', type: 'INT', isForeignKey: true, references: { table: 'students', field: 'id' }, description: 'Foreign key referencing students.id' },
      { name: 'subject_id', type: 'INT', isForeignKey: true, references: { table: 'subjects', field: 'id' }, description: 'Foreign key referencing subjects.id' },
      { name: 'exam_type', type: 'VARCHAR(50)', description: 'Assessment type: Internal 1, Internal 2, or Semester Final' },
      { name: 'marks', type: 'NUMERIC(5,2)', description: 'Marks obtained by the student' },
      { name: 'max_marks', type: 'NUMERIC(5,2)', description: 'Maximum possible marks (e.g. 50 or 100)' },
    ],
  },
  {
    name: 'exams',
    description: 'Scheduled college examinations and evaluations',
    columns: [
      { name: 'id', type: 'SERIAL', isPrimary: true, description: 'Unique exam ID' },
      { name: 'subject_id', type: 'INT', isForeignKey: true, references: { table: 'subjects', field: 'id' }, description: 'Foreign key referencing subjects.id' },
      { name: 'exam_name', type: 'VARCHAR(100)', description: 'Exam title (e.g. Midterm 1, Final Exam)' },
      { name: 'exam_date', type: 'VARCHAR(20)', description: 'Date when the exam is conducted (YYYY-MM-DD)' },
      { name: 'max_marks', type: 'NUMERIC(5,2)', description: 'Maximum achievable marks' },
    ],
  },
  {
    name: 'fees',
    description: 'Student fee payment ledger and status',
    columns: [
      { name: 'id', type: 'SERIAL', isPrimary: true, description: 'Unique fee record ID' },
      { name: 'student_id', type: 'INT', isForeignKey: true, references: { table: 'students', field: 'id' }, description: 'Foreign key referencing students.id' },
      { name: 'fee_type', type: 'VARCHAR(50)', description: 'Category of fee (Tuition, Library, Hostel, Laboratory)' },
      { name: 'amount', type: 'NUMERIC(10,2)', description: 'Fee amount in USD' },
      { name: 'payment_status', type: 'VARCHAR(20)', description: 'Payment status: Paid, Pending, or Overdue' },
    ],
  },
];

export const ALLOWED_TABLE_NAMES = CORE_TABLES.map(t => t.name.toLowerCase());

export class SchemaService {
  public getAllSchemas(): TableSchema[] {
    return CORE_TABLES;
  }

  public getTableSchema(tableName: string): TableSchema | undefined {
    return CORE_TABLES.find(t => t.name.toLowerCase() === tableName.toLowerCase());
  }

  /**
   * Retrieves relevant tables based on intent keywords to avoid dumping the whole DB indiscriminately.
   */
  public getRelevantSchemaPrompt(query: string): string {
    const q = query.toLowerCase();
    const relevantTables = new Set<string>();

    // Baseline tables for common queries
    if (q.includes('department') || q.includes('aiml') || q.includes('cse') || q.includes('ece') || q.includes('mech') || q.includes('it')) {
      relevantTables.add('departments');
    }
    if (q.includes('student') || q.includes('cgpa') || q.includes('year') || q.includes('section') || q.includes('who') || q.includes('roll')) {
      relevantTables.add('students');
      relevantTables.add('departments');
    }
    if (q.includes('faculty') || q.includes('teacher') || q.includes('professor') || q.includes('instructor')) {
      relevantTables.add('faculty');
      relevantTables.add('departments');
    }
    if (q.includes('subject') || q.includes('course') || q.includes('data structure') || q.includes('machine learning') || q.includes('credit')) {
      relevantTables.add('subjects');
      relevantTables.add('departments');
    }
    if (q.includes('attend') || q.includes('absent') || q.includes('percentage') || q.includes('classes') || q.includes('75')) {
      relevantTables.add('attendance');
      relevantTables.add('students');
      relevantTables.add('departments');
      relevantTables.add('subjects');
    }
    if (q.includes('mark') || q.includes('score') || q.includes('grade') || q.includes('40') || q.includes('average mark') || q.includes('exam')) {
      relevantTables.add('marks');
      relevantTables.add('subjects');
      relevantTables.add('students');
      relevantTables.add('departments');
    }
    if (q.includes('fee') || q.includes('tuition') || q.includes('payment') || q.includes('paid') || q.includes('overdue')) {
      relevantTables.add('fees');
      relevantTables.add('students');
      relevantTables.add('departments');
    }

    // If query has no specific keyword match, include core related tables
    if (relevantTables.size === 0) {
      relevantTables.add('departments');
      relevantTables.add('students');
      relevantTables.add('attendance');
      relevantTables.add('marks');
      relevantTables.add('subjects');
    }

    const tablesToInclude = CORE_TABLES.filter(t => relevantTables.has(t.name));

    return tablesToInclude
      .map(t => {
        const cols = t.columns
          .map(c => `  - ${c.name} (${c.type})${c.isPrimary ? ' PRIMARY KEY' : ''}${c.references ? ` REFERENCES ${c.references.table}(${c.references.field})` : ''}: ${c.description}`)
          .join('\n');
        return `Table: ${t.name}\nDescription: ${t.description}\nColumns:\n${cols}`;
      })
      .join('\n\n');
  }

  public getRelationships() {
    return [
      { from: 'departments', to: 'students', relation: 'one-to-many', foreignKey: 'students.department_id = departments.id' },
      { from: 'departments', to: 'faculty', relation: 'one-to-many', foreignKey: 'faculty.department_id = departments.id' },
      { from: 'departments', to: 'subjects', relation: 'one-to-many', foreignKey: 'subjects.department_id = departments.id' },
      { from: 'students', to: 'attendance', relation: 'one-to-many', foreignKey: 'attendance.student_id = students.id' },
      { from: 'subjects', to: 'attendance', relation: 'one-to-many', foreignKey: 'attendance.subject_id = subjects.id' },
      { from: 'students', to: 'marks', relation: 'one-to-many', foreignKey: 'marks.student_id = students.id' },
      { from: 'subjects', to: 'marks', relation: 'one-to-many', foreignKey: 'marks.subject_id = subjects.id' },
      { from: 'subjects', to: 'exams', relation: 'one-to-many', foreignKey: 'exams.subject_id = subjects.id' },
      { from: 'students', to: 'fees', relation: 'one-to-many', foreignKey: 'fees.student_id = students.id' },
    ];
  }
}

export const schemaService = new SchemaService();
