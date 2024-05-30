INSERT INTO "users" (
    username, display_name, email, avatar, hash, reg_tkn_id, verified)
VALUES ('suni', 'Suni Suni', 'ahoj@neco.cz', NULL, 'hash', NULL, FALSE);

INSERT INTO "settings" (
    playback_speed, desync_tolerance, minor_desync_playback_change, minor_desync_action, major_desync_min, major_desync_action)
VALUES (1.0, 2.0, 0.05, 'slow-down', 5.0, 'rewind')