CREATE TABLE IF NOT EXISTS USERS(
    user_id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(200) NOT NULL UNIQUE,
    country VARCHAR(10) DEFAULT NULL,
    account_created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_active_at TIMESTAMP DEFAULT NULL,
    password VARCHAR(200) NOT NULL,
    image_url varchar(1000) default 'https://img.icons8.com/nolan/64/user-default.png'
);




