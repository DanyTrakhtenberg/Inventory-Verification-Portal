-- Inventory Verification Portal - Database Schema
-- Run this script to create the database schema

-- Clients table: stores client names for organizing uploads
CREATE TABLE IF NOT EXISTS clients (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Uploads table: stores metadata for each file upload
CREATE TABLE IF NOT EXISTS uploads (
  id SERIAL PRIMARY KEY,
  client_id INTEGER NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  filename VARCHAR(500) NOT NULL,
  file_type VARCHAR(20) NOT NULL,
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  overall_pass BOOLEAN NOT NULL,
  status VARCHAR(20) NOT NULL CHECK (status IN ('SUCCESS', 'FAILED'))
);

-- Validation results: stores per-rule validation outcomes with flexible JSONB details
CREATE TABLE IF NOT EXISTS validation_results (
  id SERIAL PRIMARY KEY,
  upload_id INTEGER NOT NULL REFERENCES uploads(id) ON DELETE CASCADE,
  rule_name VARCHAR(100) NOT NULL,
  passed BOOLEAN NOT NULL,
  details JSONB
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_uploads_client_id ON uploads(client_id);
CREATE INDEX IF NOT EXISTS idx_uploads_uploaded_at ON uploads(uploaded_at DESC);
CREATE INDEX IF NOT EXISTS idx_validation_results_upload_id ON validation_results(upload_id);
