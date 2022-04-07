-- NAMESPACE: plots
-- REQUIRES: clear, project

CREATE OR REPLACE FUNCTION select_project_plots(_project_id integer, _m_buffer real)
 RETURNS table (
    plot_id    integer,
    lat        float,
    lon        float,
    geom       text,
    answer     text
 ) AS $$

    SELECT plot_uid,
        lat,
        lon,
        ST_AsGeoJSON(add_buffer(ST_MakePoint(lat, lon), _m_buffer)),
        answer
    FROM plots
    WHERE project_rid = _project_id
    ORDER BY plot_uid

$$ LANGUAGE SQL;

CREATE OR REPLACE FUNCTION save_user_answer(_plot_id integer, _answer text)
 RETURNS void AS $$

    UPDATE plots
    SET answer = _answer
    WHERE plot_uid = _plot_id

$$ LANGUAGE SQL;

CREATE OR REPLACE FUNCTION dump_project_plot_data(_project_id integer)
 RETURNS table (
    plotid    integer,
    lon       float,
    lat       float
 ) AS $$

    SELECT plot_uid,
        lon,
        lat
    FROM projects
    INNER JOIN plots pl
        ON project_uid = pl.project_rid

$$ LANGUAGE SQL;
