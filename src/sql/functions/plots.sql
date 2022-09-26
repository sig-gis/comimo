-- NAMESPACE: plots
-- REQUIRES: clear, project

-- Check if user has collection rights (read rights) for the plot
CREATE OR REPLACE FUNCTION can_user_collect_plot(_user_id integer, _plot_id integer)
 RETURNS boolean AS $$

    SELECT count(1) > 0
    FROM projects, plots
    WHERE project_uid = project_rid
        AND user_rid = _user_id
        AND plot_uid = _plot_id

$$ LANGUAGE SQL;

-- Calculates plot geom from for point data
CREATE OR REPLACE FUNCTION calc_plot_geom(_project_id integer, _m_buffer real)
 RETURNS void AS $$

    UPDATE plots SET geom = add_buffer(ST_MakePoint(lat, lng), _m_buffer)
    WHERE project_rid = _project_id

$$ LANGUAGE SQL;

CREATE OR REPLACE FUNCTION select_project_plots(_project_id integer)
 RETURNS table (
    plot_id    integer,
    lat        float,
    lng        float,
    geom       text,
    answer     text
 ) AS $$

    SELECT plot_uid,
        lat,
        lng,
        ST_AsGeoJSON(geom),
        answer
    FROM plots
    WHERE project_rid = _project_id
    ORDER BY plot_uid

$$ LANGUAGE SQL;

CREATE OR REPLACE FUNCTION save_user_answer(_plot_id integer, _answer text, _answer_number integer)
 RETURNS void AS $$

    UPDATE plots
    SET answer = _answer, answer_number = _answer_number
    WHERE plot_uid = _plot_id

$$ LANGUAGE SQL;

CREATE OR REPLACE FUNCTION get_prediction_options()
 RETURNS table (data_layer text) AS $$

    SELECT DISTINCT(data_layer)
    FROM projects
    ORDER BY data_layer DESC
    LIMIT 12

$$ LANGUAGE SQL;

CREATE OR REPLACE FUNCTION get_user_mine_options()
 RETURNS table (year_month text) AS $$

    SELECT DISTINCT(to_char(reported_date, 'YYYY-MM'))
    FROM user_mines
    ORDER BY to_char(reported_date, 'YYYY-MM') DESC
    LIMIT 12

$$ LANGUAGE SQL;

CREATE OR REPLACE FUNCTION get_predictions(_data_layer text)
 RETURNS table (
    username        text,
    email           text,
    institution    text,
    project_name    text,
    data_layer      text,
    lat             float,
    lng             float,
    answer          text,
    answer_number   integer
 ) AS $$

    SELECT username,
        email,
        institution,
        name,
        data_layer,
        lng,
        lat,
        answer,
        answer_number
    FROM projects, users, plots
    WHERE user_uid = user_rid
        AND project_uid = project_rid
        AND data_layer = _data_layer
        AND answer IS NOT NULL

$$ LANGUAGE SQL;

CREATE OR REPLACE FUNCTION get_user_mines(_year_month text)
 RETURNS table (
    username         text,
    email            text,
    institution      text,
    lat              float,
    lng              float,
    reported_date    text
 ) AS $$

    SELECT username,
        email,
        institution,
        lng,
        lat,
        to_char(reported_date, 'YYYY-MM-DD')
    FROM user_mines, users
    WHERE user_uid = user_rid
        AND to_char(reported_date, 'YYYY-MM') = _year_month
    ORDER BY reported_date

$$ LANGUAGE SQL;
