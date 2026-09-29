-- Smart Student & Faculty Management System
-- Database Schema
-- MySQL 8.0

CREATE DATABASE IF NOT EXISTS smart_sms CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE smart_sms;

-- ─────────────────────────────────────────────────────────────────────
-- USERS
-- ─────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
    id            BIGINT AUTO_INCREMENT PRIMARY KEY,
    email         VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    first_name    VARCHAR(100) NOT NULL,
    last_name     VARCHAR(100) NOT NULL,
    phone         VARCHAR(20),
    role          ENUM('STUDENT','FACULTY','ADMIN') NOT NULL,
    active        BOOLEAN NOT NULL DEFAULT TRUE,
    created_at    DATETIME(6),
    updated_at    DATETIME(6),
    INDEX idx_users_email (email),
    INDEX idx_users_role  (role)
) ENGINE=InnoDB;

-- ─────────────────────────────────────────────────────────────────────
-- DEPARTMENTS
-- ─────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS departments (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    name            VARCHAR(150) NOT NULL UNIQUE,
    code            VARCHAR(20)  NOT NULL UNIQUE,
    head_faculty_id BIGINT,
    active          BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      DATETIME(6),
    INDEX idx_dept_code (code)
) ENGINE=InnoDB;

-- ─────────────────────────────────────────────────────────────────────
-- FACULTY
-- ─────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS faculty (
    id            BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id       BIGINT NOT NULL UNIQUE,
    faculty_code  VARCHAR(30) NOT NULL UNIQUE,
    department_id BIGINT NOT NULL,
    joined_date   DATE,
    active        BOOLEAN NOT NULL DEFAULT TRUE,
    created_at    DATETIME(6),
    FOREIGN KEY (user_id)       REFERENCES users(id),
    FOREIGN KEY (department_id) REFERENCES departments(id),
    INDEX idx_faculty_dept (department_id)
) ENGINE=InnoDB;

-- Add FK for department head after faculty table exists
ALTER TABLE departments ADD CONSTRAINT fk_dept_head
    FOREIGN KEY (head_faculty_id) REFERENCES faculty(id) ON DELETE SET NULL;

-- ─────────────────────────────────────────────────────────────────────
-- STUDENTS
-- ─────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS students (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id         BIGINT NOT NULL UNIQUE,
    student_code    VARCHAR(30) NOT NULL UNIQUE,
    department_id   BIGINT NOT NULL,
    semester        INT NOT NULL DEFAULT 1,
    enrollment_date DATE,
    active          BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      DATETIME(6),
    FOREIGN KEY (user_id)       REFERENCES users(id),
    FOREIGN KEY (department_id) REFERENCES departments(id),
    INDEX idx_student_dept     (department_id),
    INDEX idx_student_semester (semester)
) ENGINE=InnoDB;

-- ─────────────────────────────────────────────────────────────────────
-- SUBJECTS
-- ─────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS subjects (
    id            BIGINT AUTO_INCREMENT PRIMARY KEY,
    code          VARCHAR(20)  NOT NULL UNIQUE,
    name          VARCHAR(200) NOT NULL,
    credits       INT NOT NULL DEFAULT 3,
    department_id BIGINT NOT NULL,
    faculty_id    BIGINT,
    active        BOOLEAN NOT NULL DEFAULT TRUE,
    created_at    DATETIME(6),
    FOREIGN KEY (department_id) REFERENCES departments(id),
    FOREIGN KEY (faculty_id)    REFERENCES faculty(id) ON DELETE SET NULL,
    INDEX idx_subject_dept    (department_id),
    INDEX idx_subject_faculty (faculty_id)
) ENGINE=InnoDB;

-- ─────────────────────────────────────────────────────────────────────
-- TIMETABLE
-- ─────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS timetable (
    id           BIGINT AUTO_INCREMENT PRIMARY KEY,
    subject_id   BIGINT NOT NULL,
    faculty_id   BIGINT NOT NULL,
    class_name   VARCHAR(50) NOT NULL,
    room         VARCHAR(50) NOT NULL,
    day_of_week  ENUM('MONDAY','TUESDAY','WEDNESDAY','THURSDAY','FRIDAY','SATURDAY') NOT NULL,
    start_time   TIME NOT NULL,
    end_time     TIME NOT NULL,
    active       BOOLEAN NOT NULL DEFAULT TRUE,
    FOREIGN KEY (subject_id) REFERENCES subjects(id),
    FOREIGN KEY (faculty_id) REFERENCES faculty(id),
    INDEX idx_tt_faculty    (faculty_id),
    INDEX idx_tt_class      (class_name),
    INDEX idx_tt_day        (day_of_week)
) ENGINE=InnoDB;

-- ─────────────────────────────────────────────────────────────────────
-- ATTENDANCE SESSIONS
-- ─────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS attendance_sessions (
    id           BIGINT AUTO_INCREMENT PRIMARY KEY,
    faculty_id   BIGINT NOT NULL,
    subject_id   BIGINT NOT NULL,
    class_name   VARCHAR(50) NOT NULL,
    session_date DATE NOT NULL,
    qr_token     VARCHAR(500) UNIQUE,
    qr_expires_at DATETIME(6),
    session_type ENUM('MANUAL','QR') NOT NULL DEFAULT 'MANUAL',
    active       BOOLEAN NOT NULL DEFAULT TRUE,
    created_at   DATETIME(6),
    FOREIGN KEY (faculty_id) REFERENCES faculty(id),
    FOREIGN KEY (subject_id) REFERENCES subjects(id),
    INDEX idx_session_faculty (faculty_id),
    INDEX idx_session_subject (subject_id),
    INDEX idx_session_date    (session_date),
    INDEX idx_session_qr      (qr_token)
) ENGINE=InnoDB;

-- ─────────────────────────────────────────────────────────────────────
-- ATTENDANCE RECORDS
-- ─────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS attendance (
    id         BIGINT AUTO_INCREMENT PRIMARY KEY,
    student_id BIGINT NOT NULL,
    session_id BIGINT NOT NULL,
    status     ENUM('PRESENT','ABSENT','LATE') NOT NULL DEFAULT 'PRESENT',
    marked_at  DATETIME(6),
    created_at DATETIME(6),
    FOREIGN KEY (student_id) REFERENCES students(id),
    FOREIGN KEY (session_id) REFERENCES attendance_sessions(id),
    UNIQUE KEY uk_student_session (student_id, session_id),
    INDEX idx_att_student (student_id),
    INDEX idx_att_session (session_id)
) ENGINE=InnoDB;

-- ─────────────────────────────────────────────────────────────────────
-- ASSIGNMENTS
-- ─────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS assignments (
    id         BIGINT AUTO_INCREMENT PRIMARY KEY,
    faculty_id BIGINT NOT NULL,
    subject_id BIGINT NOT NULL,
    class_name VARCHAR(50) NOT NULL,
    title      VARCHAR(255) NOT NULL,
    description TEXT,
    due_date   DATE NOT NULL,
    max_marks  INT NOT NULL DEFAULT 100,
    active     BOOLEAN NOT NULL DEFAULT TRUE,
    created_at DATETIME(6),
    updated_at DATETIME(6),
    FOREIGN KEY (faculty_id) REFERENCES faculty(id),
    FOREIGN KEY (subject_id) REFERENCES subjects(id),
    INDEX idx_assign_faculty (faculty_id),
    INDEX idx_assign_subject (subject_id)
) ENGINE=InnoDB;

-- ─────────────────────────────────────────────────────────────────────
-- ASSIGNMENT SUBMISSIONS
-- ─────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS assignment_submissions (
    id                BIGINT AUTO_INCREMENT PRIMARY KEY,
    assignment_id     BIGINT NOT NULL,
    student_id        BIGINT NOT NULL,
    file_path         VARCHAR(500),
    original_filename VARCHAR(255),
    file_size         BIGINT,
    file_type         VARCHAR(50),
    notes             TEXT,
    submitted_at      DATETIME(6),
    marks             DOUBLE,
    feedback          TEXT,
    status            ENUM('SUBMITTED','LATE','GRADED') NOT NULL DEFAULT 'SUBMITTED',
    created_at        DATETIME(6),
    updated_at        DATETIME(6),
    FOREIGN KEY (assignment_id) REFERENCES assignments(id),
    FOREIGN KEY (student_id)    REFERENCES students(id),
    UNIQUE KEY uk_assignment_student (assignment_id, student_id),
    INDEX idx_sub_assignment (assignment_id),
    INDEX idx_sub_student    (student_id)
) ENGINE=InnoDB;

-- ─────────────────────────────────────────────────────────────────────
-- LEAVE APPLICATIONS
-- ─────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS leave_applications (
    id             BIGINT AUTO_INCREMENT PRIMARY KEY,
    student_id     BIGINT NOT NULL,
    start_date     DATE NOT NULL,
    end_date       DATE NOT NULL,
    reason         TEXT NOT NULL,
    status         ENUM('PENDING','APPROVED','REJECTED') NOT NULL DEFAULT 'PENDING',
    reviewed_by    BIGINT,
    reviewed_at    DATETIME(6),
    review_comment TEXT,
    created_at     DATETIME(6),
    updated_at     DATETIME(6),
    FOREIGN KEY (student_id)  REFERENCES students(id),
    FOREIGN KEY (reviewed_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_leave_student (student_id),
    INDEX idx_leave_status  (status)
) ENGINE=InnoDB;

-- ─────────────────────────────────────────────────────────────────────
-- GRADES
-- ─────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS grades (
    id               BIGINT AUTO_INCREMENT PRIMARY KEY,
    student_id       BIGINT NOT NULL,
    subject_id       BIGINT NOT NULL,
    internal_marks   DOUBLE,
    assignment_marks DOUBLE,
    exam_marks       DOUBLE,
    total_marks      DOUBLE,
    grade            VARCHAR(5),
    published        BOOLEAN NOT NULL DEFAULT FALSE,
    created_at       DATETIME(6),
    updated_at       DATETIME(6),
    FOREIGN KEY (student_id) REFERENCES students(id),
    FOREIGN KEY (subject_id) REFERENCES subjects(id),
    UNIQUE KEY uk_student_subject (student_id, subject_id),
    INDEX idx_grade_student (student_id),
    INDEX idx_grade_subject (subject_id),
    INDEX idx_grade_published (published)
) ENGINE=InnoDB;

-- ─────────────────────────────────────────────────────────────────────
-- NOTIFICATIONS
-- ─────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS notifications (
    id                  BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id             BIGINT NOT NULL,
    type                ENUM('INFO','SUCCESS','WARNING','ERROR') NOT NULL DEFAULT 'INFO',
    title               VARCHAR(255) NOT NULL,
    message             TEXT NOT NULL,
    read_status         BOOLEAN NOT NULL DEFAULT FALSE,
    related_entity_type VARCHAR(50),
    related_entity_id   BIGINT,
    created_at          DATETIME(6),
    FOREIGN KEY (user_id) REFERENCES users(id),
    INDEX idx_notif_user   (user_id),
    INDEX idx_notif_read   (user_id, read_status),
    INDEX idx_notif_entity (related_entity_type, related_entity_id)
) ENGINE=InnoDB;
