-- ============================================================
-- Student Complaint Management System — MySQL Schema
-- Run this BEFORE starting the Spring Boot backend
-- Database: student_complaints
-- ============================================================

-- Create database (Spring Boot can also do this automatically)
CREATE DATABASE IF NOT EXISTS student_complaints
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE student_complaints;

-- ============================================================
-- TABLE: users
-- Stores all system users (students, admins, staff)
-- ============================================================
CREATE TABLE IF NOT EXISTS users (
  id         BIGINT       NOT NULL AUTO_INCREMENT,
  name       VARCHAR(100) NOT NULL,
  email      VARCHAR(150) NOT NULL UNIQUE,
  password   VARCHAR(255) NOT NULL,        -- BCrypt encoded
  role       ENUM('STUDENT','ADMIN','STAFF') NOT NULL DEFAULT 'STUDENT',

  PRIMARY KEY (id),
  INDEX idx_users_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- TABLE: complaints
-- Stores all student complaints
-- ============================================================
CREATE TABLE IF NOT EXISTS complaints (
  id          BIGINT        NOT NULL AUTO_INCREMENT,
  title       VARCHAR(255)  NOT NULL,
  description TEXT          NOT NULL,
  category    ENUM('HOSTEL','ACADEMIC','TRANSPORT','IT_SUPPORT','OTHERS') NOT NULL,
  status      ENUM('PENDING','IN_PROGRESS','RESOLVED') NOT NULL DEFAULT 'PENDING',
  image_url   VARCHAR(500)  NULL,           -- Optional file attachment path
  user_id     BIGINT        NOT NULL,       -- Foreign key → users.id
  created_at  DATETIME(6)   NULL,
  updated_at  DATETIME(6)   NULL,

  PRIMARY KEY (id),
  CONSTRAINT fk_complaints_user
    FOREIGN KEY (user_id) REFERENCES users(id)
    ON DELETE CASCADE,                      -- Delete complaints when user is deleted
  INDEX idx_complaints_user   (user_id),
  INDEX idx_complaints_status (status),
  INDEX idx_complaints_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- TABLE: comments
-- Admin/staff can add comments to complaints
-- ============================================================
CREATE TABLE IF NOT EXISTS comments (
  id           BIGINT  NOT NULL AUTO_INCREMENT,
  content      TEXT    NOT NULL,
  complaint_id BIGINT  NOT NULL,
  user_id      BIGINT  NOT NULL,
  created_at   DATETIME(6) NULL,

  PRIMARY KEY (id),
  CONSTRAINT fk_comments_complaint
    FOREIGN KEY (complaint_id) REFERENCES complaints(id)
    ON DELETE CASCADE,
  CONSTRAINT fk_comments_user
    FOREIGN KEY (user_id) REFERENCES users(id)
    ON DELETE CASCADE,
  INDEX idx_comments_complaint (complaint_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- SAMPLE DATA
-- ============================================================
-- Note: Passwords are BCrypt-hashed. 
--   admin123   → $2a$10$...
--   student123 → $2a$10$...
-- The DataInitializer.java creates admin@example.com/admin123 automatically.
-- Below we add sample students and complaints for testing.

-- Sample Users (password = "student123" BCrypt hash)
INSERT IGNORE INTO users (name, email, password, role) VALUES
  ('Alice Johnson',  'alice@student.edu',   '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.', 'STUDENT'),
  ('Bob Williams',   'bob@student.edu',     '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.', 'STUDENT'),
  ('Carol Davis',    'carol@student.edu',   '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.', 'STUDENT'),
  ('Staff Member',   'staff@example.com',   '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.', 'STAFF');

-- Note: The admin (admin@example.com / admin123) is auto-created by DataInitializer.java

-- Sample Complaints
-- (These require users to exist first — run after user inserts)
-- Replace user_id values with actual IDs after user insert

/*
INSERT INTO complaints (title, description, category, status, user_id, created_at, updated_at) VALUES
  ('Hostel Wi-Fi not working',
   'The Wi-Fi in Block C hostel has been down for 3 days. This is affecting online studies.',
   'HOSTEL', 'PENDING', 2, NOW(), NOW()),

  ('Exam schedule conflict',
   'Two exams scheduled at the same time slot on 20th April. DBMS and OS both at 9 AM.',
   'ACADEMIC', 'IN_PROGRESS', 2, NOW() - INTERVAL 2 DAY, NOW()),

  ('College bus delayed daily',
   'Route 4 bus arrives 45 minutes late every day, causing students to miss first period.',
   'TRANSPORT', 'PENDING', 3, NOW() - INTERVAL 1 DAY, NOW() - INTERVAL 1 DAY),

  ('Library projector broken',
   'The projector in Reading Room 2 has not been working for a week.',
   'ACADEMIC', 'RESOLVED', 3, NOW() - INTERVAL 5 DAY, NOW() - INTERVAL 1 DAY),

  ('Lab computers very slow',
   'Computers in Lab 3 take 10+ minutes to boot. This wastes practical session time.',
   'IT_SUPPORT', 'IN_PROGRESS', 4, NOW() - INTERVAL 3 DAY, NOW());
*/

-- ============================================================
-- HOW TO USE THIS FILE:
-- 1. Open MySQL Workbench or run: mysql -u root -p < schema.sql
-- 2. Uncomment the sample INSERT statements above if you want test data
--    (replace user_id values with actual IDs after checking users table)
-- 3. Spring Boot JPA will auto-create/update tables based on entities
--    (spring.jpa.hibernate.ddl-auto=update in application.properties)
-- ============================================================
