-- Smart Student & Faculty Management System
-- Seed Data (Realistic, Relationally Consistent)
-- All passwords BCrypt hashed: Admin@123, Faculty@123, Student@123
-- BCrypt hash of "Admin@123":   $2a$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW
-- BCrypt hash of "Faculty@123": $2a$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW
-- NOTE: All share the same hash for seed simplicity; replace in production

USE smart_sms;

-- Disable FK checks for seeding
SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE notifications;
TRUNCATE TABLE grades;
TRUNCATE TABLE leave_applications;
TRUNCATE TABLE assignment_submissions;
TRUNCATE TABLE assignments;
TRUNCATE TABLE attendance;
TRUNCATE TABLE attendance_sessions;
TRUNCATE TABLE timetable;
TRUNCATE TABLE subjects;
TRUNCATE TABLE students;
TRUNCATE TABLE faculty;
ALTER TABLE departments DROP FOREIGN KEY fk_dept_head;
TRUNCATE TABLE departments;
TRUNCATE TABLE users;
SET FOREIGN_KEY_CHECKS = 1;

-- ─── USERS ───────────────────────────────────────────────────────────────────
-- Password for all: corresponding role password BCrypt encoded
INSERT INTO users (id, email, password_hash, first_name, last_name, phone, role, active, created_at, updated_at) VALUES
-- Admin
(1,  'admin@sms.edu',         '$2a$10$slYQmyNdgzSnfvMW4G9vNusBQXWbIFCn9BHBjKOmGW.DaMaXNDzGa', 'System',  'Admin',     '9000000000', 'ADMIN',   TRUE, NOW(), NOW()),
-- Faculty
(2,  'priya.sharma@sms.edu',  '$2a$10$slYQmyNdgzSnfvMW4G9vNusBQXWbIFCn9BHBjKOmGW.DaMaXNDzGa', 'Priya',   'Sharma',    '9100000001', 'FACULTY', TRUE, NOW(), NOW()),
(3,  'rajan.verma@sms.edu',   '$2a$10$slYQmyNdgzSnfvMW4G9vNusBQXWbIFCn9BHBjKOmGW.DaMaXNDzGa', 'Rajan',   'Verma',     '9100000002', 'FACULTY', TRUE, NOW(), NOW()),
(4,  'meena.nair@sms.edu',    '$2a$10$slYQmyNdgzSnfvMW4G9vNusBQXWbIFCn9BHBjKOmGW.DaMaXNDzGa', 'Meena',   'Nair',      '9100000003', 'FACULTY', TRUE, NOW(), NOW()),
(5,  'arun.das@sms.edu',      '$2a$10$slYQmyNdgzSnfvMW4G9vNusBQXWbIFCn9BHBjKOmGW.DaMaXNDzGa', 'Arun',    'Das',       '9100000004', 'FACULTY', TRUE, NOW(), NOW()),
(6,  'sunita.joshi@sms.edu',  '$2a$10$slYQmyNdgzSnfvMW4G9vNusBQXWbIFCn9BHBjKOmGW.DaMaXNDzGa', 'Sunita',  'Joshi',     '9100000005', 'FACULTY', TRUE, NOW(), NOW()),
-- Students
(7,  'arjun.kumar@sms.edu',   '$2a$10$slYQmyNdgzSnfvMW4G9vNusBQXWbIFCn9BHBjKOmGW.DaMaXNDzGa', 'Arjun',   'Kumar',     '9200000001', 'STUDENT', TRUE, NOW(), NOW()),
(8,  'meera.patel@sms.edu',   '$2a$10$slYQmyNdgzSnfvMW4G9vNusBQXWbIFCn9BHBjKOmGW.DaMaXNDzGa', 'Meera',   'Patel',     '9200000002', 'STUDENT', TRUE, NOW(), NOW()),
(9,  'rahul.singh@sms.edu',   '$2a$10$slYQmyNdgzSnfvMW4G9vNusBQXWbIFCn9BHBjKOmGW.DaMaXNDzGa', 'Rahul',   'Singh',     '9200000003', 'STUDENT', TRUE, NOW(), NOW()),
(10, 'sneha.reddy@sms.edu',   '$2a$10$slYQmyNdgzSnfvMW4G9vNusBQXWbIFCn9BHBjKOmGW.DaMaXNDzGa', 'Sneha',   'Reddy',     '9200000004', 'STUDENT', TRUE, NOW(), NOW()),
(11, 'vikram.iyer@sms.edu',   '$2a$10$slYQmyNdgzSnfvMW4G9vNusBQXWbIFCn9BHBjKOmGW.DaMaXNDzGa', 'Vikram',  'Iyer',      '9200000005', 'STUDENT', TRUE, NOW(), NOW()),
(12, 'pooja.gupta@sms.edu',   '$2a$10$slYQmyNdgzSnfvMW4G9vNusBQXWbIFCn9BHBjKOmGW.DaMaXNDzGa', 'Pooja',   'Gupta',     '9200000006', 'STUDENT', TRUE, NOW(), NOW()),
(13, 'amit.trivedi@sms.edu',  '$2a$10$slYQmyNdgzSnfvMW4G9vNusBQXWbIFCn9BHBjKOmGW.DaMaXNDzGa', 'Amit',    'Trivedi',   '9200000007', 'STUDENT', TRUE, NOW(), NOW()),
(14, 'kavya.menon@sms.edu',   '$2a$10$slYQmyNdgzSnfvMW4G9vNusBQXWbIFCn9BHBjKOmGW.DaMaXNDzGa', 'Kavya',   'Menon',     '9200000008', 'STUDENT', TRUE, NOW(), NOW()),
(15, 'rohan.shah@sms.edu',    '$2a$10$slYQmyNdgzSnfvMW4G9vNusBQXWbIFCn9BHBjKOmGW.DaMaXNDzGa', 'Rohan',   'Shah',      '9200000009', 'STUDENT', TRUE, NOW(), NOW()),
(16, 'prachi.bose@sms.edu',   '$2a$10$slYQmyNdgzSnfvMW4G9vNusBQXWbIFCn9BHBjKOmGW.DaMaXNDzGa', 'Prachi',  'Bose',      '9200000010', 'STUDENT', TRUE, NOW(), NOW()),
(17, 'ankit.mishra@sms.edu',  '$2a$10$slYQmyNdgzSnfvMW4G9vNusBQXWbIFCn9BHBjKOmGW.DaMaXNDzGa', 'Ankit',   'Mishra',    '9200000011', 'STUDENT', TRUE, NOW(), NOW()),
(18, 'deepika.rao@sms.edu',   '$2a$10$slYQmyNdgzSnfvMW4G9vNusBQXWbIFCn9BHBjKOmGW.DaMaXNDzGa', 'Deepika', 'Rao',       '9200000012', 'STUDENT', TRUE, NOW(), NOW()),
(19, 'nikhil.saxena@sms.edu', '$2a$10$slYQmyNdgzSnfvMW4G9vNusBQXWbIFCn9BHBjKOmGW.DaMaXNDzGa', 'Nikhil',  'Saxena',    '9200000013', 'STUDENT', TRUE, NOW(), NOW()),
(20, 'tanvi.jain@sms.edu',    '$2a$10$slYQmyNdgzSnfvMW4G9vNusBQXWbIFCn9BHBjKOmGW.DaMaXNDzGa', 'Tanvi',   'Jain',      '9200000014', 'STUDENT', TRUE, NOW(), NOW()),
(21, 'siddharth.ks@sms.edu',  '$2a$10$slYQmyNdgzSnfvMW4G9vNusBQXWbIFCn9BHBjKOmGW.DaMaXNDzGa', 'Siddharth','K S',      '9200000015', 'STUDENT', TRUE, NOW(), NOW()),
(22, 'nandita.roy@sms.edu',   '$2a$10$slYQmyNdgzSnfvMW4G9vNusBQXWbIFCn9BHBjKOmGW.DaMaXNDzGa', 'Nandita', 'Roy',       '9200000016', 'STUDENT', TRUE, NOW(), NOW()),
(23, 'farhan.sheikh@sms.edu', '$2a$10$slYQmyNdgzSnfvMW4G9vNusBQXWbIFCn9BHBjKOmGW.DaMaXNDzGa', 'Farhan',  'Sheikh',    '9200000017', 'STUDENT', TRUE, NOW(), NOW()),
(24, 'shruti.pillai@sms.edu', '$2a$10$slYQmyNdgzSnfvMW4G9vNusBQXWbIFCn9BHBjKOmGW.DaMaXNDzGa', 'Shruti',  'Pillai',    '9200000018', 'STUDENT', TRUE, NOW(), NOW()),
(25, 'yash.desai@sms.edu',    '$2a$10$slYQmyNdgzSnfvMW4G9vNusBQXWbIFCn9BHBjKOmGW.DaMaXNDzGa', 'Yash',    'Desai',     '9200000019', 'STUDENT', TRUE, NOW(), NOW()),
(26, 'lavanya.krishna@sms.edu','$2a$10$slYQmyNdgzSnfvMW4G9vNusBQXWbIFCn9BHBjKOmGW.DaMaXNDzGa','Lavanya', 'Krishna',  '9200000020', 'STUDENT', TRUE, NOW(), NOW());

-- ─── DEPARTMENTS ─────────────────────────────────────────────────────────────
INSERT INTO departments (id, name, code, head_faculty_id, active, created_at) VALUES
(1, 'Computer Science & Engineering',  'CSE', NULL, TRUE, NOW()),
(2, 'Information Technology',          'IT',  NULL, TRUE, NOW()),
(3, 'Electronics & Communication',     'ECE', NULL, TRUE, NOW()),
(4, 'Mechanical Engineering',          'ME',  NULL, TRUE, NOW());

-- ─── FACULTY ─────────────────────────────────────────────────────────────────
INSERT INTO faculty (id, user_id, faculty_code, department_id, joined_date, active, created_at) VALUES
(1, 2, 'FAC0001', 1, '2020-07-01', TRUE, NOW()),
(2, 3, 'FAC0002', 1, '2019-07-01', TRUE, NOW()),
(3, 4, 'FAC0003', 2, '2021-01-01', TRUE, NOW()),
(4, 5, 'FAC0004', 3, '2018-07-01', TRUE, NOW()),
(5, 6, 'FAC0005', 4, '2022-01-01', TRUE, NOW());

-- Update department heads
UPDATE departments SET head_faculty_id = 1 WHERE id = 1;
UPDATE departments SET head_faculty_id = 3 WHERE id = 2;
UPDATE departments SET head_faculty_id = 4 WHERE id = 3;
UPDATE departments SET head_faculty_id = 5 WHERE id = 4;

-- Re-add FK
ALTER TABLE departments ADD CONSTRAINT fk_dept_head
    FOREIGN KEY (head_faculty_id) REFERENCES faculty(id) ON DELETE SET NULL;

-- ─── STUDENTS ────────────────────────────────────────────────────────────────
INSERT INTO students (id, user_id, student_code, department_id, semester, enrollment_date, active, created_at) VALUES
-- CSE department (dept 1) - 8 students
(1,  7,  'STU0001', 1, 7, '2021-08-01', TRUE, NOW()),
(2,  8,  'STU0002', 1, 7, '2021-08-01', TRUE, NOW()),
(3,  9,  'STU0003', 1, 5, '2022-08-01', TRUE, NOW()),
(4,  10, 'STU0004', 1, 5, '2022-08-01', TRUE, NOW()),
(5,  11, 'STU0005', 1, 3, '2023-08-01', TRUE, NOW()),
(6,  12, 'STU0006', 1, 3, '2023-08-01', TRUE, NOW()),
(7,  13, 'STU0007', 1, 1, '2024-08-01', TRUE, NOW()),
(8,  14, 'STU0008', 1, 1, '2024-08-01', TRUE, NOW()),
-- IT department (dept 2) - 6 students
(9,  15, 'STU0009', 2, 7, '2021-08-01', TRUE, NOW()),
(10, 16, 'STU0010', 2, 7, '2021-08-01', TRUE, NOW()),
(11, 17, 'STU0011', 2, 5, '2022-08-01', TRUE, NOW()),
(12, 18, 'STU0012', 2, 5, '2022-08-01', TRUE, NOW()),
-- ECE department (dept 3) - 4 students
(13, 19, 'STU0013', 3, 5, '2022-08-01', TRUE, NOW()),
(14, 20, 'STU0014', 3, 5, '2022-08-01', TRUE, NOW()),
-- ME department (dept 4) - 6 students
(15, 21, 'STU0015', 4, 7, '2021-08-01', TRUE, NOW()),
(16, 22, 'STU0016', 4, 7, '2021-08-01', TRUE, NOW()),
(17, 23, 'STU0017', 4, 5, '2022-08-01', TRUE, NOW()),
(18, 24, 'STU0018', 4, 3, '2023-08-01', TRUE, NOW()),
(19, 25, 'STU0019', 4, 1, '2024-08-01', TRUE, NOW()),
(20, 26, 'STU0020', 4, 1, '2024-08-01', TRUE, NOW());

-- ─── SUBJECTS ────────────────────────────────────────────────────────────────
INSERT INTO subjects (id, code, name, credits, department_id, faculty_id, active, created_at) VALUES
-- CSE subjects
(1,  'CS701', 'Software Engineering',       4, 1, 1, TRUE, NOW()),
(2,  'CS702', 'Database Management Systems',3, 1, 2, TRUE, NOW()),
(3,  'CS703', 'Computer Networks',          3, 1, 1, TRUE, NOW()),
(4,  'CS501', 'Data Structures & Algorithms',4,1, 2, TRUE, NOW()),
(5,  'CS502', 'Object Oriented Programming',3, 1, 1, TRUE, NOW()),
-- IT subjects
(6,  'IT701', 'Web Technologies',           3, 2, 3, TRUE, NOW()),
(7,  'IT702', 'Cloud Computing',            3, 2, 3, TRUE, NOW()),
(8,  'IT501', 'Python Programming',         3, 2, 3, TRUE, NOW()),
-- ECE subjects
(9,  'EC501', 'Digital Electronics',        4, 3, 4, TRUE, NOW()),
(10, 'EC502', 'Signal Processing',          3, 3, 4, TRUE, NOW()),
-- ME subjects
(11, 'ME701', 'Thermodynamics',             4, 4, 5, TRUE, NOW()),
(12, 'ME702', 'Fluid Mechanics',            3, 4, 5, TRUE, NOW());

-- ─── TIMETABLE ───────────────────────────────────────────────────────────────
INSERT INTO timetable (id, subject_id, faculty_id, class_name, room, day_of_week, start_time, end_time, active) VALUES
-- CSE S7 class
(1,  1, 1, 'CSE-S7', 'Room-101', 'MONDAY',    '09:00:00', '10:00:00', TRUE),
(2,  2, 2, 'CSE-S7', 'Room-102', 'MONDAY',    '10:00:00', '11:00:00', TRUE),
(3,  3, 1, 'CSE-S7', 'Room-101', 'TUESDAY',   '09:00:00', '10:00:00', TRUE),
(4,  1, 1, 'CSE-S7', 'Room-101', 'WEDNESDAY', '09:00:00', '10:00:00', TRUE),
(5,  2, 2, 'CSE-S7', 'Room-102', 'THURSDAY',  '10:00:00', '11:00:00', TRUE),
(6,  3, 1, 'CSE-S7', 'Room-103', 'FRIDAY',    '11:00:00', '12:00:00', TRUE),
-- CSE S5 class
(7,  4, 2, 'CSE-S5', 'Room-201', 'MONDAY',    '11:00:00', '12:00:00', TRUE),
(8,  5, 1, 'CSE-S5', 'Room-202', 'TUESDAY',   '11:00:00', '12:00:00', TRUE),
-- IT S7 class
(9,  6, 3, 'IT-S7',  'Room-301', 'MONDAY',    '09:00:00', '10:00:00', TRUE),
(10, 7, 3, 'IT-S7',  'Room-302', 'WEDNESDAY', '10:00:00', '11:00:00', TRUE),
-- ME S7 class
(11,11, 5, 'ME-S7',  'Room-401', 'MONDAY',    '14:00:00', '15:00:00', TRUE),
(12,12, 5, 'ME-S7',  'Room-401', 'WEDNESDAY', '14:00:00', '15:00:00', TRUE);

-- ─── ATTENDANCE SESSIONS ─────────────────────────────────────────────────────
INSERT INTO attendance_sessions (id, faculty_id, subject_id, class_name, session_date, qr_token, session_type, active, created_at) VALUES
(1, 1, 1, 'CSE-S7', '2026-09-01', NULL, 'MANUAL', TRUE, NOW()),
(2, 1, 1, 'CSE-S7', '2026-09-03', NULL, 'MANUAL', TRUE, NOW()),
(3, 1, 1, 'CSE-S7', '2026-09-05', NULL, 'MANUAL', TRUE, NOW()),
(4, 1, 1, 'CSE-S7', '2026-09-08', NULL, 'MANUAL', TRUE, NOW()),
(5, 2, 2, 'CSE-S7', '2026-09-01', NULL, 'MANUAL', TRUE, NOW()),
(6, 2, 2, 'CSE-S7', '2026-09-04', NULL, 'MANUAL', TRUE, NOW()),
(7, 2, 2, 'CSE-S7', '2026-09-08', NULL, 'MANUAL', TRUE, NOW()),
(8, 1, 3, 'CSE-S7', '2026-09-02', NULL, 'MANUAL', TRUE, NOW()),
(9, 1, 3, 'CSE-S7', '2026-09-05', NULL, 'MANUAL', TRUE, NOW()),
(10,1, 3, 'CSE-S7', '2026-09-09', NULL, 'MANUAL', TRUE, NOW());

-- ─── ATTENDANCE RECORDS ───────────────────────────────────────────────────────
-- Arjun (student 1): good attendance ~87%
INSERT INTO attendance (student_id, session_id, status, marked_at, created_at) VALUES
(1, 1, 'PRESENT', NOW(), NOW()), (1, 2, 'PRESENT', NOW(), NOW()), (1, 3, 'ABSENT', NOW(), NOW()),
(1, 4, 'PRESENT', NOW(), NOW()), (1, 5, 'PRESENT', NOW(), NOW()), (1, 6, 'PRESENT', NOW(), NOW()),
(1, 7, 'PRESENT', NOW(), NOW()), (1, 8, 'PRESENT', NOW(), NOW()), (1, 9, 'PRESENT', NOW(), NOW()),
(1, 10,'PRESENT', NOW(), NOW());
-- Meera (student 2): low attendance ~60%
INSERT INTO attendance (student_id, session_id, status, marked_at, created_at) VALUES
(2, 1, 'PRESENT', NOW(), NOW()), (2, 2, 'ABSENT',  NOW(), NOW()), (2, 3, 'ABSENT', NOW(), NOW()),
(2, 4, 'PRESENT', NOW(), NOW()), (2, 5, 'ABSENT',  NOW(), NOW()), (2, 6, 'PRESENT', NOW(), NOW()),
(2, 7, 'ABSENT',  NOW(), NOW()), (2, 8, 'PRESENT', NOW(), NOW()), (2, 9, 'ABSENT',  NOW(), NOW()),
(2, 10,'PRESENT', NOW(), NOW());
-- Rahul (student 3) in CSE-S7 too (they're CSE-S5 but we track sessions via subject):
INSERT INTO attendance (student_id, session_id, status, marked_at, created_at) VALUES
(3, 1, 'PRESENT', NOW(), NOW()), (3, 2, 'PRESENT', NOW(), NOW()), (3, 3, 'PRESENT', NOW(), NOW()),
(3, 4, 'PRESENT', NOW(), NOW()), (3, 5, 'PRESENT', NOW(), NOW()), (3, 6, 'ABSENT',  NOW(), NOW());

-- ─── ASSIGNMENTS ─────────────────────────────────────────────────────────────
INSERT INTO assignments (id, faculty_id, subject_id, class_name, title, description, due_date, max_marks, active, created_at, updated_at) VALUES
(1, 1, 1, 'CSE-S7', 'Software Requirements Document',
 'Prepare a complete SRS document for a Library Management System including functional and non-functional requirements.',
 '2026-09-20', 50, TRUE, NOW(), NOW()),
(2, 2, 2, 'CSE-S7', 'Database Design Project',
 'Design an ER diagram and normalized relational schema for an e-commerce platform. Include at least 8 tables.',
 '2026-09-25', 100, TRUE, NOW(), NOW()),
(3, 1, 3, 'CSE-S7', 'Network Topology Analysis',
 'Analyze and compare at least 4 network topologies. Include diagrams, pros/cons, and use-case scenarios.',
 '2026-09-15', 50, TRUE, NOW(), NOW()),
(4, 2, 4, 'CSE-S5', 'Sorting Algorithm Implementation',
 'Implement and compare 5 sorting algorithms in Java. Provide time complexity analysis and benchmarks.',
 '2026-09-18', 100, TRUE, NOW(), NOW()),
(5, 3, 6, 'IT-S7',  'REST API Development',
 'Build a complete REST API using Node.js or Python Flask. Include authentication, CRUD operations, and documentation.',
 '2026-09-30', 100, TRUE, NOW(), NOW());

-- ─── SUBMISSIONS ─────────────────────────────────────────────────────────────
INSERT INTO assignment_submissions (assignment_id, student_id, file_path, original_filename, file_size, file_type, notes, submitted_at, marks, feedback, status, created_at, updated_at) VALUES
-- Assignment 1 (due 09-20) - mix of submitted and graded
(1, 1, NULL, NULL, NULL, NULL, 'Attached the SRS document with all sections completed.', '2026-09-18 10:00:00', 45, 'Excellent work! Very detailed requirements.', 'GRADED', NOW(), NOW()),
(1, 2, NULL, NULL, NULL, NULL, 'Completed SRS with all functional requirements.', '2026-09-19 14:00:00', NULL, NULL, 'SUBMITTED', NOW(), NOW()),
(1, 3, NULL, NULL, NULL, NULL, 'Late submission. Apologize for the delay.', '2026-09-22 09:00:00', NULL, NULL, 'LATE', NOW(), NOW()),
-- Assignment 2 (due 09-25)
(2, 1, NULL, NULL, NULL, NULL, 'ER diagram and schema for e-commerce included.', '2026-09-24 16:00:00', 88, 'Good schema design, minor normalization issues.', 'GRADED', NOW(), NOW()),
(2, 2, NULL, NULL, NULL, NULL, 'Completed with 10 tables.', '2026-09-25 11:00:00', NULL, NULL, 'SUBMITTED', NOW(), NOW()),
-- Assignment 3 (due 09-15)
(3, 1, NULL, NULL, NULL, NULL, 'Analysis of Star, Bus, Ring, and Mesh topologies.', '2026-09-14 08:00:00', 47, 'Thorough analysis with good diagrams.', 'GRADED', NOW(), NOW()),
(3, 2, NULL, NULL, NULL, NULL, 'Completed analysis.', '2026-09-17 10:00:00', NULL, NULL, 'LATE', NOW(), NOW());

-- ─── LEAVE APPLICATIONS ──────────────────────────────────────────────────────
INSERT INTO leave_applications (student_id, start_date, end_date, reason, status, reviewed_by, reviewed_at, review_comment, created_at, updated_at) VALUES
-- Approved
(1, '2026-09-10', '2026-09-11', 'Medical appointment – scheduled surgery follow-up. Will make up missed work.', 'APPROVED', 2, NOW(), 'Approved. Please share medical certificate.', NOW(), NOW()),
-- Pending
(2, '2026-09-15', '2026-09-16', 'Family function - sister''s engagement ceremony. Request two days leave.', 'PENDING', NULL, NULL, NULL, NOW(), NOW()),
(3, '2026-09-18', '2026-09-18', 'Attending technical symposium at IIT. Will present a paper.', 'PENDING', NULL, NULL, NULL, NOW(), NOW()),
-- Rejected
(4, '2026-09-12', '2026-09-14', 'Going on vacation.', 'REJECTED', 1, NOW(), 'Leave not approved for vacation during academic period.', NOW(), NOW()),
-- CSE-S5 student
(5, '2026-09-20', '2026-09-21', 'Participating in inter-college hackathon. College representative.', 'APPROVED', 2, NOW(), 'Approved. Good luck at the hackathon!', NOW(), NOW());

-- ─── GRADES ──────────────────────────────────────────────────────────────────
INSERT INTO grades (student_id, subject_id, internal_marks, assignment_marks, exam_marks, total_marks, grade, published, created_at, updated_at) VALUES
-- Arjun's grades (published)
(1, 1, 28, 45, 72, 145, 'A', TRUE,  NOW(), NOW()),
(1, 2, 25, 88, 68, 181, 'A+',TRUE,  NOW(), NOW()),
(1, 3, 27, 47, 70, 144, 'A', TRUE,  NOW(), NOW()),
-- Meera's grades (published)
(2, 1, 22, NULL, 58, 80, 'B+',TRUE, NOW(), NOW()),
(2, 2, 20, NULL, 55, 75, 'B', TRUE, NOW(), NOW()),
-- Rahul - not yet published
(3, 4, 30, NULL, 78, 108,'A', FALSE, NOW(), NOW()),
(3, 5, 25, NULL, 62, 87, 'B+',FALSE,NOW(), NOW());

-- ─── NOTIFICATIONS ───────────────────────────────────────────────────────────
INSERT INTO notifications (user_id, type, title, message, read_status, related_entity_type, related_entity_id, created_at) VALUES
-- Notifications for Arjun
(7, 'SUCCESS', 'Grade Published: Software Engineering', 'Your grade for Software Engineering has been published. Total: 145 | Grade: A', FALSE, 'GRADE', 1, NOW()),
(7, 'SUCCESS', 'Leave Application Approved', 'Your leave request from 2026-09-10 to 2026-09-11 has been approved.', TRUE, 'LEAVE', 1, NOW()),
(7, 'INFO',    'New Assignment: Database Design Project', 'A new assignment has been posted in Database Management Systems. Due: 2026-09-25', TRUE, 'ASSIGNMENT', 2, NOW()),
-- Notifications for Meera
(8, 'WARNING', '⚠ Low Attendance Warning', 'Your attendance in Database Management Systems is 57.1%, which is below the required 75%. Please attend classes regularly.', FALSE, 'SUBJECT', 2, NOW()),
(8, 'INFO',    'New Assignment: Software Requirements Document', 'A new assignment has been posted in Software Engineering. Due: 2026-09-20', TRUE, 'ASSIGNMENT', 1, NOW()),
-- Notification for faculty
(2, 'INFO', 'New Submission: Software Requirements Document', 'Arjun Kumar submitted assignment ''Software Requirements Document''', TRUE, 'SUBMISSION', 1, NOW()),
(2, 'INFO', 'New Leave Request', 'Meera Patel has applied for leave from 2026-09-15 to 2026-09-16', FALSE, 'LEAVE', 2, NOW()),
-- Admin notification
(1, 'INFO', 'System Initialized', 'Smart SMS system has been successfully set up with seed data.', FALSE, 'ADMIN', NULL, NOW());
