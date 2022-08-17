CREATE DATABASE champions_db;

CREATE TABLE teams_tab(
    id SERIAL PRIMARY KEY,
    team_name VARCHAR(100) NOT NULL UNIQUE,
    registration_date BIGINT NOT NULL,
    group_no SMALLINT NOT NULL,
    goals_no SMALLINT DEFAULT 0,
    score SMALLINT DEFAULT 0,
    alt_score SMALLINT DEFAULT 0,
    played_teams VARCHAR(520) DEFAULT ''
);