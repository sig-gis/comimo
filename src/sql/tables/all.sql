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
    boundary_type       text,
    location            text,
    last_alert_for      timestamp DEFAULT now(),
    created_date        timestamp DEFAULT now(),
    CONSTRAINT per_user_subscription UNIQUE(user_rid, boundary_type, location)
);
CREATE INDEX subscriptions_user_rid ON subscriptions (user_rid);

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
-- Each project must be associated with an institution
CREATE TABLE projects (
    project_uid            SERIAL PRIMARY KEY,
    availability           text,
    name                   text NOT NULL,
    description            text,
    privacy_level          text,
    boundary               geometry(geometry,4326),
    plot_distribution      text,
    num_plots              integer,
    plot_spacing           real,
    plot_shape             text,
    plot_size              real,
    sample_distribution    text,
    samples_per_plot       integer,
    sample_resolution      real,
    survey_questions       jsonb,
    survey_rules           jsonb,
    created_date           date,
    published_date         date,
    closed_date            date,
    archived_date          date,
    token_key              text DEFAULT NULL,
    options                jsonb NOT NULL DEFAULT '{}'::jsonb,
    allow_drawn_samples    boolean,
    design_settings        jsonb NOT NULL DEFAULT '{}'::jsonb,
    plot_file_name         varchar(511),
    sample_file_name       varchar(511),
    shuffle_plots          boolean
);

-- Stores plot information, including a reference to external plot data if it exists
CREATE TABLE plots (
    plot_uid           SERIAL PRIMARY KEY,
    project_rid        integer NOT NULL REFERENCES projects (project_uid) ON DELETE CASCADE ON UPDATE CASCADE,
    plot_geom          geometry(geometry,4326),
    visible_id         integer,
    extra_plot_info    jsonb
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
