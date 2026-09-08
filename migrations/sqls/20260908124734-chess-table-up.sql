/* Replace with your SQL commands */


CREATE TABLE IF NOT EXISTS CHESS_GAMES(
    game_id varchar(100) default gen_random_uuid() PRIMARY KEY,
    player1 varchar(100),
    player2 varchar(100),
    pgn_game_string varchar(2000) default NULL,
    time_interval varchar(100) default '0+0',
    game_winner varchar(100),
    creation_time_stampz timestamp default current_timestamp,
    player1_color char(1) default 'W',
    
    foreign key (player1) references USERS(user_id),
    foreign key (player2) references USERS(user_id),
    foreign key (game_winner) references USERS(user_id)

);