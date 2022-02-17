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
--  REPORTED MINES
--

-- Adds a new reported mine to the database
CREATE OR REPLACE FUNCTION add_reported_mine(
    _user_id    integer,
    _lat        real, -- x
    _lon        real -- y
 ) RETURNS void AS $$

    INSERT INTO user_mines
        (user_rid, lat, lon)
    VALUES
        (_user_id, _lat, _lon)

$$ LANGUAGE SQL;

-- Checks if user is already reported mine
CREATE OR REPLACE FUNCTION user_mine_reported(
    _user_id    integer,
    _lat        float,
    _lon        float
 ) RETURNS boolean AS $$

    SELECT count(1) > 0
    FROM user_mines
    WHERE user_rid = _user_id
        AND lat = _lat
        AND lon = _lon

$$ LANGUAGE SQL;
