-- NAMESPACE: project
-- REQUIRES: clear

--
--  MODIFY PROJECT FUNCTIONS
--

-- Create a project
CREATE OR REPLACE FUNCTION create_project(
    _name                   text,
    _description            text,
    _privacy_level          text,
    _boundary               jsonb,
    _plot_distribution      text,
    _num_plots              integer,
    _plot_spacing           real,
    _plot_shape             text,
    _plot_size              real,
    _plot_file_name         varchar,
    _shuffle_plots          boolean,
    _sample_distribution    text,
    _samples_per_plot       integer,
    _sample_resolution      real,
    _sample_file_name       varchar,
    _allow_drawn_samples    boolean,
    _survey_questions       jsonb,
    _survey_rules           jsonb,
    _token_key              text,
    _options                jsonb,
    _design_settings        jsonb
 ) RETURNS integer AS $$

    INSERT INTO projects (
        availability,
        name,
        description,
        privacy_level,
        boundary,
        plot_distribution,
        num_plots,
        plot_spacing,
        plot_shape,
        plot_size,
        plot_file_name,
        shuffle_plots,
        sample_distribution,
        samples_per_plot,
        sample_resolution,
        sample_file_name,
        allow_drawn_samples,
        survey_questions,
        survey_rules,
        created_date,
        token_key,
        options,
        design_settings
    ) VALUES (
        'unpublished',
        _name,
        _description,
        _privacy_level,
        null, --_boundary,
        _plot_distribution,
        _num_plots,
        _plot_spacing,
        _plot_shape,
        _plot_size,
        _plot_file_name,
        _shuffle_plots,
        _sample_distribution,
        _samples_per_plot,
        _sample_resolution,
        _sample_file_name,
        _allow_drawn_samples,
        _survey_questions,
        _survey_rules,
        now(),
        _token_key,
        _options,
        _design_settings
    )
    RETURNING project_uid

$$ LANGUAGE SQL;

-- Publish project
CREATE OR REPLACE FUNCTION publish_project(_project_id integer)
 RETURNS integer AS $$

    UPDATE projects
    SET availability = 'published',
        published_date = Now()
    WHERE project_uid = _project_id
    RETURNING _project_id

$$ LANGUAGE SQL;

-- Close project
CREATE OR REPLACE FUNCTION close_project(_project_id integer)
 RETURNS integer AS $$

    UPDATE projects
    SET availability = 'closed',
        closed_date = Now()
    WHERE project_uid = _project_id
    RETURNING _project_id

$$ LANGUAGE SQL;

-- Archive project
CREATE OR REPLACE FUNCTION archive_project(_project_id integer)
 RETURNS integer AS $$

    UPDATE projects
    SET availability = 'archived',
        archived_date = Now()
    WHERE project_uid = _project_id
    RETURNING _project_id

$$ LANGUAGE SQL;

-- Delete project and external files
CREATE OR REPLACE FUNCTION delete_project(_project_id integer)
 RETURNS void AS $$

 BEGIN
    -- Delete fks first for performance
    DELETE FROM user_plots WHERE plot_rid IN (SELECT plot_uid FROM plots WHERE project_rid = _project_id);
    DELETE FROM plots WHERE project_rid = _project_id;
    DELETE FROM projects WHERE project_uid = _project_id;

 END

$$ LANGUAGE PLPGSQL;

-- Update select set of project fields
CREATE OR REPLACE FUNCTION update_project(
    _project_id             integer,
    _name                   text,
    _description            text,
    _privacy_level          text,
    _boundary               jsonb,
    _plot_distribution      text,
    _num_plots              integer,
    _plot_spacing           real,
    _plot_shape             text,
    _plot_size              real,
    _plot_file_name         varchar,
    _shuffle_plots          boolean,
    _sample_distribution    text,
    _samples_per_plot       integer,
    _sample_resolution      real,
    _sample_file_name       varchar,
    _allow_drawn_samples    boolean,
    _survey_questions       jsonb,
    _survey_rules           jsonb,
    _options                jsonb,
    _design_settings        jsonb
 ) RETURNS void AS $$

    UPDATE projects
    SET name = _name,
        description = _description,
        privacy_level = _privacy_level,
        --boundary= _boundary,
        plot_distribution = _plot_distribution,
        num_plots = _num_plots,
        plot_spacing = _plot_spacing,
        plot_shape = _plot_shape,
        plot_size = _plot_size,
        plot_file_name = _plot_file_name,
        shuffle_plots = _shuffle_plots,
        sample_distribution = _sample_distribution,
        samples_per_plot = _samples_per_plot,
        sample_resolution = _sample_resolution,
        sample_file_name = _sample_file_name,
        allow_drawn_samples = _allow_drawn_samples,
        survey_questions = _survey_questions,
        survey_rules = _survey_rules,
        options = _options,
        design_settings = _design_settings
    WHERE project_uid = _project_id

$$ LANGUAGE SQL;

-- Update counts after plots are created
CREATE OR REPLACE FUNCTION update_project_counts(_project_id integer)
 RETURNS void AS $$

    WITH project_plots AS (
        SELECT project_uid, plot_uid
        FROM projects p
        INNER JOIN plots pl
            ON pl.project_rid = project_uid
        WHERE project_uid = _project_id
    )

    UPDATE projects
    SET num_plots = plots,
        samples_per_plot = 0
    FROM (
        SELECT COUNT(DISTINCT plot_uid) AS plots
        FROM project_plots
    ) a
    WHERE project_uid = _project_id

$$ LANGUAGE SQL;

-- Calculates boundary from for csv / shp data
CREATE OR REPLACE FUNCTION set_boundary(_project_id integer, _m_buffer real)
 RETURNS void AS $$

    UPDATE projects SET boundary = b
    FROM (
        SELECT ST_Envelope(ST_Buffer(ST_SetSRID(ST_Extent(plot_geom) , 4326)::geography , _m_buffer)::geometry) AS b
        FROM plots
        WHERE project_rid = _project_id
    ) bb
    WHERE project_uid = _project_id

$$ LANGUAGE SQL;

--
-- USING PROJECT FUNCTIONS
--

CREATE OR REPLACE FUNCTION valid_boundary(_boundary geometry)
 RETURNS boolean AS $$

    SELECT EXISTS(
        SELECT 1
        WHERE _boundary IS NOT NULL
            AND ST_Contains(ST_MakeEnvelope(-180, -90, 180, 90, 4326), _boundary)
            AND ST_XMax(_boundary) > ST_XMin(_boundary)
            AND ST_YMax(_boundary) > ST_YMin(_boundary)
    )

$$ LANGUAGE SQL;

CREATE OR REPLACE FUNCTION valid_project_boundary(_project_id integer)
 RETURNS boolean AS $$

    SELECT * FROM valid_boundary((SELECT boundary FROM projects WHERE project_uid = _project_id))

$$ LANGUAGE SQL;

CREATE OR REPLACE FUNCTION select_project_boundary(_project_id integer)
 RETURNS geometry  AS $$

    -- FIXME, need geojson
    SELECT boundary
    FROM projects

$$ LANGUAGE SQL;

-- Points in 4326
CREATE OR REPLACE FUNCTION gridded_points_in_bounds(_geo_json jsonb, _m_spacing real, _m_buffer real)
 RETURNS table (
    lon   float,
    lat   float
 ) AS $$

 DECLARE
    _meters_boundary    geometry;
    _buffered_extent    geometry;
    _x_range            float;
    _y_range            float;
    _x_steps            integer;
    _y_steps            integer;
    _x_padding          float;
    _y_padding          float;
 BEGIN
    SELECT ST_Transform(ST_SetSRID(ST_GeomFromGeoJSON(_geo_json), 4326), 3857) INTO _meters_boundary;
    SELECT ST_Buffer(_meters_boundary, -1 * _m_buffer) INTO _buffered_extent;
    SELECT ST_XMax(_buffered_extent) - ST_XMin(_buffered_extent) INTO _x_range;
    SELECT ST_YMax(_buffered_extent) - ST_YMin(_buffered_extent) INTO _y_range;
    SELECT floor(_x_range / _m_spacing) INTO _x_steps;
    SELECT floor(_y_range / _m_spacing) INTO _y_steps;
    SELECT (_x_range - _x_steps * _m_spacing) / 2 INTO _x_padding;
    SELECT (_y_range - _y_steps * _m_spacing) / 2 INTO _y_padding;

    RETURN QUERY
    SELECT ST_X(ST_Centroid(geom)),
        ST_Y(ST_Centroid(geom))
    FROM (
        SELECT ST_Transform(
            ST_SetSRID(
                ST_POINT(x::float + _x_padding, y::float + _y_padding), ST_SRID(_buffered_extent)
            ),
            4326
        ) as geom
        FROM
            generate_series(floor(st_xmin(_buffered_extent))::int, ceiling(st_xmax(_buffered_extent))::int, _m_spacing::int) AS x,
            generate_series(floor(st_ymin(_buffered_extent))::int, ceiling(st_ymax(_buffered_extent))::int, _m_spacing::int) AS y
        WHERE ST_Intersects(
            _buffered_extent,
            ST_SetSRID(ST_POINT(x::float + _x_padding, y::float + _y_padding), ST_SRID(_buffered_extent))
        )
    ) a;

 END

$$ LANGUAGE PLPGSQL;

-- Points in 3857
CREATE OR REPLACE FUNCTION random_points_in_bounds(_geo_json jsonb, _m_buffer real, _num_points integer = 2000)
 RETURNS table (
    x    float,
    y    float
 ) AS $$

    SELECT ST_X(ST_Centroid(geom)),
        ST_Y(ST_Centroid(geom))
    FROM ST_Dump(
        ST_GeneratePoints(
            ST_Buffer(
                ST_Transform(
                    ST_SetSRID(
                        ST_GeomFromGeoJSON(_geo_json),
                        4326
                    ),
                    3857
                ),
                -1 * _m_buffer / 2
            ),
            _num_points
        )
    )

$$ LANGUAGE SQL;

-- Returns a row in projects by id
CREATE OR REPLACE FUNCTION select_project_by_id(_project_id integer)
 RETURNS table (
    project_id             integer,
    availability           text,
    name                   text,
    description            text,
    privacy_level          text,
    boundary               text,
    plot_distribution      text,
    num_plots              integer,
    plot_spacing           real,
    plot_shape             text,
    plot_size              real,
    plot_file_name         varchar,
    shuffle_plots          boolean,
    sample_distribution    text,
    samples_per_plot       integer,
    sample_resolution      real,
    sample_file_name       varchar,
    allow_drawn_samples    boolean,
    survey_questions       jsonb,
    survey_rules           jsonb,
    options                jsonb,
    design_settings        jsonb,
    created_date           date,
    published_date         date,
    closed_date            date,
    token_key              text
 ) AS $$

    SELECT project_uid,
        availability,
        name,
        description,
        privacy_level,
        ST_AsGeoJSON(boundary),
        plot_distribution,
        num_plots,
        plot_spacing,
        plot_shape,
        plot_size,
        plot_file_name,
        shuffle_plots,
        sample_distribution,
        samples_per_plot,
        sample_resolution,
        sample_file_name,
        allow_drawn_samples,
        survey_questions,
        survey_rules,
        options,
        design_settings,
        created_date,
        published_date,
        closed_date,
        token_key
    FROM projects
    WHERE project_uid = _project_id
        AND availability <> 'archived'
    GROUP BY project_uid

$$ LANGUAGE SQL;

CREATE OR REPLACE FUNCTION user_project(_user_id integer, _role_id integer, _privacy_level text, _availability text)
 RETURNS boolean AS $$

    SELECT (_role_id = 1 AND _availability <> 'archived')
            OR (_availability = 'published'
                AND (_privacy_level = 'public'
                    OR (_user_id > 0 AND _privacy_level = 'users')
                    OR (_role_id = 2 AND _privacy_level = 'institution')))

$$ LANGUAGE SQL STABLE;


-- Returns project statistics for project dashboard
CREATE OR REPLACE FUNCTION select_project_statistics(_project_id integer)
 RETURNS table (
    total_plots         integer,
    flagged_plots       integer,
    analyzed_plots      integer,
    partial_plots       integer,
    unanalyzed_plots    integer,
    users_assigned      integer,
    user_stats          jsonb
 ) AS $$

    WITH user_plot_times AS (
        SELECT 0 AS assigned,
            up.user_rid AS collected,
            coalesce(flagged::int, 0) as flagged,
            (CASE WHEN collection_time IS NULL OR collection_start IS NULL THEN 0
                ELSE EXTRACT(EPOCH FROM (collection_time - collection_start)) END) AS seconds,
            (CASE WHEN collection_time IS NULL OR collection_start IS NULL THEN 0 ELSE 1 END) AS timed,
            u.email AS email
        FROM plots pl
        LEFT JOIN user_plots up
            ON up.plot_rid = pl.plot_uid
        INNER JOIN users u
            ON (up.user_rid = user_uid OR up.user_rid = user_uid)
        WHERE project_rid = _project_id
    ), users_grouped AS (
        SELECT email,
            COUNT(collected) - SUM(flagged::int) AS analyzed,
            SUM(flagged::int) as flagged,
            COUNT(assigned) as assigned,
            SUM(seconds)::int AS seconds,
            SUM(timed):: int AS timed_plots
        FROM user_plot_times
        GROUP BY email
        ORDER BY email DESC
    ), user_agg AS (
        SELECT format('[%s]', string_agg(row_to_json(ug)::text, ','))::jsonb AS user_stats
        FROM users_grouped ug
    ), users_count AS (
        SELECT 0 AS users_assigned
        FROM plots pl
        WHERE project_rid = _project_id
    ), plot_sum AS (
        SELECT plot_uid,
            coalesce(sum(flagged::int), 0) > 0 AS flagged,
            coalesce(count(user_plot_uid), 0) AS analyzed,
            0 AS assigned,
            1 AS needed
        FROM users_count, plots pl
        LEFT JOIN user_plots up
            ON up.plot_rid = pl.plot_uid
        GROUP BY plot_uid
        HAVING project_rid = _project_id
    ), project_sum AS (
        SELECT count(*)::int AS total_plots,
            sum(ps.flagged::int)::int AS flagged_plots,
            sum((needed = analyzed)::int)::int AS analyzed_plots,
            sum((needed > analyzed and analyzed > 0)::int)::int AS partial_plots,
            sum((analyzed = 0)::int)::int AS unanalyzed_plots
        FROM plot_sum ps
    )

    SELECT total_plots,
        flagged_plots,
        analyzed_plots,
        partial_plots,
        unanalyzed_plots,
        users_assigned,
        user_stats
    FROM projects, project_sum, users_count, user_agg
    WHERE project_uid = _project_id

$$ LANGUAGE SQL;

--
--  AGGREGATE FUNCTIONS
--

-- Returns project aggregate data
CREATE OR REPLACE FUNCTION dump_project_plot_data(_project_id integer)
 RETURNS table (
    plotid                    integer,
    center_lon                 double precision,
    center_lat                 double precision,
    shape                      text,
    size_m                     real,
    email                      text,
    flagged                    boolean,
    flagged_reason             text,
    confidence                 integer,
    collection_time            timestamp,
    analysis_duration          numeric,
    extra_plot_info            jsonb
 ) AS $$

    SELECT pl.visible_id,
        ST_X(ST_Centroid(plot_geom)) AS lon,
        ST_Y(ST_Centroid(plot_geom)) AS lat,
        plot_shape,
        plot_size,
        email,
        flagged,
        flagged_reason,
        confidence,
        collection_time,
        ROUND(EXTRACT(EPOCH FROM (collection_time - collection_start))::numeric, 1) AS analysis_duration,
        extra_plot_info
    FROM projects p
    INNER JOIN plots pl
        ON project_uid = pl.project_rid
    LEFT JOIN user_plots up
        ON up.plot_rid = pl.plot_uid
    LEFT JOIN users u
        ON u.user_uid = up.user_rid
    WHERE project_rid = _project_id
    GROUP BY project_uid, plot_uid, user_plot_uid, email, extra_plot_info
    ORDER BY plot_uid

$$ LANGUAGE SQL;
