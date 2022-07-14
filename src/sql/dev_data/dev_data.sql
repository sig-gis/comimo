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
INSERT INTO projects 
            (project_uid,user_rid,name,regions,data_layer,boundary,status,created_date,closed_date)
VALUES
(1, 1, E'Demo 1', E'{mun_AMAZONAS_LETICIA,mun_ANTIOQUIA_ABRIAQUÍ,mun_ANTIOQUIA_AMALFI,mun_ANTIOQUIA_BELLO,mun_ANTIOQUIA_CAREPA}',E'2022-05-01-P', E'SRID=4326;POLYGON((-75.09868365417593 6.908474514731402,-75.09868365417593 7.157607349602598,-74.84930821127706 7.157607349602598,-74.84930821127706 6.908474514731402,-75.09868365417593 6.908474514731402))', E'active', E'2022-07-14', NULL);

SELECT setval(pg_get_serial_sequence('projects', 'project_uid'), (SELECT MAX(project_uid) FROM projects) + 1);

-- Add plots
INSERT INTO plots
            (plot_uid, project_rid, lat, lon, geom, answer)
VALUES
(7,1,-74.89825112346918,6.962203029787672,E'SRID=4326;POLYGON((-74.90069544583751 6.959760619239656,-74.90069544583751 6.964645440084037,-74.89580680128998 6.964645440084037,-74.89580680128998 6.959760619239656,-74.90069544583751 6.959760619239656))',NULL),
(8,1,-74.95691318525863,7.011061777962963,E'SRID=4326;POLYGON((-74.95935776452176 7.008619369283383,-74.95935776452176 7.013504186389193,-74.95446860607564 7.013504186389193,-74.95446860607564 7.008619369283383,-74.95935776452176 7.008619369283383))',NULL),
(9,1,-75.0742417091068,6.932900049624147,E'SRID=4326;POLYGON((-75.07668588180263 6.930457634251529,-75.07668588180263 6.93534246474617,-75.07179753627301 6.93534246474617,-75.07179753627301 6.930457634251529,-75.07668588180263 6.930457634251529))',NULL),
(10,1,-75.06446513778837,6.94267234544702,E'SRID=4326;POLYGON((-75.06690936139368 6.940229930569724,-75.06690936139368 6.94511476007338,-75.06202091406327 6.94511476007338,-75.06202091406327 6.940229930569724,-75.06690936139368 6.940229930569724))',NULL),
(11,1,-75.08401511357522,6.932898421544957,E'SRID=4326;POLYGON((-75.08645928567402 6.930456006751313,-75.08645928567402 6.935340836088002,-75.08157094132031 6.935340836088002,-75.08157094132031 6.930456006751313,-75.08645928567402 6.930456006751313))',NULL),
(12,1,-75.08890406165057,6.932897531676592,E'SRID=4326;POLYGON((-75.09134823342347 6.9304551171994,-75.09134823342347 6.93533994590318,-75.08645988971246 6.93533994590318,-75.08645988971246 6.9304551171994,-75.09134823342347 6.9304551171994))',NULL),
(13,1,-74.99113712716347,7.006178247546917,E'SRID=4326;POLYGON((-74.99358168161487 7.003735837695338,-74.99358168161487 7.008620657145328,-74.98869257272855 7.008620657145328,-74.98869257272855 7.003735837695338,-74.99358168161487 7.003735837695338))',NULL),
(14,1,-75.00580360317653,7.152722567953912,E'SRID=4326;POLYGON((-75.00824892913272 7.15028017342863,-75.00824892913272 7.155164962220839,-75.00335827720954 7.155164962220839,-75.00335827720954 7.15028017342863,-75.00824892913272 7.15028017342863))',NULL),
(15,1,-74.98624798587092,6.986640920246184,E'SRID=4326;POLYGON((-74.98869243866572 6.98419850841397,-74.98869243866572 6.98908333182592,-74.98380353310169 6.98908333182592,-74.98380353310169 6.98419850841397,-74.98869243866572 6.98419850841397))',NULL),
(16,1,-74.88844332280463,7.103864193267861,E'SRID=4326;POLYGON((-74.89088838517617 7.101421798239668,-74.89088838517617 7.106306588039382,-74.88599826064069 7.106306588039382,-74.88599826064069 7.101421798239668,-74.89088838517617 7.101421798239668))',NULL),
(17,1,-74.93736258085228,6.9475580231791785,E'SRID=4326;POLYGON((-74.93980682988372 6.945115608716913,-74.93980682988372 6.950000437390338,-74.93491833193724 6.950000437390338,-74.93491833193724 6.945115608716913,-74.93980682988372 6.945115608716913))',NULL),
(18,1,-75.09379300906495,6.932896591489858,E'SRID=4326;POLYGON((-75.0962371804938 6.930454177347013,-75.0962371804938 6.935339005382096,-75.09134883746184 6.935339005382096,-75.09134883746184 6.930454177347013,-75.0962371804938 6.930454177347013))',NULL),
(19,1,-74.98135614456368,7.045256821547324,E'SRID=4326;POLYGON((-74.98380090305612 7.042814415857557,-74.98380090305612 7.047699226982533,-74.9789113861059 7.047699226982533,-74.9789113861059 7.042814415857557,-74.98380090305612 7.042814415857557))',NULL),
(20,1,-75.09378915136625,6.913359347209595,E'SRID=4326;POLYGON((-75.09623322226689 6.910916931065223,-75.09623322226689 6.91580176310405,-75.09134508029138 6.91580176310405,-75.09134508029138 6.910916931065223,-75.09623322226689 6.910916931065223))',NULL),
(21,1,-74.85419884700147,7.1478141559053805,E'SRID=4326;POLYGON((-74.85664413903618 7.145371768808084,-74.85664413903618 7.150256542744415,-74.85175355523818 7.150256542744415,-74.85175355523818 7.145371768808084,-74.85664413903618 7.145371768808084))',NULL),
(22,1,-75.05957608617162,6.942672984677451,E'SRID=4326;POLYGON((-75.06202031001202 6.940230569573147,-75.06202031001202 6.94511539953082,-75.05713186222052 6.94511539953082,-75.05713186222052 6.940230569573147,-75.06202031001202 6.940230569573147))',NULL),
(23,1,-74.9520108183746,7.133183024132852,E'SRID=4326;POLYGON((-74.95445603971511 7.130740628393498,-74.95445603971511 7.135625419614534,-74.94956559712344 7.135625419614534,-74.94956559712344 7.130740628393498,-74.95445603971511 7.130740628393498))',NULL);

SELECT setval(pg_get_serial_sequence('plots', 'plot_uid'), (SELECT MAX(plot_uid) FROM plots) + 1);
