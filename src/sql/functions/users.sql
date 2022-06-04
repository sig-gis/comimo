-- NAMESPACE: users
-- REQUIRES: clear, project

--
-- ROUTE AUTHENTICATION FUNCTIONS
--

CREATE OR REPLACE FUNCTION is_user_admin(_user_id integer)
 RETURNS boolean AS $$

    SELECT count(1) > 0
    FROM users
    WHERE user_uid = _user_id
        AND role = 'admin'

$$ LANGUAGE SQL;

--
--  USER FUNCTIONS
--

-- Adds a new user to the database
CREATE OR REPLACE FUNCTION add_user(
    _username        text,
    _email           text,
    _password        text,
    _token           text,
    _full_name       text,
    _sector          text,
    _institution     text,
    _default_lang    text
 ) RETURNS integer AS $$

    INSERT INTO users (
        username,
        email,
        password,
        token,
        full_name,
        sector,
        institution,
        default_lang
    )
    VALUES (
        _username,
        _email,
        crypt(_password, gen_salt('bf')),
        _token,
        _full_name,
        _sector,
        _institution,
        _default_lang
    )
    RETURNING user_uid

$$ LANGUAGE SQL;

-- Updates a new user to the database
CREATE OR REPLACE FUNCTION update_user(
    _user_id         integer,
    _full_name       text,
    _sector          text,
    _institution     text,
    _default_lang    text
 ) RETURNS void AS $$

    UPDATE users
    SET full_name = _full_name,
        sector = _sector,
        institution = _institution,
        default_lang = _default_lang
    WHERE user_uid = _user_id

$$ LANGUAGE SQL;

CREATE OR REPLACE FUNCTION get_user_information(_user_id integer)
 RETURNS table (
    username        text,
    email           text,
    full_name       text,
    sector          text,
    institution     text,
    default_lang    text
 ) AS $$

    SELECT username,
        email,
        full_name,
        sector,
        institution,
        default_lang
    FROM users
    WHERE user_uid = _user_id

$$ LANGUAGE SQL;

-- Get information for single user
CREATE OR REPLACE FUNCTION get_user_by_email(_email text)
 RETURNS table (
    user_id         integer,
    token           text,
    default_lang    text
 ) AS $$

    SELECT user_uid, token, default_lang
    FROM users
    WHERE email = _email

$$ LANGUAGE SQL;

-- Returns all of the user fields associated with the provided email
CREATE OR REPLACE FUNCTION check_login(_email text, _password text)
 RETURNS table (
    user_id         integer,
    role            text,
    default_lang    text,
    verified        boolean
 ) AS $$

    SELECT user_uid, role, default_lang, verified
    FROM users
    WHERE (email = _email OR username = _email)
        AND password = crypt(_password, password)

$$ LANGUAGE SQL;

-- Checks if email is already in use.  Ignores the current user.
CREATE OR REPLACE FUNCTION email_taken(_email text)
 RETURNS boolean AS $$

    SELECT EXISTS(SELECT 1 FROM users WHERE email = _email)

$$ LANGUAGE SQL;

-- Check if username is already in use.
CREATE OR REPLACE FUNCTION username_taken(_username text)
 RETURNS boolean AS $$

    SELECT EXISTS(SELECT 1 FROM users WHERE username = _username)

$$ LANGUAGE SQL;

-- Sets the password reset key for the given user. If one already exists, it is replaced.
CREATE OR REPLACE FUNCTION set_password_reset_token(_email text, _token text)
 RETURNS text AS $$

    UPDATE users
    SET token = _token
    WHERE email = _email
    RETURNING email

$$ LANGUAGE SQL;

-- Updates password for a given user and clears the reset key.
CREATE OR REPLACE FUNCTION update_password(_email text, _password text)
 RETURNS void AS $$

    UPDATE users
    SET password = crypt(_password, gen_salt('bf')),
        token = NULL,
        verified = TRUE
    WHERE email = _email

$$ LANGUAGE SQL;

CREATE OR REPLACE FUNCTION set_user_verified(_user_id integer)
 RETURNS void AS $$

    UPDATE users
    SET verified = TRUE
    WHERE user_uid = _user_id

$$ LANGUAGE SQL;

CREATE OR REPLACE FUNCTION select_users_list()
 RETURNS table (
     user_id     integer,
     username    text,
     email       text,
     role        text
 ) AS $$

    SELECT user_uid,
        username,
        email,
        role
    FROM users

$$ LANGUAGE SQL;
