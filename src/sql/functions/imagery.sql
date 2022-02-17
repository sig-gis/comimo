-- NAMESPACE: imagery
-- REQUIRES: clear, member, project

--
--  IMAGERY FUNCTIONS
--

-- Return type for all imagery
DROP TYPE IF EXISTS imagery_return CASCADE;
CREATE TYPE imagery_return AS (
    imagery_id        integer,
    visibility        text,
    title             text,
    attribution       text,
    extent            jsonb,
    source_config     jsonb
);

-- Returns a single imagery by ID
CREATE OR REPLACE FUNCTION select_imagery_by_id(_imagery_id integer)
 RETURNS setOf imagery_return AS $$

    SELECT imagery_uid,
        visibility,
        title,
        attribution,
        extent,
        source_config
    FROM imagery
    WHERE imagery_uid = _imagery_id

$$ LANGUAGE SQL;

-- Returns first public imagery
CREATE OR REPLACE FUNCTION select_first_public_imagery()
 RETURNS integer AS $$

    SELECT imagery_uid
    FROM imagery
    WHERE visibility = 'public'
        AND archived = FALSE
    ORDER BY imagery_uid
    LIMIT 1

$$ LANGUAGE SQL;

-- Returns first public OSM imagery
CREATE OR REPLACE FUNCTION select_public_osm()
 RETURNS integer AS $$

    SELECT imagery_uid
    FROM imagery
    WHERE source_config->>'type' = 'OSM'
        AND archived = FALSE
        AND visibility = 'public'
    ORDER BY imagery_uid
    LIMIT 1

$$ LANGUAGE SQL;

-- Check if imagery title already exists
CREATE OR REPLACE FUNCTION imagery_name_taken(_title text, _imagery_id integer)
 RETURNS boolean AS $$

    SELECT EXISTS(
        SELECT 1
        FROM imagery
        WHERE title = _title
            AND imagery_uid <> _imagery_id
    )

$$ LANGUAGE SQL;

-- Adds institution imagery
CREATE OR REPLACE FUNCTION add_institution_imagery(
    _visibility        text,
    _title             text,
    _attribution       text,
    _extent            jsonb,
    _source_config     jsonb
 ) RETURNS integer AS $$

    INSERT INTO imagery
        (visibility, title, attribution, extent, source_config)
    VALUES
        ( _visibility, _title, _attribution, _extent,  _source_config)
    RETURNING imagery_uid

$$ LANGUAGE SQL;

-- Updates institution imagery
CREATE OR REPLACE FUNCTION update_institution_imagery(
    _imagery_id       integer,
    _title            text,
    _attribution      text,
    _source_config    jsonb
 ) RETURNS integer AS $$

    UPDATE imagery
    SET title = _title,
        attribution = _attribution,
        source_config = _source_config
    WHERE imagery_uid = _imagery_id
    RETURNING imagery_uid

$$ LANGUAGE SQL;

-- Updates institution imagery visibility (this is only for the super user)
CREATE OR REPLACE FUNCTION update_imagery_visibility(
    _imagery_id        integer,
    _visibility        text
 ) RETURNS void AS $$

    UPDATE imagery
    SET visibility = _visibility
    WHERE imagery_uid = _imagery_id;

$$ LANGUAGE SQL;

-- Delete single imagery by id
CREATE OR REPLACE FUNCTION archive_imagery(_imagery_id integer)
 RETURNS void AS $$

    UPDATE imagery
    SET archived = true
    WHERE imagery_uid = _imagery_id;

$$ LANGUAGE SQL;

-- FIXME, source config wont need to be stripped if the function is updated
-- Returns all rows in imagery for which visibility = "public"
CREATE OR REPLACE FUNCTION select_public_imagery()
 RETURNS setOf imagery_return AS $$

    SELECT imagery_uid,
        visibility,
        title,
        attribution,
        extent,
        source_config
    FROM imagery
    WHERE visibility = 'public'
        AND archived = FALSE

$$ LANGUAGE SQL;
