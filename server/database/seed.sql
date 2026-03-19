-- ============================================================
-- SKIL Hub — Seed Data
-- ============================================================
-- Run via: node server/database/seed.js
-- ============================================================

-- ─── 0. Clear Existing Data ─────────────────────────────────
DELETE FROM notifications;
DELETE FROM endorsements;
DELETE FROM project_members;
DELETE FROM projects;
DELETE FROM likes;
DELETE FROM comments;
DELETE FROM posts;
DELETE FROM achievements;
DELETE FROM users;

-- Reset auto-increment counters
DELETE FROM sqlite_sequence WHERE name IN ('notifications', 'endorsements', 'project_members', 'projects', 'likes', 'comments', 'posts', 'achievements', 'users');

-- ─── 1. Users ────────────────────────────────────────────────
-- Password hash for all below is 'password123' (bcrypt hashed)
-- Generated via bcrypt.hashSync('password123', 10)
INSERT INTO users (id, name, email, password_hash, role, department, year, bio, skills, avatar_url) VALUES 
(1, 'Aarav Patel', 'aarav.p@skilhub.edu', '$2b$10$claYsFZ6ho8m9hyw.J72YO/gpB1g99CJSW2MAVilV/SxNvAOnujeu', 'student', 'Computer Science', '3', 'Passionate about AI and full-stack development.', '["React", "Node.js", "Python", "Machine Learning"]', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Aarav'),
(2, 'Isha Sharma', 'isha.s@skilhub.edu', '$2b$10$claYsFZ6ho8m9hyw.J72YO/gpB1g99CJSW2MAVilV/SxNvAOnujeu', 'student', 'Information Technology', '4', 'Cloud enthusiast and open-source contributor.', '["AWS", "Docker", "Kubernetes", "Go"]', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Isha'),
(3, 'Rohan Gupta', 'rohan.g@skilhub.edu', '$2b$10$claYsFZ6ho8m9hyw.J72YO/gpB1g99CJSW2MAVilV/SxNvAOnujeu', 'student', 'Electronics and Communication', '2', 'Hardware meets software. Love building IoT devices.', '["C++", "Arduino", "Python", "IOT"]', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Rohan'),
(4, 'Priya Singh', 'priya.s@skilhub.edu', '$2b$10$claYsFZ6ho8m9hyw.J72YO/gpB1g99CJSW2MAVilV/SxNvAOnujeu', 'student', 'Computer Science', '1', 'Just starting my coding journey. Excited to learn!', '["HTML", "CSS", "Basic Python"]', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Priya'),
(5, 'Vikram Desai', 'vikram.d@skilhub.edu', '$2b$10$claYsFZ6ho8m9hyw.J72YO/gpB1g99CJSW2MAVilV/SxNvAOnujeu', 'student', 'Mechanical Engineering', '3', 'Exploring the intersection of mechanical systems and robotics.', '["SolidWorks", "MATLAB", "Robotics"]', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Vikram'),
(6, 'Dr. Aranya Sen', 'a.sen@skilhub.edu', '$2b$10$claYsFZ6ho8m9hyw.J72YO/gpB1g99CJSW2MAVilV/SxNvAOnujeu', 'faculty', 'Computer Science', NULL, 'Professor of Computer Science. Research focus on AI and Data Mining.', '["Machine Learning", "Data Mining", "Algorithms"]', 'https://api.dicebear.com/7.x/avataaars/svg?seed=DrSen'),
(7, 'Prof. Mehta', 'r.mehta@skilhub.edu', '$2b$10$claYsFZ6ho8m9hyw.J72YO/gpB1g99CJSW2MAVilV/SxNvAOnujeu', 'faculty', 'Information Technology', NULL, 'Focusing on distributed systems and cloud security.', '["Cloud Computing", "Cybersecurity", "Distributed Systems"]', 'https://api.dicebear.com/7.x/avataaars/svg?seed=ProfMehta');

-- ─── 2. Achievements ─────────────────────────────────────────
INSERT INTO achievements (id, user_id, title, description, category, ml_category, ml_confidence, proof_url, achieved_date) VALUES 
(1, 1, 'Winner: Smart India Hackathon 2025', 'Developed an AI-powered crop disease detection system that won 1st place in the agriculture track.', 'hackathon', 'hackathon', 0.95, 'https://example.com/sih-certificate', '2025-08-15'),
(2, 1, 'AWS Certified Solutions Architect', 'Successfully passed the AWS Certified Solutions Architect - Associate exam.', 'certification', 'certification', 0.98, 'https://example.com/aws-cert', '2025-11-20'),
(3, 2, 'KubeCon NA Scholar', 'Selected as a student scholar to attend KubeCon NA 2025.', 'award', 'award', 0.88, 'https://example.com/kubecon-letter', '2025-10-05'),
(4, 2, 'Deployed Campus File Sharing App', 'Built and deployed a heavily used internal file sharing app using Go and React.', 'project', 'project', 0.91, 'https://github.com/ishas/campus-share', '2025-09-01'),
(5, 3, 'Smart Traffic Light System Prototype', 'Created a working prototype of a smart traffic light using Arduino and IR sensors.', 'project', 'project', 0.85, 'https://example.com/traffic-prototype', '2025-07-22'),
(6, 3, 'NPTEL Course Completion: IoT', 'Completed the 12-week NPTEL course on Internet of Things with Elite + Silver grade.', 'certification', 'certification', 0.96, 'https://example.com/nptel-iot', '2025-12-10'),
(7, 4, '100 Days of Code Challenge', 'Successfully completed the 100 days of code challenge focusing on web fundamentals.', 'other', 'other', 0.75, 'https://twitter.com/priyacodes', '2026-02-15'),
(8, 5, 'Best Mechanical Design Award', 'Won the best design aesthetics award at the inter-college robotics competition.', 'award', 'award', 0.92, 'https://example.com/mech-award', '2026-01-20'),
(9, 1, 'Published Paper in IEEE Access', 'Co-authored a paper on lightweight CNNs for mobile devices, published in IEEE Access.', 'research', 'research', 0.99, 'https://ieeexplore.ieee.org/document/example', '2026-03-01'),
(10, 2, 'Google Cloud Professional Cloud Architect', 'Achieved GCP Professional architect certification.', 'certification', 'certification', 0.97, 'https://example.com/gcp-cert', '2026-02-28');

-- ─── 3. Posts ────────────────────────────────────────────────
INSERT INTO posts (id, user_id, content, post_type, image_url, trending_score, created_at) VALUES 
(1, 1, 'Just published my first research paper on IEEE Access! Huge thanks to Dr. Sen for the guidance. #research #ai', 'research', NULL, 85.5, datetime('now', '-2 days')),
(2, 2, 'We just hit 500 active users on the campus file sharing app! Looking for contributors to help with the v2 rewrite in Go. Let me know if you are interested!', 'project_update', NULL, 60.2, datetime('now', '-1 days')),
(3, 4, 'Day 50 of 100 days of code! Started learning React today and it is mind-blowing how much easier state management is compared to vanilla JS.', 'general', NULL, 25.0, datetime('now', '-12 hours')),
(4, 3, 'Finally got the LoRaWAN module working with the smart agriculture sensory node. Range is incredible! #iot #hardware', 'project_update', 'https://example.com/iot-board.jpg', 40.8, datetime('now', '-5 hours')),
(5, 1, 'Thrilled to share that I have passed the AWS Certified Solutions Architect exam! The journey was tough but worth it. Next up: building some serverless side-projects.', 'achievement', NULL, 110.5, datetime('now', '-2 hours'));

-- ─── 4. Comments ─────────────────────────────────────────────
INSERT INTO comments (id, post_id, user_id, content, created_at) VALUES 
(1, 1, 6, 'Excellent work Aarav. Very proud of the effort you put into the experiments.', datetime('now', '-1 day')),
(2, 1, 2, 'Congratulations Aarav! This is huge.', datetime('now', '-23 hours')),
(3, 2, 1, 'I have some experience with Go, would love to help out with the backend rewrite.', datetime('now', '-20 hours')),
(4, 4, 5, 'That looks really complex! Did you design the PCB yourself?', datetime('now', '-4 hours')),
(5, 5, 2, 'Congrats! The cloud arch cert is definitely one of the harder ones.', datetime('now', '-1 hour'));

-- ─── 5. Likes ────────────────────────────────────────────────
INSERT INTO likes (post_id, user_id) VALUES 
(1, 6), (1, 2), (1, 3), (1, 4), (1, 5), (1, 7),
(2, 1), (2, 3), (2, 6),
(3, 1), (3, 2),
(4, 1), (4, 5), (4, 2),
(5, 2), (5, 6), (5, 7), (5, 3), (5, 4);

-- ─── 6. Projects ─────────────────────────────────────────────
INSERT INTO projects (id, owner_id, title, description, required_skills, max_team_size, status, created_at) VALUES 
(1, 2, 'CampusShare v2', 'Rewriting the campus file sharing application from Node.js to Go for better performance and a more robust React frontend. Looking for Go and frontend devs.', '["Go", "React", "PostgreSQL", "Docker"]', 4, 'open', datetime('now', '-5 days')),
(2, 1, 'Auto-Grader AI', 'Developing an AI-powered system to assist TAs in grading programming assignments by analyzing code structure, complexity, and test cases.', '["Python", "Machine Learning", "AST Parsing", "FastAPI"]', 3, 'in_progress', datetime('now', '-15 days'));

-- ─── 7. Project Members ──────────────────────────────────────
INSERT INTO project_members (project_id, user_id, role, status, joined_at) VALUES 
(1, 2, 'owner', 'accepted', datetime('now', '-5 days')),
(1, 1, 'member', 'accepted', datetime('now', '-4 days')),
(1, 4, 'member', 'pending', datetime('now', '-1 day')),
(2, 1, 'owner', 'accepted', datetime('now', '-15 days')),
(2, 6, 'member', 'accepted', datetime('now', '-14 days')); -- faculty advisor

-- ─── 8. Endorsements ─────────────────────────────────────────
INSERT INTO endorsements (achievement_id, faculty_id, comment, created_at) VALUES 
(1, 6, 'Aarav showed exceptional leadership and technical vision during the hackathon.', datetime('now', '-200 days')),
(9, 6, 'Rigorous methodology and excellent empirical validation.', datetime('now', '-10 days'));

-- ─── 9. Notifications ────────────────────────────────────────
INSERT INTO notifications (user_id, type, message, reference_id, reference_type, is_read, created_at) VALUES 
(1, 'like', 'Dr. Aranya Sen liked your post.', 1, 'post', 1, datetime('now', '-1 day')),
(1, 'comment', 'Dr. Aranya Sen commented on your post.', 1, 'post', 1, datetime('now', '-1 day')),
(2, 'collab_request', 'Priya Singh requested to join CampusShare v2.', 1, 'project', 0, datetime('now', '-1 day')),
(1, 'endorsement', 'Dr. Aranya Sen endorsed your achievement: Published Paper in IEEE Access.', 9, 'achievement', 1, datetime('now', '-10 days')),
(1, 'like', 'Isha Sharma liked your post.', 5, 'post', 0, datetime('now', '-1 hour'));
