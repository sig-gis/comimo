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
    reset_key       text DEFAULT NULL,
    verified        boolean DEFAULT FALSE,
    created_date    date DEFAULT NOW(),
    role            text DEFAULT 'user',
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
    lat              float, -- x
    lon              float, -- y
    reported_date    timestamp DEFAULT now(),
    CONSTRAINT per_user_mine UNIQUE(user_rid, lat, lon)
);
CREATE INDEX user_mines_user_rid ON user_mines (user_rid);

-- Stores imagery data
CREATE TABLE imagery (
    imagery_uid        SERIAL PRIMARY KEY,
    visibility         text NOT NULL,
    title              text NOT NULL,
    attribution        text NOT NULL,
    extent             jsonb,
    source_config      jsonb,
    archived           boolean DEFAULT FALSE,
    created_date       date DEFAULT NOW(),
    archived_date      date
);


-- Stores information about projects
CREATE TABLE projects (
    project_uid     SERIAL PRIMARY KEY,
    user_rid        integer NOT NULL REFERENCES users (user_uid) ON DELETE CASCADE ON UPDATE CASCADE,
    name            text NOT NULL,
    regions         text,
    data_layer      text,
    boundary        geometry(geometry,4326),
    status          text DEFAULT 'active',
    created_date    date DEFAULT now(),
    closed_date     date
);
CREATE INDEX projects_user_rid ON projects (user_rid);

-- Stores plot center location
CREATE TABLE plots (
    plot_uid       SERIAL PRIMARY KEY,
    project_rid    integer NOT NULL REFERENCES projects (project_uid) ON DELETE CASCADE ON UPDATE CASCADE,
    lat            float,
    lon            float
);
CREATE INDEX plots_projects_rid ON plots (project_rid);

-- Stores information about a plot as data is collected, including the user who collected it
CREATE TABLE user_plots (
    user_plot_uid       SERIAL PRIMARY KEY,
    user_rid            integer NOT NULL REFERENCES users (user_uid) ON DELETE CASCADE ON UPDATE CASCADE,
    plot_rid            integer NOT NULL REFERENCES plots (plot_uid) ON DELETE CASCADE ON UPDATE CASCADE,
    flagged             boolean DEFAULT FALSE,
    confidence          integer CHECK (confidence >= 0 AND confidence <= 100),
    collection_start    timestamp,
    collection_time     timestamp,
    flagged_reason      text,
    CONSTRAINT per_user_per_plot UNIQUE(user_rid, plot_rid)
);
CREATE INDEX user_plots_plot_rid ON user_plots (plot_rid);
CREATE INDEX user_plots_user_rid ON user_plots (user_rid);

CREATE TABLE auto_email_logs (
    job_time          timestamp DEFAULT now(),
    user_rid          integer NOT NULL REFERENCES users (user_uid) ON DELETE CASCADE ON UPDATE CASCADE,
    finish_status     text,
    finish_message    text,
    regions           text
);
CREATE INDEX email_log_user_rid ON auto_email_logs (user_rid);
