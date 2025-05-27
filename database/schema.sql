-- Users table for authentication
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(50),
    last_name VARCHAR(50),
    age INTEGER,
    weight DECIMAL(5,2),
    height DECIMAL(5,2),
    activity_level VARCHAR(20),
    diet_type VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Search history table
CREATE TABLE search_history (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    search_query TEXT NOT NULL,
    search_results JSONB,
    search_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User meals table
CREATE TABLE user_meals (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    meal_name VARCHAR(100) NOT NULL,
    ingredients JSONB NOT NULL,
    nutritional_data JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_search_history_user_id ON search_history(user_id);
CREATE INDEX idx_user_meals_user_id ON user_meals(user_id);
