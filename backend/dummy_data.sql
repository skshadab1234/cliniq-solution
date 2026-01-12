-- ============================================
-- Clinic Solution - Dummy Data for Testing
-- Location: Mumbai, India
-- Date: January 2026
-- ============================================

-- Clear existing data (in correct order due to foreign keys)
TRUNCATE TABLE prescriptions CASCADE;
TRUNCATE TABLE tokens CASCADE;
TRUNCATE TABLE queues CASCADE;
TRUNCATE TABLE doctor_assistants CASCADE;
TRUNCATE TABLE clinic_doctors CASCADE;
TRUNCATE TABLE patients CASCADE;
TRUNCATE TABLE clinics CASCADE;
TRUNCATE TABLE users CASCADE;
TRUNCATE TABLE admins CASCADE;
TRUNCATE TABLE registration_requests CASCADE;

-- Reset sequences
ALTER SEQUENCE admins_id_seq RESTART WITH 1;
ALTER SEQUENCE users_id_seq RESTART WITH 1;
ALTER SEQUENCE clinics_id_seq RESTART WITH 1;
ALTER SEQUENCE clinic_doctors_id_seq RESTART WITH 1;
ALTER SEQUENCE doctor_assistants_id_seq RESTART WITH 1;
ALTER SEQUENCE patients_id_seq RESTART WITH 1;
ALTER SEQUENCE queues_id_seq RESTART WITH 1;
ALTER SEQUENCE tokens_id_seq RESTART WITH 1;
ALTER SEQUENCE prescriptions_id_seq RESTART WITH 1;
ALTER SEQUENCE registration_requests_id_seq RESTART WITH 1;

-- ============================================
-- ADMINS (password: admin123 - bcrypt hashed)
-- ============================================
INSERT INTO admins (id, email, password, name, "isActive", "createdAt", "updatedAt") VALUES
(1, 'admin@clinicsolution.in', '$2a$10$rQZ8K.5e5e5e5e5e5e5e5eOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOO', 'Rajesh Kumar', true, '2026-01-01 09:00:00', '2026-01-01 09:00:00'),
(2, 'superadmin@clinicsolution.in', '$2a$10$rQZ8K.5e5e5e5e5e5e5e5eOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOO', 'Priya Sharma', true, '2026-01-01 09:00:00', '2026-01-01 09:00:00');

-- ============================================
-- USERS (Doctors & Assistants)
-- ============================================
INSERT INTO users (id, "clerkId", name, email, phone, role, status, "createdAt", "updatedAt") VALUES
-- Doctors
(1, 'clerk_doc_001', 'Dr. Amit Deshmukh', 'amit.deshmukh@gmail.com', '+919820123456', 'doctor', 'approved', '2026-01-02 10:00:00', '2026-01-02 10:00:00'),
(2, 'clerk_doc_002', 'Dr. Sneha Patil', 'sneha.patil@gmail.com', '+919821234567', 'doctor', 'approved', '2026-01-02 10:30:00', '2026-01-02 10:30:00'),
(3, 'clerk_doc_003', 'Dr. Vikram Joshi', 'vikram.joshi@gmail.com', '+919822345678', 'doctor', 'approved', '2026-01-02 11:00:00', '2026-01-02 11:00:00'),
(4, 'clerk_doc_004', 'Dr. Meera Kulkarni', 'meera.kulkarni@gmail.com', '+919823456789', 'doctor', 'approved', '2026-01-03 09:00:00', '2026-01-03 09:00:00'),
(5, 'clerk_doc_005', 'Dr. Rahul Shah', 'rahul.shah@gmail.com', '+919824567890', 'doctor', 'pending', '2026-01-10 14:00:00', '2026-01-10 14:00:00'),
-- Assistants
(6, 'clerk_ast_001', 'Pooja Rane', 'pooja.rane@gmail.com', '+919825678901', 'assistant', 'approved', '2026-01-03 10:00:00', '2026-01-03 10:00:00'),
(7, 'clerk_ast_002', 'Sachin Mhatre', 'sachin.mhatre@gmail.com', '+919826789012', 'assistant', 'approved', '2026-01-03 10:30:00', '2026-01-03 10:30:00'),
(8, 'clerk_ast_003', 'Anita Pawar', 'anita.pawar@gmail.com', '+919827890123', 'assistant', 'approved', '2026-01-03 11:00:00', '2026-01-03 11:00:00'),
(9, 'clerk_ast_004', 'Ganesh Shinde', 'ganesh.shinde@gmail.com', '+919828901234', 'assistant', 'pending', '2026-01-11 09:00:00', '2026-01-11 09:00:00');

-- ============================================
-- CLINICS (Mumbai Locations)
-- ============================================
INSERT INTO clinics (id, name, address, phone, "openTime", "closeTime", "registrationNumber", "proofDocument", "ownerId", "createdAt", "updatedAt") VALUES
(1, 'Shree Ganesh Clinic', 'Shop No. 5, Govind Nagar, Borivali West, Mumbai - 400092', '+912228901234', '09:00:00', '21:00:00', 'MH/CLI/2025/001234', 'clinic_1_proof.pdf', 1, '2026-01-02 12:00:00', '2026-01-02 12:00:00'),
(2, 'Sai Healthcare Center', 'Ground Floor, Sai Complex, Andheri East, Mumbai - 400069', '+912226789012', '08:00:00', '20:00:00', 'MH/CLI/2025/001235', 'clinic_2_proof.pdf', 2, '2026-01-02 12:30:00', '2026-01-02 12:30:00'),
(3, 'Mumbai Family Clinic', '1st Floor, Rajhans Building, Dadar West, Mumbai - 400028', '+912224567890', '10:00:00', '22:00:00', 'MH/CLI/2025/001236', 'clinic_3_proof.pdf', 3, '2026-01-02 13:00:00', '2026-01-02 13:00:00'),
(4, 'Wellness Polyclinic', 'B-Wing, Shivaji Nagar, Kurla West, Mumbai - 400070', '+912225678901', '08:30:00', '19:30:00', 'MH/CLI/2025/001237', 'clinic_4_proof.pdf', 4, '2026-01-03 09:30:00', '2026-01-03 09:30:00'),
(5, 'Arogya Medical Center', 'Near Railway Station, Malad West, Mumbai - 400064', '+912228012345', '09:30:00', '20:30:00', 'MH/CLI/2025/001238', 'clinic_5_proof.pdf', 1, '2026-01-03 10:00:00', '2026-01-03 10:00:00');

-- ============================================
-- CLINIC_DOCTORS (Doctor-Clinic Assignments)
-- ============================================
INSERT INTO clinic_doctors (id, "clinicId", "userId", "isActive", "createdAt", "updatedAt") VALUES
(1, 1, 1, true, '2026-01-03 09:00:00', '2026-01-03 09:00:00'),  -- Dr. Amit @ Shree Ganesh
(2, 2, 1, true, '2026-01-03 09:00:00', '2026-01-03 09:00:00'),  -- Dr. Amit @ Sai Healthcare (visits both)
(3, 2, 2, true, '2026-01-03 09:30:00', '2026-01-03 09:30:00'),  -- Dr. Sneha @ Sai Healthcare
(4, 3, 3, true, '2026-01-03 10:00:00', '2026-01-03 10:00:00'),  -- Dr. Vikram @ Mumbai Family
(5, 4, 4, true, '2026-01-03 10:30:00', '2026-01-03 10:30:00'),  -- Dr. Meera @ Wellness
(6, 5, 3, true, '2026-01-03 11:00:00', '2026-01-03 11:00:00'),  -- Dr. Vikram @ Arogya (visits both)
(7, 1, 4, true, '2026-01-04 09:00:00', '2026-01-04 09:00:00');  -- Dr. Meera @ Shree Ganesh (evening)

-- ============================================
-- DOCTOR_ASSISTANTS (Assistant Assignments)
-- ============================================
INSERT INTO doctor_assistants (id, "doctorId", "assistantId", "isActive", "createdAt", "updatedAt") VALUES
(1, 1, 6, true, '2026-01-03 11:00:00', '2026-01-03 11:00:00'),  -- Pooja helps Dr. Amit
(2, 2, 6, true, '2026-01-03 11:00:00', '2026-01-03 11:00:00'),  -- Pooja also helps Dr. Sneha
(3, 3, 7, true, '2026-01-03 11:30:00', '2026-01-03 11:30:00'),  -- Sachin helps Dr. Vikram
(4, 4, 8, true, '2026-01-03 12:00:00', '2026-01-03 12:00:00');  -- Anita helps Dr. Meera

-- ============================================
-- PATIENTS (Mumbai Residents)
-- ============================================
INSERT INTO patients (id, name, phone, "createdAt", "updatedAt") VALUES
(1, 'Ramesh Yadav', '+919930123456', '2026-01-05 09:00:00', '2026-01-05 09:00:00'),
(2, 'Sunita Gupta', '+919931234567', '2026-01-05 09:15:00', '2026-01-05 09:15:00'),
(3, 'Mohammed Khan', '+919932345678', '2026-01-05 09:30:00', '2026-01-05 09:30:00'),
(4, 'Lakshmi Iyer', '+919933456789', '2026-01-05 09:45:00', '2026-01-05 09:45:00'),
(5, 'Vijay Sawant', '+919934567890', '2026-01-05 10:00:00', '2026-01-05 10:00:00'),
(6, 'Fatima Sheikh', '+919935678901', '2026-01-05 10:15:00', '2026-01-05 10:15:00'),
(7, 'Ganesh Naik', '+919936789012', '2026-01-05 10:30:00', '2026-01-05 10:30:00'),
(8, 'Prerna Mehta', '+919937890123', '2026-01-06 09:00:00', '2026-01-06 09:00:00'),
(9, 'Arjun Shetty', '+919938901234', '2026-01-06 09:15:00', '2026-01-06 09:15:00'),
(10, 'Kavita Thakur', '+919939012345', '2026-01-06 09:30:00', '2026-01-06 09:30:00'),
(11, 'Rajendra Salvi', '+919940123456', '2026-01-07 10:00:00', '2026-01-07 10:00:00'),
(12, 'Nandini Bhatt', '+919941234567', '2026-01-07 10:15:00', '2026-01-07 10:15:00'),
(13, 'Imran Patel', '+919942345678', '2026-01-08 09:00:00', '2026-01-08 09:00:00'),
(14, 'Deepika More', '+919943456789', '2026-01-08 09:15:00', '2026-01-08 09:15:00'),
(15, 'Santosh Kamble', '+919944567890', '2026-01-09 10:00:00', '2026-01-09 10:00:00'),
(16, 'Reshma Shaikh', '+919945678901', '2026-01-09 10:15:00', '2026-01-09 10:15:00'),
(17, 'Prakash Dalvi', '+919946789012', '2026-01-10 09:30:00', '2026-01-10 09:30:00'),
(18, 'Anjali Deshpande', '+919947890123', '2026-01-10 09:45:00', '2026-01-10 09:45:00'),
(19, 'Ravi Kondhalkar', '+919948901234', '2026-01-11 10:00:00', '2026-01-11 10:00:00'),
(20, 'Shalini Verma', '+919949012345', '2026-01-11 10:15:00', '2026-01-11 10:15:00');

-- ============================================
-- QUEUES (January 2026 - Recent Dates)
-- ============================================
INSERT INTO queues (id, "clinicId", "doctorId", date, status, "currentTokenId", "lastTokenNumber", "createdAt", "updatedAt") VALUES
-- Jan 10, 2026 (Past - Closed)
(1, 1, 1, '2026-01-10', 'closed', NULL, 8, '2026-01-10 09:00:00', '2026-01-10 21:00:00'),
(2, 2, 2, '2026-01-10', 'closed', NULL, 10, '2026-01-10 08:00:00', '2026-01-10 20:00:00'),
(3, 3, 3, '2026-01-10', 'closed', NULL, 6, '2026-01-10 10:00:00', '2026-01-10 22:00:00'),

-- Jan 11, 2026 (Yesterday - Closed)
(4, 1, 1, '2026-01-11', 'closed', NULL, 9, '2026-01-11 09:00:00', '2026-01-11 21:00:00'),
(5, 2, 2, '2026-01-11', 'closed', NULL, 12, '2026-01-11 08:00:00', '2026-01-11 20:00:00'),
(6, 4, 4, '2026-01-11', 'closed', NULL, 7, '2026-01-11 08:30:00', '2026-01-11 19:30:00'),

-- Jan 12, 2026 (Today - Active)
(7, 1, 1, '2026-01-12', 'open', 52, 6, '2026-01-12 09:00:00', '2026-01-12 12:30:00'),
(8, 2, 2, '2026-01-12', 'open', 58, 5, '2026-01-12 08:00:00', '2026-01-12 11:45:00'),
(9, 3, 3, '2026-01-12', 'paused', NULL, 4, '2026-01-12 10:00:00', '2026-01-12 13:00:00'),
(10, 4, 4, '2026-01-12', 'open', 66, 5, '2026-01-12 08:30:00', '2026-01-12 12:00:00');

-- ============================================
-- TOKENS (Queue Entries)
-- ============================================
INSERT INTO tokens (id, "queueId", "patientId", "tokenNumber", status, "isEmergency", position, "calledAt", "startedAt", "completedAt", "createdAt", "updatedAt") VALUES
-- Queue 1 (Jan 10 - Dr. Amit @ Shree Ganesh) - All completed
(1, 1, 1, 1, 'completed', false, 1, '2026-01-10 09:30:00', '2026-01-10 09:32:00', '2026-01-10 09:50:00', '2026-01-10 09:10:00', '2026-01-10 09:50:00'),
(2, 1, 2, 2, 'completed', false, 2, '2026-01-10 09:50:00', '2026-01-10 09:52:00', '2026-01-10 10:15:00', '2026-01-10 09:15:00', '2026-01-10 10:15:00'),
(3, 1, 3, 3, 'completed', true, 3, '2026-01-10 10:15:00', '2026-01-10 10:16:00', '2026-01-10 10:40:00', '2026-01-10 09:20:00', '2026-01-10 10:40:00'),
(4, 1, 4, 4, 'completed', false, 4, '2026-01-10 10:40:00', '2026-01-10 10:42:00', '2026-01-10 11:00:00', '2026-01-10 09:25:00', '2026-01-10 11:00:00'),
(5, 1, 5, 5, 'no_show', false, 5, '2026-01-10 11:00:00', NULL, NULL, '2026-01-10 09:30:00', '2026-01-10 11:10:00'),
(6, 1, 6, 6, 'completed', false, 6, '2026-01-10 11:10:00', '2026-01-10 11:12:00', '2026-01-10 11:30:00', '2026-01-10 09:35:00', '2026-01-10 11:30:00'),
(7, 1, 7, 7, 'completed', false, 7, '2026-01-10 11:30:00', '2026-01-10 11:32:00', '2026-01-10 11:55:00', '2026-01-10 10:00:00', '2026-01-10 11:55:00'),
(8, 1, 8, 8, 'completed', false, 8, '2026-01-10 11:55:00', '2026-01-10 11:58:00', '2026-01-10 12:20:00', '2026-01-10 10:30:00', '2026-01-10 12:20:00'),

-- Queue 2 (Jan 10 - Dr. Sneha @ Sai Healthcare) - All completed
(9, 2, 9, 1, 'completed', false, 1, '2026-01-10 08:30:00', '2026-01-10 08:32:00', '2026-01-10 08:55:00', '2026-01-10 08:10:00', '2026-01-10 08:55:00'),
(10, 2, 10, 2, 'completed', false, 2, '2026-01-10 08:55:00', '2026-01-10 08:58:00', '2026-01-10 09:20:00', '2026-01-10 08:15:00', '2026-01-10 09:20:00'),
(11, 2, 11, 3, 'completed', false, 3, '2026-01-10 09:20:00', '2026-01-10 09:22:00', '2026-01-10 09:45:00', '2026-01-10 08:20:00', '2026-01-10 09:45:00'),
(12, 2, 12, 4, 'completed', true, 4, '2026-01-10 09:45:00', '2026-01-10 09:46:00', '2026-01-10 10:15:00', '2026-01-10 08:25:00', '2026-01-10 10:15:00'),
(13, 2, 13, 5, 'completed', false, 5, '2026-01-10 10:15:00', '2026-01-10 10:18:00', '2026-01-10 10:40:00', '2026-01-10 08:30:00', '2026-01-10 10:40:00'),
(14, 2, 14, 6, 'skipped', false, 6, '2026-01-10 10:40:00', NULL, NULL, '2026-01-10 08:35:00', '2026-01-10 10:50:00'),
(15, 2, 15, 7, 'completed', false, 7, '2026-01-10 10:50:00', '2026-01-10 10:52:00', '2026-01-10 11:15:00', '2026-01-10 08:40:00', '2026-01-10 11:15:00'),
(16, 2, 16, 8, 'completed', false, 8, '2026-01-10 11:15:00', '2026-01-10 11:18:00', '2026-01-10 11:40:00', '2026-01-10 09:00:00', '2026-01-10 11:40:00'),
(17, 2, 17, 9, 'completed', false, 9, '2026-01-10 11:40:00', '2026-01-10 11:42:00', '2026-01-10 12:05:00', '2026-01-10 09:30:00', '2026-01-10 12:05:00'),
(18, 2, 18, 10, 'completed', false, 10, '2026-01-10 12:05:00', '2026-01-10 12:08:00', '2026-01-10 12:30:00', '2026-01-10 10:00:00', '2026-01-10 12:30:00'),

-- Queue 3 (Jan 10 - Dr. Vikram @ Mumbai Family)
(19, 3, 19, 1, 'completed', false, 1, '2026-01-10 10:30:00', '2026-01-10 10:32:00', '2026-01-10 10:55:00', '2026-01-10 10:10:00', '2026-01-10 10:55:00'),
(20, 3, 20, 2, 'completed', false, 2, '2026-01-10 10:55:00', '2026-01-10 10:58:00', '2026-01-10 11:20:00', '2026-01-10 10:15:00', '2026-01-10 11:20:00'),
(21, 3, 1, 3, 'completed', false, 3, '2026-01-10 11:20:00', '2026-01-10 11:22:00', '2026-01-10 11:45:00', '2026-01-10 10:20:00', '2026-01-10 11:45:00'),
(22, 3, 2, 4, 'completed', false, 4, '2026-01-10 11:45:00', '2026-01-10 11:48:00', '2026-01-10 12:10:00', '2026-01-10 10:30:00', '2026-01-10 12:10:00'),
(23, 3, 3, 5, 'completed', false, 5, '2026-01-10 12:10:00', '2026-01-10 12:12:00', '2026-01-10 12:35:00', '2026-01-10 11:00:00', '2026-01-10 12:35:00'),
(24, 3, 4, 6, 'completed', false, 6, '2026-01-10 12:35:00', '2026-01-10 12:38:00', '2026-01-10 13:00:00', '2026-01-10 11:30:00', '2026-01-10 13:00:00'),

-- Queue 4 (Jan 11 - Dr. Amit @ Shree Ganesh)
(25, 4, 5, 1, 'completed', false, 1, '2026-01-11 09:30:00', '2026-01-11 09:32:00', '2026-01-11 09:55:00', '2026-01-11 09:10:00', '2026-01-11 09:55:00'),
(26, 4, 6, 2, 'completed', false, 2, '2026-01-11 09:55:00', '2026-01-11 09:58:00', '2026-01-11 10:20:00', '2026-01-11 09:15:00', '2026-01-11 10:20:00'),
(27, 4, 7, 3, 'completed', true, 3, '2026-01-11 10:20:00', '2026-01-11 10:21:00', '2026-01-11 10:50:00', '2026-01-11 09:20:00', '2026-01-11 10:50:00'),
(28, 4, 8, 4, 'completed', false, 4, '2026-01-11 10:50:00', '2026-01-11 10:52:00', '2026-01-11 11:15:00', '2026-01-11 09:25:00', '2026-01-11 11:15:00'),
(29, 4, 9, 5, 'completed', false, 5, '2026-01-11 11:15:00', '2026-01-11 11:18:00', '2026-01-11 11:40:00', '2026-01-11 09:30:00', '2026-01-11 11:40:00'),
(30, 4, 10, 6, 'completed', false, 6, '2026-01-11 11:40:00', '2026-01-11 11:42:00', '2026-01-11 12:05:00', '2026-01-11 09:40:00', '2026-01-11 12:05:00'),
(31, 4, 11, 7, 'cancelled', false, 7, NULL, NULL, NULL, '2026-01-11 10:00:00', '2026-01-11 10:30:00'),
(32, 4, 12, 8, 'completed', false, 8, '2026-01-11 12:05:00', '2026-01-11 12:08:00', '2026-01-11 12:30:00', '2026-01-11 10:30:00', '2026-01-11 12:30:00'),
(33, 4, 13, 9, 'completed', false, 9, '2026-01-11 12:30:00', '2026-01-11 12:32:00', '2026-01-11 12:55:00', '2026-01-11 11:00:00', '2026-01-11 12:55:00'),

-- Queue 5 (Jan 11 - Dr. Sneha @ Sai Healthcare)
(34, 5, 14, 1, 'completed', false, 1, '2026-01-11 08:30:00', '2026-01-11 08:32:00', '2026-01-11 08:55:00', '2026-01-11 08:10:00', '2026-01-11 08:55:00'),
(35, 5, 15, 2, 'completed', false, 2, '2026-01-11 08:55:00', '2026-01-11 08:58:00', '2026-01-11 09:20:00', '2026-01-11 08:15:00', '2026-01-11 09:20:00'),
(36, 5, 16, 3, 'completed', false, 3, '2026-01-11 09:20:00', '2026-01-11 09:22:00', '2026-01-11 09:45:00', '2026-01-11 08:20:00', '2026-01-11 09:45:00'),
(37, 5, 17, 4, 'completed', false, 4, '2026-01-11 09:45:00', '2026-01-11 09:48:00', '2026-01-11 10:10:00', '2026-01-11 08:25:00', '2026-01-11 10:10:00'),
(38, 5, 18, 5, 'completed', false, 5, '2026-01-11 10:10:00', '2026-01-11 10:12:00', '2026-01-11 10:35:00', '2026-01-11 08:30:00', '2026-01-11 10:35:00'),
(39, 5, 19, 6, 'completed', false, 6, '2026-01-11 10:35:00', '2026-01-11 10:38:00', '2026-01-11 11:00:00', '2026-01-11 08:40:00', '2026-01-11 11:00:00'),
(40, 5, 20, 7, 'completed', false, 7, '2026-01-11 11:00:00', '2026-01-11 11:02:00', '2026-01-11 11:25:00', '2026-01-11 09:00:00', '2026-01-11 11:25:00'),
(41, 5, 1, 8, 'completed', false, 8, '2026-01-11 11:25:00', '2026-01-11 11:28:00', '2026-01-11 11:50:00', '2026-01-11 09:30:00', '2026-01-11 11:50:00'),
(42, 5, 2, 9, 'completed', false, 9, '2026-01-11 11:50:00', '2026-01-11 11:52:00', '2026-01-11 12:15:00', '2026-01-11 10:00:00', '2026-01-11 12:15:00'),
(43, 5, 3, 10, 'completed', true, 10, '2026-01-11 12:15:00', '2026-01-11 12:16:00', '2026-01-11 12:45:00', '2026-01-11 10:30:00', '2026-01-11 12:45:00'),
(44, 5, 4, 11, 'completed', false, 11, '2026-01-11 12:45:00', '2026-01-11 12:48:00', '2026-01-11 13:10:00', '2026-01-11 11:00:00', '2026-01-11 13:10:00'),
(45, 5, 5, 12, 'completed', false, 12, '2026-01-11 13:10:00', '2026-01-11 13:12:00', '2026-01-11 13:35:00', '2026-01-11 11:30:00', '2026-01-11 13:35:00'),

-- Queue 6 (Jan 11 - Dr. Meera @ Wellness)
(46, 6, 6, 1, 'completed', false, 1, '2026-01-11 09:00:00', '2026-01-11 09:02:00', '2026-01-11 09:25:00', '2026-01-11 08:40:00', '2026-01-11 09:25:00'),
(47, 6, 7, 2, 'completed', false, 2, '2026-01-11 09:25:00', '2026-01-11 09:28:00', '2026-01-11 09:50:00', '2026-01-11 08:45:00', '2026-01-11 09:50:00'),
(48, 6, 8, 3, 'completed', false, 3, '2026-01-11 09:50:00', '2026-01-11 09:52:00', '2026-01-11 10:15:00', '2026-01-11 08:50:00', '2026-01-11 10:15:00'),
(49, 6, 9, 4, 'completed', false, 4, '2026-01-11 10:15:00', '2026-01-11 10:18:00', '2026-01-11 10:40:00', '2026-01-11 09:00:00', '2026-01-11 10:40:00'),
(50, 6, 10, 5, 'completed', false, 5, '2026-01-11 10:40:00', '2026-01-11 10:42:00', '2026-01-11 11:05:00', '2026-01-11 09:15:00', '2026-01-11 11:05:00'),
(51, 6, 11, 6, 'no_show', false, 6, '2026-01-11 11:05:00', NULL, NULL, '2026-01-11 09:30:00', '2026-01-11 11:15:00'),

-- Queue 7 (Jan 12 - TODAY - Dr. Amit @ Shree Ganesh) - Active
(52, 7, 12, 1, 'completed', false, 1, '2026-01-12 09:30:00', '2026-01-12 09:32:00', '2026-01-12 09:55:00', '2026-01-12 09:10:00', '2026-01-12 09:55:00'),
(53, 7, 13, 2, 'completed', false, 2, '2026-01-12 09:55:00', '2026-01-12 09:58:00', '2026-01-12 10:20:00', '2026-01-12 09:15:00', '2026-01-12 10:20:00'),
(54, 7, 14, 3, 'in_progress', false, 3, '2026-01-12 10:20:00', '2026-01-12 10:22:00', NULL, '2026-01-12 09:20:00', '2026-01-12 10:22:00'),
(55, 7, 15, 4, 'called', false, 4, '2026-01-12 10:35:00', NULL, NULL, '2026-01-12 09:25:00', '2026-01-12 10:35:00'),
(56, 7, 16, 5, 'waiting', false, 5, NULL, NULL, NULL, '2026-01-12 09:30:00', '2026-01-12 09:30:00'),
(57, 7, 17, 6, 'waiting', true, 6, NULL, NULL, NULL, '2026-01-12 10:00:00', '2026-01-12 10:00:00'),

-- Queue 8 (Jan 12 - TODAY - Dr. Sneha @ Sai Healthcare) - Active
(58, 8, 18, 1, 'completed', false, 1, '2026-01-12 08:30:00', '2026-01-12 08:32:00', '2026-01-12 08:55:00', '2026-01-12 08:10:00', '2026-01-12 08:55:00'),
(59, 8, 19, 2, 'completed', false, 2, '2026-01-12 08:55:00', '2026-01-12 08:58:00', '2026-01-12 09:20:00', '2026-01-12 08:15:00', '2026-01-12 09:20:00'),
(60, 8, 20, 3, 'in_progress', false, 3, '2026-01-12 09:20:00', '2026-01-12 09:22:00', NULL, '2026-01-12 08:20:00', '2026-01-12 09:22:00'),
(61, 8, 1, 4, 'waiting', false, 4, NULL, NULL, NULL, '2026-01-12 08:30:00', '2026-01-12 08:30:00'),
(62, 8, 2, 5, 'waiting', false, 5, NULL, NULL, NULL, '2026-01-12 09:00:00', '2026-01-12 09:00:00'),

-- Queue 9 (Jan 12 - TODAY - Dr. Vikram @ Mumbai Family) - Paused for lunch
(63, 9, 3, 1, 'completed', false, 1, '2026-01-12 10:30:00', '2026-01-12 10:32:00', '2026-01-12 10:55:00', '2026-01-12 10:10:00', '2026-01-12 10:55:00'),
(64, 9, 4, 2, 'completed', false, 2, '2026-01-12 10:55:00', '2026-01-12 10:58:00', '2026-01-12 11:20:00', '2026-01-12 10:15:00', '2026-01-12 11:20:00'),
(65, 9, 5, 3, 'waiting', false, 3, NULL, NULL, NULL, '2026-01-12 10:30:00', '2026-01-12 10:30:00'),
(66, 9, 6, 4, 'waiting', false, 4, NULL, NULL, NULL, '2026-01-12 11:00:00', '2026-01-12 11:00:00'),

-- Queue 10 (Jan 12 - TODAY - Dr. Meera @ Wellness) - Active
(67, 10, 7, 1, 'completed', false, 1, '2026-01-12 09:00:00', '2026-01-12 09:02:00', '2026-01-12 09:25:00', '2026-01-12 08:40:00', '2026-01-12 09:25:00'),
(68, 10, 8, 2, 'completed', false, 2, '2026-01-12 09:25:00', '2026-01-12 09:28:00', '2026-01-12 09:50:00', '2026-01-12 08:45:00', '2026-01-12 09:50:00'),
(69, 10, 9, 3, 'in_progress', true, 3, '2026-01-12 09:50:00', '2026-01-12 09:51:00', NULL, '2026-01-12 08:50:00', '2026-01-12 09:51:00'),
(70, 10, 10, 4, 'waiting', false, 4, NULL, NULL, NULL, '2026-01-12 09:00:00', '2026-01-12 09:00:00'),
(71, 10, 11, 5, 'waiting', false, 5, NULL, NULL, NULL, '2026-01-12 09:30:00', '2026-01-12 09:30:00');

-- Update queue currentTokenId for today's active queues
UPDATE queues SET "currentTokenId" = 54 WHERE id = 7;
UPDATE queues SET "currentTokenId" = 60 WHERE id = 8;
UPDATE queues SET "currentTokenId" = 69 WHERE id = 10;

-- ============================================
-- PRESCRIPTIONS
-- ============================================
INSERT INTO prescriptions (id, "tokenId", "patientId", "doctorId", medicines, notes, "sentViaWhatsApp", "createdAt", "updatedAt") VALUES
-- Dr. Amit's prescriptions
(1, 1, 1, 1, '[{"name": "Paracetamol 500mg", "dosage": "1-0-1", "duration": "5 days", "instructions": "After meals"}, {"name": "Cetirizine 10mg", "dosage": "0-0-1", "duration": "3 days", "instructions": "At bedtime"}]', 'Viral fever with cold. Rest recommended.', true, '2026-01-10 09:50:00', '2026-01-10 09:50:00'),
(2, 2, 2, 1, '[{"name": "Omeprazole 20mg", "dosage": "1-0-0", "duration": "7 days", "instructions": "Before breakfast"}, {"name": "Domperidone 10mg", "dosage": "1-1-1", "duration": "5 days", "instructions": "Before meals"}]', 'Acidity and gastric issues. Avoid spicy food.', true, '2026-01-10 10:15:00', '2026-01-10 10:15:00'),
(3, 3, 3, 1, '[{"name": "Azithromycin 500mg", "dosage": "1-0-0", "duration": "3 days", "instructions": "After breakfast"}, {"name": "Montelukast 10mg", "dosage": "0-0-1", "duration": "7 days", "instructions": "At bedtime"}, {"name": "Levocetrizine 5mg", "dosage": "0-0-1", "duration": "5 days", "instructions": "At bedtime"}]', 'Respiratory infection. Emergency case - high fever.', true, '2026-01-10 10:40:00', '2026-01-10 10:40:00'),
(4, 4, 4, 1, '[{"name": "Metformin 500mg", "dosage": "1-0-1", "duration": "30 days", "instructions": "After meals"}]', 'Diabetes follow-up. Blood sugar well controlled.', false, '2026-01-10 11:00:00', '2026-01-10 11:00:00'),

-- Dr. Sneha's prescriptions
(5, 9, 9, 2, '[{"name": "Amoxicillin 500mg", "dosage": "1-1-1", "duration": "5 days", "instructions": "After meals"}, {"name": "Ibuprofen 400mg", "dosage": "1-0-1", "duration": "3 days", "instructions": "After meals, for pain"}]', 'Throat infection with fever.', true, '2026-01-10 08:55:00', '2026-01-10 08:55:00'),
(6, 10, 10, 2, '[{"name": "Vitamin D3 60K", "dosage": "Once weekly", "duration": "8 weeks", "instructions": "After breakfast"}, {"name": "Calcium 500mg", "dosage": "0-0-1", "duration": "30 days", "instructions": "After dinner"}]', 'Vitamin D deficiency. Needs sun exposure.', true, '2026-01-10 09:20:00', '2026-01-10 09:20:00'),
(7, 11, 11, 2, '[{"name": "Amlodipine 5mg", "dosage": "1-0-0", "duration": "30 days", "instructions": "Morning empty stomach"}]', 'Hypertension. Regular BP monitoring advised.', true, '2026-01-10 09:45:00', '2026-01-10 09:45:00'),
(8, 12, 12, 2, '[{"name": "Prednisolone 10mg", "dosage": "1-1-1", "duration": "5 days", "instructions": "After meals"}, {"name": "Salbutamol inhaler", "dosage": "2 puffs SOS", "duration": "As needed", "instructions": "For breathlessness"}]', 'Emergency - Asthma attack. Immediate treatment given.', true, '2026-01-10 10:15:00', '2026-01-10 10:15:00'),

-- Dr. Vikram's prescriptions
(9, 19, 19, 3, '[{"name": "Dolo 650", "dosage": "1-1-1", "duration": "3 days", "instructions": "After meals, for fever"}, {"name": "ORS sachets", "dosage": "2 liters daily", "duration": "3 days", "instructions": "Mix in water"}]', 'Dengue suspected. Needs CBC test.', true, '2026-01-10 10:55:00', '2026-01-10 10:55:00'),
(10, 20, 20, 3, '[{"name": "Pantoprazole 40mg", "dosage": "1-0-0", "duration": "14 days", "instructions": "Before breakfast"}, {"name": "Sucralfate syrup", "dosage": "10ml x 4", "duration": "14 days", "instructions": "Before meals"}]', 'GERD with esophagitis. Endoscopy recommended.', true, '2026-01-10 11:20:00', '2026-01-10 11:20:00'),

-- Dr. Meera's prescriptions
(11, 46, 6, 4, '[{"name": "Thyronorm 50mcg", "dosage": "1-0-0", "duration": "30 days", "instructions": "Empty stomach, 30 min before breakfast"}]', 'Hypothyroidism. TSH follow-up after 6 weeks.', true, '2026-01-11 09:25:00', '2026-01-11 09:25:00'),
(12, 47, 7, 4, '[{"name": "Atorvastatin 10mg", "dosage": "0-0-1", "duration": "30 days", "instructions": "After dinner"}, {"name": "Ecosprin 75mg", "dosage": "0-1-0", "duration": "30 days", "instructions": "After lunch"}]', 'Dyslipidemia with cardiac risk. Diet modification needed.', true, '2026-01-11 09:50:00', '2026-01-11 09:50:00'),

-- Today's prescriptions (completed patients)
(13, 52, 12, 1, '[{"name": "Cefixime 200mg", "dosage": "1-0-1", "duration": "5 days", "instructions": "After meals"}, {"name": "Allegra 120mg", "dosage": "0-0-1", "duration": "5 days", "instructions": "After dinner"}]', 'UTI with allergic rhinitis.', true, '2026-01-12 09:55:00', '2026-01-12 09:55:00'),
(14, 53, 13, 1, '[{"name": "Metrogyl 400mg", "dosage": "1-1-1", "duration": "5 days", "instructions": "After meals"}, {"name": "Norflox 400mg", "dosage": "1-0-1", "duration": "5 days", "instructions": "After meals"}]', 'Gastroenteritis. Plenty of fluids.', true, '2026-01-12 10:20:00', '2026-01-12 10:20:00'),
(15, 58, 18, 2, '[{"name": "Combiflam", "dosage": "1-0-1", "duration": "3 days", "instructions": "After meals, for pain"}, {"name": "Cyclopam", "dosage": "1-0-1", "duration": "3 days", "instructions": "For abdominal cramps"}]', 'Menstrual cramps and body ache.', true, '2026-01-12 08:55:00', '2026-01-12 08:55:00'),
(16, 59, 19, 2, '[{"name": "Rantac 150mg", "dosage": "1-0-1", "duration": "10 days", "instructions": "Before meals"}, {"name": "Mucaine gel", "dosage": "10ml x 3", "duration": "7 days", "instructions": "Before meals"}]', 'Peptic ulcer. Avoid NSAIDs.', true, '2026-01-12 09:20:00', '2026-01-12 09:20:00'),
(17, 63, 3, 3, '[{"name": "Avil 25mg", "dosage": "1-0-1", "duration": "5 days", "instructions": "After meals"}, {"name": "Betadine gargle", "dosage": "3 times daily", "duration": "5 days", "instructions": "Dilute in warm water"}]', 'Allergic pharyngitis.', true, '2026-01-12 10:55:00', '2026-01-12 10:55:00'),
(18, 64, 4, 3, '[{"name": "Dexona 0.5mg", "dosage": "1-0-0", "duration": "3 days", "instructions": "After breakfast"}, {"name": "Flexon MR", "dosage": "1-0-1", "duration": "5 days", "instructions": "After meals"}]', 'Acute lower back pain. Physiotherapy advised.', true, '2026-01-12 11:20:00', '2026-01-12 11:20:00'),
(19, 67, 7, 4, '[{"name": "Glycomet 500mg", "dosage": "1-0-1", "duration": "30 days", "instructions": "After meals"}, {"name": "Telmisartan 40mg", "dosage": "1-0-0", "duration": "30 days", "instructions": "Morning"}]', 'Diabetes with hypertension. Regular monitoring.', true, '2026-01-12 09:25:00', '2026-01-12 09:25:00'),
(20, 68, 8, 4, '[{"name": "Montair LC", "dosage": "0-0-1", "duration": "14 days", "instructions": "At bedtime"}, {"name": "Asthalin inhaler", "dosage": "2 puffs SOS", "duration": "As needed", "instructions": "For wheezing"}]', 'Allergic bronchitis. Avoid dust and smoke.', true, '2026-01-12 09:50:00', '2026-01-12 09:50:00');

-- ============================================
-- REGISTRATION REQUESTS
-- ============================================
INSERT INTO registration_requests (id, name, email, phone, status, "createdAt", "updatedAt") VALUES
(1, 'Dr. Prashant Jain', 'prashant.jain@gmail.com', '+919850123456', 'pending', '2026-01-11 14:00:00', '2026-01-11 14:00:00'),
(2, 'Dr. Kaveri Nair', 'kaveri.nair@gmail.com', '+919851234567', 'pending', '2026-01-11 15:30:00', '2026-01-11 15:30:00'),
(3, 'Dr. Aryan Malhotra', 'aryan.malhotra@gmail.com', '+919852345678', 'approved', '2026-01-09 10:00:00', '2026-01-10 09:00:00'),
(4, 'Dr. Simran Kaur', 'simran.kaur@gmail.com', '+919853456789', 'rejected', '2026-01-08 11:00:00', '2026-01-09 10:00:00'),
(5, 'Dr. Nikhil Patel', 'nikhil.patel@gmail.com', '+919854567890', 'pending', '2026-01-12 09:00:00', '2026-01-12 09:00:00');

-- ============================================
-- Update sequences to continue from last ID
-- ============================================
SELECT setval('admins_id_seq', (SELECT MAX(id) FROM admins));
SELECT setval('users_id_seq', (SELECT MAX(id) FROM users));
SELECT setval('clinics_id_seq', (SELECT MAX(id) FROM clinics));
SELECT setval('clinic_doctors_id_seq', (SELECT MAX(id) FROM clinic_doctors));
SELECT setval('doctor_assistants_id_seq', (SELECT MAX(id) FROM doctor_assistants));
SELECT setval('patients_id_seq', (SELECT MAX(id) FROM patients));
SELECT setval('queues_id_seq', (SELECT MAX(id) FROM queues));
SELECT setval('tokens_id_seq', (SELECT MAX(id) FROM tokens));
SELECT setval('prescriptions_id_seq', (SELECT MAX(id) FROM prescriptions));
SELECT setval('registration_requests_id_seq', (SELECT MAX(id) FROM registration_requests));

-- ============================================
-- Summary:
-- - 2 Admins
-- - 9 Users (5 doctors + 4 assistants)
-- - 5 Clinics (Mumbai locations)
-- - 7 Clinic-Doctor assignments
-- - 4 Doctor-Assistant assignments
-- - 20 Patients
-- - 10 Queues (3 past + 4 current)
-- - 71 Tokens
-- - 20 Prescriptions
-- - 5 Registration requests
-- ============================================
