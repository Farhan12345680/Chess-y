/* Replace with your SQL commands */
CREATE TABLE IF NOT EXISTS USER_GAME_ELO(
    user_id UUID,
    gameType VARCHAR(100) NOT NULL,
    gameElo INT DEFAULT 0,

    PRIMARY KEY (user_id, gameType),
    FOREIGN KEY (user_id) REFERENCES USERS(user_id)
);



CREATE OR REPLACE FUNCTION create_user_game_elo()
RETURNS TRIGGER
AS $$
BEGIN
    INSERT INTO USER_GAME_ELO (user_id, gameType, gameElo)
    VALUES
        (NEW.user_id, 'rapid', 0),
        (NEW.user_id, 'blitz', 0),
        (NEW.user_id, 'bullet', 0);

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;


CREATE TRIGGER after_user_created
AFTER INSERT ON USERS
FOR EACH ROW
EXECUTE FUNCTION create_user_game_elo();