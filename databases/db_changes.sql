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

ALTER TABLE users
ADD COLUMN mobile_number VARCHAR(15) NOT NULL;

ALTER TABLE users
ADD CONSTRAINT unique_mobile UNIQUE(mobile_number);

ALTER TABLE otp_verifications ADD COLUMN phone TEXT;

ALTER TABLE users ADD COLUMN failed_login_attempts INT DEFAULT 0;

ALTER TABLE otp_verifications
ADD COLUMN identifier TEXT NOT NULL,
ADD COLUMN otp_hash TEXT NOT NULL,
ADD COLUMN attempts INT DEFAULT 0,
ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN verified BOOLEAN DEFAULT FALSE;

ALTER TABLE users
ADD COLUMN account_locked_until TIMESTAMPTZ;

ALTER TABLE users
ADD CONSTRAINT unique_username UNIQUE (username);

ALTER TABLE otp_verifications
ADD CONSTRAINT otp_attempt_limit
CHECK (attempts <= 5);

CREATE INDEX idx_otp_identifier
ON otp_verifications(identifier);

CREATE INDEX idx_refresh_token
ON refresh_tokens(token);

CREATE INDEX idx_refresh_user
ON refresh_tokens(user_id);

ALTER TABLE devices
ADD CONSTRAINT fk_devices_user
FOREIGN KEY (user_id)
REFERENCES users(id)
ON DELETE CASCADE;

ALTER TABLE devices
ADD CONSTRAINT unique_user_device
UNIQUE (user_id, device_id);

CREATE INDEX idx_devices_user
ON devices(user_id);

ALTER TABLE refresh_tokens
ADD COLUMN jti VARCHAR(255);

ALTER TABLE refresh_tokens
ADD CONSTRAINT unique_jti UNIQUE (jti);

CREATE INDEX idx_refresh_tokens_jti
ON refresh_tokens(jti);

CREATE INDEX idx_otp_identifier
ON otp_verifications(identifier);

CREATE TABLE sessions (
    id UUID PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    device_id TEXT,
    ip_address TEXT,
    user_agent TEXT,
    revoked BOOLEAN DEFAULT FALSE,
    last_used_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    expires_at TIMESTAMP NOT NULL
);

CREATE INDEX idx_sessions_user
ON sessions(user_id);

ALTER TABLE refresh_tokens
ADD COLUMN session_id UUID REFERENCES sessions(id);

ALTER TABLE otp_verifications
ADD CONSTRAINT otp_identifier_unique UNIQUE (identifier);