CREATE TABLE IF NOT EXISTS USERS(
    user_id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(200) NOT NULL UNIQUE,
    country VARCHAR(10) DEFAULT NULL,
    account_created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_active_at TIMESTAMP DEFAULT NULL,
    password VARCHAR(200) NOT NULL,
    image_url varchar(1000) default 'https://img.icons8.com/nolan/64/user-default.png'
);




/* Replace with your SQL commands */


CREATE TABLE IF NOT EXISTS CHESS_GAMES(
    game_id UUID default gen_random_uuid() PRIMARY KEY,
    player1 UUID,
    player2 UUID,
    pgn_game_string varchar(2000) default NULL,
    game_type varchar(100) not null,
    time_interval varchar(100) default '0+0',
    game_winner UUID,
    creation_time_stampz timestamp default current_timestamp,
    player1_color char(1) default 'W',
    
    foreign key (player1) references USERS(user_id),
    foreign key (player2) references USERS(user_id),
    foreign key (game_winner) references USERS(user_id)

);


/* Replace with your SQL commands */

CREATE TABLE IF NOT EXISTS SESSIONS(
    session_id varchar(100) NOT NULL,
    user_id UUID NOT NULL,
    created_at timestamp default current_timestamp,
    session_duration INT default 0,

    foreign key (user_id) references USERS(user_id)

);
