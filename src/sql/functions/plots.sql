-- NAMESPACE: plots
-- REQUIRES: clear, project

--
--  PLOT FUNCTIONS
--

-- Select plots but only return a maximum number
-- TODO, CEO-32 update to only show users available plots
CREATE OR REPLACE FUNCTION select_limited_project_plots(_project_id integer, _maximum integer)
 RETURNS table (
    plot_id    integer,
    center     text,
    flagged    boolean,
    status     text
 ) AS $$

    WITH plot_sums AS (
        SELECT plot_uid,
            ST_AsGeoJSON(ST_Centroid(plot_geom)) AS center,
            sum(coalesce(flagged, false)::int) > 0 AS flagged,
            0 AS assigned,
            sum((up.user_rid IS NOT NULL)::int) AS collected
        FROM plots pl
        LEFT JOIN user_plots up
            ON up.plot_rid = pl.plot_uid
        GROUP BY plot_uid
        HAVING project_rid = _project_id
        LIMIT _maximum
    )

    SELECT plot_uid,
        center,
        flagged,
        CASE WHEN (assigned = 0 AND collected = 1) OR (assigned > 0 AND assigned = collected)
            THEN 'analyzed'
        WHEN assigned > collected AND collected > 1
            THEN 'partial'
        ELSE
            'unanalyzed'
        END
    FROM plot_sums

$$ LANGUAGE SQL;

-- Returns plot geom for the geodash
CREATE OR REPLACE FUNCTION select_plot_geom(_plot_id integer)
 RETURNS text AS $$

    SELECT ST_AsGeoJSON(plot_geom)
    FROM plots p
    WHERE p.plot_uid = _plot_id

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

-- This return type is so the collection functions match return types.
DROP TYPE IF EXISTS collection_return CASCADE;
CREATE TYPE collection_return AS (
    plot_id            integer,
    flagged            boolean,
    flagged_reason     text,
    confidence         integer,
    visible_id         integer,
    plot_geom          text,
    extra_plot_info    jsonb,
    user_id            integer,
    email              text
);

CREATE OR REPLACE FUNCTION select_unanalyzed_plots(_project_id integer, _user_id integer, _review_mode boolean)
 RETURNS setOf collection_return AS $$

    SELECT plot_uid,
        flagged,
        flagged_reason,
        confidence,
        visible_id,
        ST_AsGeoJSON(plot_geom) as plot_geom,
        extra_plot_info,
        user_rid,
        u.email
    FROM plots
    LEFT JOIN user_plots up
        ON plot_uid = up.plot_rid
    LEFT JOIN users u
        ON up.user_rid = u.user_uid
    WHERE project_rid = _project_id

    ORDER BY visible_id ASC

$$ LANGUAGE SQL;

CREATE OR REPLACE FUNCTION select_analyzed_plots(_project_id integer, _user_id integer, _review_mode boolean)
 RETURNS setOf collection_return AS $$

    SELECT plot_uid,
        flagged,
        flagged_reason,
        confidence,
        visible_id,
        ST_AsGeoJSON(plot_geom) as plot_geom,
        extra_plot_info,
        u.user_uid,
        u.email
    FROM plots
    INNER JOIN user_plots up
        ON plot_uid = plot_rid
    INNER JOIN users u
        ON u.user_uid = up.user_rid
    WHERE project_rid = _project_id
        AND (up.user_rid = _user_id OR _review_mode)
    ORDER BY visible_id ASC

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

-- Get all plots and centers to recreate samples.
CREATE OR REPLACE FUNCTION get_plot_centers_by_project(_project_id integer)
 RETURNS table (
    plot_id       integer,
    visible_id    integer,
    lon           double precision,
    lat           double precision
 ) AS $$

    SELECT plot_uid,
        visible_id,
        ST_X(ST_Centroid(plot_geom)) AS lon,
        ST_Y(ST_Centroid(plot_geom)) AS lat
    FROM plots
    WHERE project_rid = _project_id

$$ LANGUAGE SQL;
