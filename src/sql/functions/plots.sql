-- NAMESPACE: plots
-- REQUIRES: clear, project

CREATE OR REPLACE FUNCTION select_project_plots(_project_id integer, _m_buffer real)
 RETURNS table (
    plot_id    integer,
    lat        float,
    lon        float,
    geom       text
 ) AS $$

    SELECT plot_uid,
        lat,
        lon,
        ST_AsGeoJSON(add_buffer(ST_MakePoint(lat, lon), _m_buffer))
    FROM plots
    WHERE project_rid = _project_id
    ORDER BY plot_uid

$$ LANGUAGE SQL;

-- TODO save plot information

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
