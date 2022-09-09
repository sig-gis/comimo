-- NAMESPACE: all

--
-- Create tables
--

-- Stores information about users
CREATE TABLE users (
    user_uid        SERIAL PRIMARY KEY,
    username        text NOT NULL UNIQUE,
    email           text NOT NULL UNIQUE,
    password        varchar(72) NOT NULL,
    token           text DEFAULT NULL,
    verified        boolean DEFAULT FALSE,
    created_date    date DEFAULT NOW(),
    role            text DEFAULT 'user' CHECK (role in ('user', 'admin')),
    full_name       text,
    sector          text,
    institution     text,
    default_lang    text
);

-- Stores information about user subscriptions.
CREATE TABLE subscriptions (
    subscription_uid    SERIAL PRIMARY KEY,
    user_rid            integer NOT NULL REFERENCES users (user_uid) ON DELETE CASCADE ON UPDATE CASCADE,
    region              text,
    last_alert_for      date DEFAULT now(),
    created_date        date DEFAULT now(),
    CONSTRAINT per_user_subscription UNIQUE(user_rid, region)
);
CREATE INDEX subscriptions_user_rid ON subscriptions (user_rid);

-- Stores user reported mines.
CREATE TABLE user_mines (
    user_mine_uid    SERIAL PRIMARY KEY,
    user_rid         integer NOT NULL REFERENCES users (user_uid) ON DELETE CASCADE ON UPDATE CASCADE,
    lat              float,
    lng              float,
    reported_date    timestamp DEFAULT now(),
    CONSTRAINT per_user_mine UNIQUE(user_rid, lat, lng)
);
CREATE INDEX user_mines_user_rid ON user_mines (user_rid);

-- Stores information about projects
CREATE TABLE projects (
    project_uid     SERIAL PRIMARY KEY,
    user_rid        integer NOT NULL REFERENCES users (user_uid) ON DELETE CASCADE ON UPDATE CASCADE,
    name            text NOT NULL,
    regions         varchar[],
    data_layer      text,
    boundary        geometry(geometry,4326),
    status          text DEFAULT 'active',
    created_date    date DEFAULT now(),
    closed_date     date
);
CREATE INDEX projects_user_rid ON projects (user_rid);

-- Stores plot center location and user answer
CREATE TABLE plots (
    plot_uid       SERIAL PRIMARY KEY,
    project_rid    integer NOT NULL REFERENCES projects (project_uid) ON DELETE CASCADE ON UPDATE CASCADE,
    lat            float,
    lng            float,
    geom           geometry(geometry,4326),
    answer         text
);
CREATE INDEX plots_projects_rid ON plots (project_rid);

-- Logs for automatic emails
CREATE TABLE auto_email_logs (
    job_time          timestamp DEFAULT now(),
    user_rid          integer NOT NULL REFERENCES users (user_uid) ON DELETE CASCADE ON UPDATE CASCADE,
    finish_status     text,
    finish_message    text,
    regions           varchar[]
);
CREATE INDEX email_log_user_rid ON auto_email_logs (user_rid);
