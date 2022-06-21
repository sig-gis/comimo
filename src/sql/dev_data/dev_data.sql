-- NAMESPACE: dev-data


-- Adds an administrator and a user
INSERT INTO users
    (user_uid, username, email, password, token, verified, role, full_name, sector, institution, default_lang)
VALUES
(1, 'admin', 'admin@com.dev', crypt('admin', gen_salt('bf')), '2022-04-22', TRUE, 'admin', 'COM Admin', 'academic', 'dev', 'en'),
(2, 'user', 'user@com.dev', crypt('user', gen_salt('bf')), '2022-04-22', TRUE, 'user', 'COM User', 'academic', 'dev', 'en');

SELECT setval(pg_get_serial_sequence('users', 'user_uid'), (SELECT MAX(user_uid) FROM users) + 1);

-- Adds user_mines
INSERT INTO user_mines
            (user_mine_uid, user_rid, lat, lon, reported_date)
VALUES
(1, 1, 4.867040157318115, -71.9569320678711, '2022-04-19'),
(2, 2, 4.867040157318115, -71.9569320678711, '2022-04-19');

SELECT setval(pg_get_serial_sequence('user_mines', 'user_mine_uid'), (SELECT MAX(user_mine_uid) FROM user_mines) + 1);

-- Adds subscriptions
INSERT INTO subscriptions
            (subscription_uid, user_rid, region, last_alert_for, created_date)
VALUES
(1, 1, 'mun_NARIÑO_CONSACÁ', '2022-04-19', '2022-04-19'),
(2, 2, 'mun_NARIÑO_CONSACÁ', '2022-04-19', '2022-04-19');

SELECT setval(pg_get_serial_sequence('subscriptions', 'subscription_uid'), (SELECT MAX(subscription_uid) FROM subscriptions) + 1);

-- Adds a project
INSERT INTO projects (
  project_uid,
  user_rid,
  name,
  regions,
  data_layer,
  boundary,
  status,
  created_date
) VALUES (
  1,
  1,
  'Sample Project',
  '{"mun_AMAZONAS_LA PEDRERA", "mun_AMAZONAS_LA CHORRERA", "mun_AMAZONAS_LETICIA"}',
  '2022-01-01',
  ST_SetSRID(ST_GeomFromGeoJSON('{"type":"Polygon","coordinates":[[[95,10.5],[95,22.5],[107,22.5],[107,10.5],[95,10.5]]]}'), 4326),
  'active',
  '2022-04-18'
), (
  2,
  2,
  'Sample Project2',
  '{"mun_ANTIOQUIA_SANTA BÁRBARA", "mun_ANTIOQUIA_VIGIA DEL FUERTE", "mun_ANTIOQUIA_YARUMAL"}',
  '2022-01-01',
  ST_SetSRID(ST_GeomFromGeoJSON('{"type":"Polygon","coordinates":[[[95,10.5],[95,22.5],[107,22.5],[107,10.5],[95,10.5]]]}'), 4326),
  'active',
  '2022-04-18'
);

SELECT setval(pg_get_serial_sequence('projects', 'project_uid'), (SELECT MAX(project_uid) FROM projects) + 1);

-- Add plots
INSERT INTO plots
            (plot_uid, project_rid, geom, answer)
VALUES
(1, 1, ST_SetSRID(ST_GeomFromGeoJSON('{"type":"Point","coordinates":[102.999640127073,22.0468074686287]}'), 4326), 'No Mina'),
(2, 1, ST_SetSRID(ST_GeomFromGeoJSON('{"type":"Point","coordinates":[98.5680216776391,12.3793535946933]}'), 4326), 'Mina'),
(3, 1, ST_SetSRID(ST_GeomFromGeoJSON('{"type":"Point","coordinates":[106.718471401115,13.7459074361384]}'), 4326), NULL);

SELECT setval(pg_get_serial_sequence('plots', 'plot_uid'), (SELECT MAX(plot_uid) FROM plots) + 1);
