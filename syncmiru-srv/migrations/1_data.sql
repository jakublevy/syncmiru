-- Add migration script here

INSERT INTO "users" (
    username, display_name, email, avatar, hash, reg_tkn_id, verified)
VALUES ('suni', 'Suni Suni', 'ahoj@neco.cz', NULL, 'hash', NULL, FALSE);