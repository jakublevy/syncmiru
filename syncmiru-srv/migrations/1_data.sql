INSERT INTO "users" (
    username, display_name, email, avatar, hash, reg_tkn_id, verified)
VALUES ('suni', 'Suni Suni', 'ahoj@neco.cz', NULL, 'hash', NULL, FALSE);

INSERT INTO "settings" (
    playback_speed, desync_tolerance, minor_desync_playback_slow, major_desync_min)
VALUES (1.0, 2.0, 0.05, 5.0)