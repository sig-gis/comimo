-- NAMESPACE: subscriptions
-- REQUIRES: clear, project, users

-- Adds a new subscription to the database
CREATE OR REPLACE FUNCTION add_subscription(
    _user_id          integer,
    _boundary_type    text,
    _location         text
 ) RETURNS void AS $$

    INSERT INTO subscriptions
        (user_rid, boundary_type, location)
    VALUES
        (_user_id, _boundary_type, _location)

$$ LANGUAGE SQL;

CREATE OR REPLACE FUNCTION remove_subscription(
    _user_id          integer,
    _boundary_type    text,
    _location         text
 ) RETURNS void AS $$

    DELETE
    FROM subscriptions
    WHERE user_rid = _user_id
        AND boundary_type = _boundary_type
        AND location = _location

$$ LANGUAGE SQL;

CREATE OR REPLACE FUNCTION get_user_subscriptions(_user_id integer)
 RETURNS table (
    boundary_type    text,
    location         text
 ) AS $$

    SELECT boundary_type, location
    FROM subscriptions
    WHERE user_rid = _user_id

$$ LANGUAGE SQL;

-- Checks if user is already subscribed
CREATE OR REPLACE FUNCTION user_subscribed(
    _user_id          integer,
    _boundary_type    text,
    _location         text
 ) RETURNS boolean AS $$

    SELECT count(1) > 0
    FROM subscriptions
    WHERE user_rid = _user_id
        AND boundary_type = _boundary_type
        AND location = _location

$$ LANGUAGE SQL;
