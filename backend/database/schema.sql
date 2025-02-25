CREATE TABLE IF NOT EXISTS files (
    id INTEGER PRIMARY KEY,
    original_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(255) NOT NULL,
    file_type VARCHAR(50) NOT NULL,
    file_size INTEGER NOT NULL,
    upload_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    outline_json TEXT,
    script_json TEXT,
    status TEXT DEFAULT 'pending'
);
