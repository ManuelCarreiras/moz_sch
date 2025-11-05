-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Seed assessment types
INSERT INTO assessment_type (_id, type_name, description) VALUES
(uuid_generate_v4(), 'Homework', 'Regular homework assignments'),
(uuid_generate_v4(), 'Quiz', 'Short assessments'),
(uuid_generate_v4(), 'Test', 'Major tests and exams'),
(uuid_generate_v4(), 'Project', 'Long-term projects'),
(uuid_generate_v4(), 'Lab', 'Laboratory work'),
(uuid_generate_v4(), 'Presentation', 'Oral presentations'),
(uuid_generate_v4(), 'Participation', 'Class participation')
ON CONFLICT (type_name) DO NOTHING;

