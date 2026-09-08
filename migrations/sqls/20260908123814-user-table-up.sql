CREATE TABLE IF NOT EXISTS USERS(
    user_id varchar(100) default gen_random_uuid() PRIMARY KEY,
    name    varchar(200) NOT NULL,
    country varchar(2) default NULL,
    account_created_at timestamp default CURRENT_TIMESTAMP,
    last_active_at timestamp default NULL,
    chess_elo INTEGER default 0,
    password varchar(200) NOT NULL
);
