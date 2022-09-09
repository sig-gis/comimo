-- NAMESPACE: subscriptions
-- REQUIRES: clear, project, users

--
--  SUBSCRIPTIONS
--

-- Adds a new subscription to the database
CREATE OR REPLACE FUNCTION add_subscription(
    _user_id    integer,
    _region     text
 ) RETURNS void AS $$

    INSERT INTO subscriptions
        (user_rid, region)
    VALUES
        (_user_id, _region)

$$ LANGUAGE SQL;

CREATE OR REPLACE FUNCTION remove_subscription(
    _user_id   integer,
    _region    text
 ) RETURNS void AS $$

    DELETE
    FROM subscriptions
    WHERE user_rid = _user_id
        AND region = _region

$$ LANGUAGE SQL;

CREATE OR REPLACE FUNCTION get_user_subscriptions(_user_id integer)
 RETURNS table (region text) AS $$

    SELECT region
    FROM subscriptions
    WHERE user_rid = _user_id

$$ LANGUAGE SQL;

-- Checks if user is already subscribed
CREATE OR REPLACE FUNCTION user_subscribed(
    _user_id    integer,
    _region     text
 ) RETURNS boolean AS $$

    SELECT count(1) > 0
    FROM subscriptions
    WHERE user_rid = _user_id
        AND region = _region

$$ LANGUAGE SQL;

--
--  EMAIL ALERTS
--

CREATE OR REPLACE FUNCTION get_unsent_subscriptions(_date text)
 RETURNS table (
    user_id         integer,
    email           text,
    default_lang    text,
    regions         varchar[]
 ) AS $$

    SELECT user_uid,
        email,
        default_lang,
        array_agg(region)::varchar[]
    FROM subscriptions, users
    WHERE user_uid = user_rid
        AND last_alert_for < _date::date
    GROUP BY user_uid

$$ LANGUAGE SQL;

CREATE OR REPLACE FUNCTION set_last_alert_for(_user_id integer, _date text)
 RETURNS void AS $$

    UPDATE subscriptions
    SET last_alert_for = _date::date
    WHERE user_rid = _user_id

$$ LANGUAGE SQL;

CREATE OR REPLACE FUNCTION log_email_alert(
    _user_id           integer,
    _finish_status     text,
    _finish_message    text,
    _regions           varchar[]
 ) RETURNS void AS $$

    INSERT INTO auto_email_logs
        (user_rid, finish_status, finish_message, regions)
    VALUES
        (_user_id, _finish_status, _finish_message, _regions)

$$ LANGUAGE SQL;

CREATE OR REPLACE FUNCTION select_email_logs()
 RETURNS table (
    job_time          text,
    username          text,
    finish_status     text,
    finish_message    text
 ) AS $$

    SELECT to_char(job_time, 'YYYY-MM-DD.SS'),
        username,
        finish_status,
        finish_message
    FROM auto_email_logs, users
    WHERE user_uid = user_rid
    ORDER BY job_time DESC

$$ LANGUAGE SQL;

--
--  REPORTED MINES
--

-- Adds a new reported mine to the database
CREATE OR REPLACE FUNCTION add_reported_mine(
    _user_id    integer,
    _lat        real, -- x
    _lng        real -- y
 ) RETURNS void AS $$

    INSERT INTO user_mines
        (user_rid, lat, lng)
    VALUES
        (_user_id, _lat, _lng)

$$ LANGUAGE SQL;

-- Checks if user is already reported mine
CREATE OR REPLACE FUNCTION user_mine_reported(
    _user_id    integer,
    _lat        float,
    _lng        float
 ) RETURNS boolean AS $$

    SELECT count(1) > 0
    FROM user_mines
    WHERE user_rid = _user_id
        AND lat = _lat
        AND lng = _lng

$$ LANGUAGE SQL;
