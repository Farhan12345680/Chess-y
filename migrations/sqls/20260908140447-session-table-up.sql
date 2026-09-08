/* Replace with your SQL commands */

CREATE TABLE IF NOT EXISTS SESSIONS(
    session_id varchar(100) NOT NULL,
    user_id varchar(100) NOT NULL,
    created_at timestamp default current_timestamp,
    session_duration INT default 0,

    foreign key (user_id) references USERS(user_id)

);
