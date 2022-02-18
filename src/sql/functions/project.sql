-- NAMESPACE: project
-- REQUIRES: clear

--
--  MODIFY PROJECT FUNCTIONS
--

-- Create a project
CREATE OR REPLACE FUNCTION create_project(
    _user_id       integer,
    _name          text,
    _regions       text,
    _data_layer    text
 ) RETURNS integer AS $$

    INSERT INTO projects
        (user_rid, name, regions, data_layer)
    VALUES
        (_user_id, _name, _regions, _data_layer)
    RETURNING project_uid

$$ LANGUAGE SQL;

-- Close project
CREATE OR REPLACE FUNCTION close_project(_project_id integer)
 RETURNS integer AS $$

    UPDATE projects
    SET status = 'closed',
        closed_date = Now()
    WHERE project_uid = _project_id
    RETURNING _project_id

$$ LANGUAGE SQL;

-- Delete project
CREATE OR REPLACE FUNCTION delete_project(_project_id integer)
 RETURNS void AS $$

 BEGIN
    -- Delete fks first for performance
    DELETE FROM user_plots WHERE plot_rid IN (SELECT plot_uid FROM plots WHERE project_rid = _project_id);
    DELETE FROM plots WHERE project_rid = _project_id;
    DELETE FROM projects WHERE project_uid = _project_id;

 END

$$ LANGUAGE PLPGSQL;

-- Calculates boundary from for point data
CREATE OR REPLACE FUNCTION set_boundary(_project_id integer, _m_buffer real)
 RETURNS void AS $$

    UPDATE projects SET boundary = b
    FROM (
        SELECT ST_Envelope(ST_Buffer(ST_SetSRID(ST_Extent(ST_MakePoint(lat, lon)), 4326)::geography , _m_buffer)::geometry) AS b
        FROM plots
        WHERE project_rid = _project_id
    ) bb
    WHERE project_uid = _project_id

$$ LANGUAGE SQL;

--
-- USING PROJECT FUNCTIONS
--

CREATE OR REPLACE FUNCTION select_project_boundary(_project_id integer)
 RETURNS geometry  AS $$

    -- FIXME, need geojson
    SELECT boundary
    FROM projects

$$ LANGUAGE SQL;

-- Returns a row in projects by id
CREATE OR REPLACE FUNCTION select_project_by_id(_project_id integer)
 RETURNS table (
    user_id       integer,
    name          text,
    regions       text,
    data_layer    text
 ) AS $$

    SELECT user_rid,
        name,
        regions,
        data_layer
    FROM projects
    WHERE project_uid = _project_id

$$ LANGUAGE SQL;

-- Returns all user projects
CREATE OR REPLACE FUNCTION select_user_projects(_user_id integer)
 RETURNS table (
    project_id      integer,
    name            text,
    regions         text,
    data_layer      text,
    boundary        text,
    created_date    text
 ) AS $$

    SELECT project_uid,
        name,
        regions,
        data_layer,
        ST_AsGeoJSON(boundary),
        created_date::text
    FROM projects
    WHERE user_rid = _user_id
        AND status = 'active'

$$ LANGUAGE SQL;


--
--  AGGREGATE FUNCTIONS
--

-- Returns project aggregate data
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
