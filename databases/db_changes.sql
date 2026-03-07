ALTER TABLE users ADD COLUMN email TEXT UNIQUE;

CREATE INDEX idx_users_login
ON users (username, email);

CREATE TABLE refresh_tokens (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    token TEXT NOT NULL,
    device_id TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    expires_at TIMESTAMP,
    revoked BOOLEAN DEFAULT FALSE
);

CREATE TABLE otp_verifications (
    id integer NOT NULL,
    email text NOT NULL,
    otp text NOT NULL,
    expires_at timestamp NOT NULL
);