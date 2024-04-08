-- Add migration script here

INSERT INTO "group" (
    name, public, admin)
VALUES ('admin', true, true);

INSERT INTO "group" (
    name, public, admin)
VALUES ('@everyone', false, false);


INSERT INTO "users" (
    username, display_name, email, avatar, hash, reg_tkn_id)
VALUES ('suni', 'sddsdff', 'ahoj@neco.cz', NULL, 'hash', NULL);