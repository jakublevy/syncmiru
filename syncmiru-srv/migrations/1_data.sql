-- Add migration script here

INSERT INTO "group" (
    name, public, admin)
VALUES ('admin', true, true);

INSERT INTO "group" (
    name, public, admin)
VALUES ('@everyone', false, false);