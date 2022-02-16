-- NAMESPACE: dev-data

-- Adds an administrator and a user
INSERT INTO users
    (user_uid, email, password, administrator, reset_key, verified)
VALUES
    (1, 'admin@comimo.dev', crypt('admin', gen_salt('bf')), TRUE, null, TRUE),
    (2, 'user@comimo.dev', crypt('user', gen_salt('bf')), FALSE, null, TRUE),
    (3, 'test@comimo.dev', crypt('test', gen_salt('bf')), FALSE, null, TRUE);

SELECT setval(pg_get_serial_sequence('users', 'user_uid'), (SELECT MAX(user_uid) FROM users) + 1);

-- Adds an imagery
INSERT INTO imagery
    (imagery_uid, institution_rid, visibility, title, attribution, extent, source_config)
VALUES
    (1, 1, 'public', 'Open Street Maps', 'Open Street Maps', null, '{"type": "OSM"}');

SELECT setval(pg_get_serial_sequence('imagery', 'imagery_uid'), (SELECT MAX(imagery_uid) FROM imagery) + 1);

-- Adds a project
INSERT INTO projects (
    project_uid,
    institution_rid,
    availability,
    published_date,
    name,
    description,
    privacy_level,
    boundary,
    plot_distribution,
    num_plots,
    plot_shape,
    plot_size,
    sample_distribution,
    samples_per_plot,
    survey_questions,
    survey_rules,
    created_date,
    options,
    imagery_rid,
    allow_drawn_samples
) VALUES (
    1,
    1,
    'published',
    Now(),
    'Test Project',
    'This project is a default project for development testing.',
    'public',
    ST_SetSRID(ST_GeomFromGeoJSON('{"type":"Polygon","coordinates":[[[95,10.5],[95,22.5],[107,22.5],[107,10.5],[95,10.5]]]}'), 4326),
    'random',
    3,
    'circle',
    200,
    'random',
    10,
    '{"0":{"answers":{"0":{"color":"#1ec61b","answer":"Forest"},"1":{"color":"#9cf135","answer":"Grassland"},"2":{"color":"#d5de85","answer":"Bare Surface"},"3":{"color":"#8b9084","answer":"Impervious Surface"},"4":{"color":"#f2c613","answer":"Agriculture"},"5":{"color":"#6a3a75","answer":"Urban"},"6":{"color":"#2f4dc0","answer":"Water"},"7":{"color":"#ffffff","answer":"Cloud"},"8":{"color":"#000000","answer":"Unknown"}},"dataType":"text","question":"Land Use","componentType":"button","parentAnswerIds":[],"parentQuestionId":-1},"1":{"answers":{"0":{"color":"#1527f6","answer":"Placeholder Text"}},"dataType":"text","question":"Test Regex Match","componentType":"input","parentAnswerIds":[],"parentQuestionId":-1},"2":{"answers":{"0":{"color":"#1527f6","answer":"100"}},"dataType":"number","question":"Test Numeric Range","componentType":"input","parentAnswerIds":[],"parentQuestionId":-1},"3":{"answers":{"0":{"color":"#1527f6","answer":"100"}},"dataType":"number","question":"Test Sum of Answers","componentType":"input","parentAnswerIds":[],"parentQuestionId":-1},"4":{"answers":{"0":{"color":"#1527f6","answer":"100"}},"dataType":"number","question":"Test Matching Sums 1","componentType":"input","parentAnswerIds":[],"parentQuestionId":-1},"5":{"answers":{"0":{"color":"#1527f6","answer":"100"}},"dataType":"number","question":"Test Matching Sums 2","componentType":"input","parentAnswerIds":[],"parentQuestionId":-1},"6":{"answers":{"0":{"color":"#1ec61b","answer":"Forest"},"1":{"color":"#9cf135","answer":"Grassland"},"2":{"color":"#d5de85","answer":"Bare Surface"},"3":{"color":"#8b9084","answer":"Impervious Surface"},"4":{"color":"#f2c613","answer":"Agriculture"},"5":{"color":"#6a3a75","answer":"Urban"},"6":{"color":"#2f4dc0","answer":"Water"},"7":{"color":"#ffffff","answer":"Cloud"},"8":{"color":"#000000","answer":"Unknown"}},"dataType":"text","question":"Test Incompatible Answers","componentType":"button","parentAnswerIds":[],"parentQuestionId":-1}}',
    '[{"id":0,"regex":"^[a-zA-Z0-9_.-]*$","ruleType":"text-match","questionId":1},{"id":1,"max":100,"min":0,"ruleType":"numeric-range","questionId":2},{"id":2,"ruleType":"sum-of-answers","validSum":200,"questionIds":[2,3]},{"id":3,"ruleType":"matching-sums","questionIds1":[2,3],"questionIds2":[4,5]},{"id":4,"ruleType":"incompatible-answers","answerId1":0,"answerId2":8,"questionId1":0,"questionId2":6}]',
    Now(),
    '{"showGEEScript": false, "autoLaunchGeoDash": false, "collectConfidence": true, "showPlotInformation": false}',
    1,
    FALSE
);

SELECT setval(pg_get_serial_sequence('projects', 'project_uid'), (SELECT MAX(project_uid) FROM projects) + 1);

-- Add 4 plots
INSERT INTO plots
    (plot_uid, project_rid, plot_geom, visible_id)
VALUES
    (1, 1, ST_SetSRID(ST_GeomFromGeoJSON('{"type":"Point","coordinates":[102.999640127073,22.0468074686287]}'), 4326), 1),
    (2, 1, ST_SetSRID(ST_GeomFromGeoJSON('{"type":"Point","coordinates":[98.5680216776391,12.3793535946933]}'), 4326), 2),
    (3, 1, ST_SetSRID(ST_GeomFromGeoJSON('{"type":"Point","coordinates":[106.718471401115,13.7459074361384]}'), 4326), 3);

SELECT setval(pg_get_serial_sequence('plots', 'plot_uid'), (SELECT MAX(plot_uid) FROM plots) + 1);
