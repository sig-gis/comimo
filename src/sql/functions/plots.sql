-- NAMESPACE: plots
-- REQUIRES: clear, project

--
--  PLOT FUNCTIONS
--

-- Select plots but only return a maximum number
CREATE OR REPLACE FUNCTION select_limited_project_plots(_project_id integer, _m_buffer real, _maximum integer)
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
    LIMIT _maximum

$$ LANGUAGE SQL;

-- Get user plots for a plot
CREATE OR REPLACE FUNCTION select_user_plots_info( _plot_id integer)
 RETURNS table (
    user_id       integer,
    flagged       boolean,
    confidence    integer
 ) AS $$

    SELECT user_rid,
        flagged,
        confidence
    FROM user_plots
    WHERE plot_rid = _plot_id

$$ LANGUAGE SQL;


CREATE OR REPLACE FUNCTION select_unanalyzed_plots(_project_id integer, _user_id integer)
 RETURNS table (
    plot_id    integer,
    lat        float,
    lon        float
 ) AS $$

    SELECT plot_uid,
        lat,
        lon
    FROM plots
    LEFT JOIN user_plots up
        ON plot_uid = up.plot_rid
    LEFT JOIN users u
        ON up.user_rid = u.user_uid
    WHERE project_rid = _project_id

$$ LANGUAGE SQL;

--
--  SAVING COLLECTION
--



--
--  RESETTING COLLECTION
--

-- For clearing user plots for a single plot
CREATE OR REPLACE FUNCTION delete_user_plot_by_plot(_plot_id integer, _user_id integer)
 RETURNS void AS $$

    DELETE FROM user_plots
    WHERE plot_rid = _plot_id
        AND user_rid = _user_id

$$ LANGUAGE SQL;

-- For clearing all plots in a project
CREATE OR REPLACE FUNCTION delete_plots_by_project(_project_id integer)
 RETURNS void AS $$

    DELETE FROM plots WHERE project_rid = _project_id;

    ANALYZE plots;

$$ LANGUAGE SQL;

-- For clearing all user plots in a project
CREATE OR REPLACE FUNCTION delete_user_plots_by_project(_project_id integer)
 RETURNS void AS $$

    DELETE FROM user_plots WHERE plot_rid IN (SELECT plot_uid FROM plots WHERE project_rid = _project_id)

$$ LANGUAGE SQL;
