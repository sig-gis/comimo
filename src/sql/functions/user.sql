-- NAMESPACE: member
-- REQUIRES: clear, project

--
-- ROUTE AUTHENTICATION FUNCTIONS
--

-- Check if user is admin of institution
CREATE OR REPLACE FUNCTION is_institution_admin(_user_id integer, _institution_id integer)
 RETURNS boolean AS $$

    SELECT count(1) > 0
    FROM institution_users as iu
    INNER JOIN institutions as i
        ON institution_rid = institution_uid
    WHERE iu.user_rid = _user_id
        AND institution_rid = _institution_id
        AND role_rid = 1
        AND archived = FALSE

$$ LANGUAGE SQL;

-- Check if user has collection rights (read rights) for the project
CREATE OR REPLACE FUNCTION can_user_collect_project(_user_id integer, _project_id integer)
 RETURNS boolean AS $$

    SELECT count(1) > 0
    FROM projects as p
    LEFT JOIN institution_users iu
        ON p.institution_rid = iu.institution_rid
        AND user_rid = _user_id
    LEFT JOIN roles r
        ON iu.role_rid = role_uid
    WHERE project_uid = _project_id
        AND ((r.title = 'admin' AND p.availability <> 'archived')
            OR (r.title = 'member'
                AND p.privacy_level IN ('public', 'institution', 'users')
                AND p.availability = 'published')
            OR (_user_id > 0
                AND p.privacy_level IN ('public', 'users')
                AND p.availability = 'published')
            OR (p.privacy_level IN ('public')
                AND p.availability = 'published'))

$$ LANGUAGE SQL;

-- Check if user has modify rights for the project
CREATE OR REPLACE FUNCTION can_user_edit_project(_user_id integer, _project_id integer)
 RETURNS boolean AS $$

    SELECT count(1) > 0
    FROM projects as p
    LEFT JOIN institution_users iu
        ON p.institution_rid = iu.institution_rid
        AND user_rid = _user_id
    LEFT JOIN roles r
        ON iu.role_rid = role_uid
    WHERE project_uid = _project_id
        AND (r.title = 'admin' AND p.availability <> 'archived')

$$ LANGUAGE SQL;

--
--  USER FUNCTIONS
--

-- Adds a new user to the database
CREATE OR REPLACE FUNCTION add_user(
    _username        text,
    _email           text,
    _password        text,
    _reset_key       text,
    _full_name       text,
    _sector          text,
    _institution     text,
    _default_lang    text
 ) RETURNS integer AS $$

    INSERT INTO users (
        username,
        email,
        password,
        reset_key,
        full_name,
        sector,
        institution,
        default_lang
    )
    VALUES (
        _username,
        _email,
        crypt(_password, gen_salt('bf')),
        _reset_key,
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
 ) RETURNS integer AS $$

    INSERT INTO users (
        email,
        password,
        reset_key,
        full_name,
        sector,
        institution,
        default_lang
    )
    VALUES (
        _email,
        crypt(_password, gen_salt('bf')),
        _reset_key,
        _full_name,
        _sector,
        _institution,
        _default_lang
    )
    RETURNING user_uid

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
    user_id      integer,
    reset_key    text
 ) AS $$

    SELECT user_uid, reset_key
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
CREATE OR REPLACE FUNCTION set_password_reset_key(_email text, _reset_key text)
 RETURNS text AS $$

    UPDATE users
    SET reset_key = _reset_key
    WHERE email = _email
    RETURNING email

$$ LANGUAGE SQL;

-- Updates password for a given user and clears the reset key.
CREATE OR REPLACE FUNCTION update_password(_email text, _password text)
 RETURNS void AS $$

    UPDATE users
    SET password = crypt(_password, gen_salt('bf')),
        reset_key = NULL,
        verified = TRUE
    WHERE email = _email

$$ LANGUAGE SQL;

CREATE OR REPLACE FUNCTION user_verified(_user_id integer)
 RETURNS void AS $$

    UPDATE users
    SET verified = TRUE
    WHERE user_uid = _user_id

$$ LANGUAGE SQL;
