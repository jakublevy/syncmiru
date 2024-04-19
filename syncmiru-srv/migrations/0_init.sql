CREATE TYPE "email_reason" AS ENUM (
  'forgotten_password',
  'verify'
);

CREATE TYPE "default_conf" AS ENUM (
  'playback_speed'
);

CREATE TABLE "users" (
                         "id" INTEGER GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
                         "username" varchar(16) UNIQUE NOT NULL,
                         "display_name" varchar(24) NOT NULL,
                         "email" varchar(320) UNIQUE NOT NULL,
                         "avatar" bytea,
                         "hash" varchar(128) NOT NULL,
                         "reg_at" timestamptz NOT NULL DEFAULT (now()),
                         "reg_tkn_id" integer,
                         "verified" bool NOT NULL DEFAULT false
);

CREATE TABLE "reg_tkn" (
                           "id" INTEGER GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
                           "name" varchar(16) NOT NULL,
                           "key" varchar(32) NOT NULL,
                           "max_reg" integer
);

CREATE TABLE "room" (
                        "id" INTEGER GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
                        "name" varchar(32),
                        "playback_speed" decimal(3,2) NOT NULL,
                        "show_order" integer NOT NULL
);

CREATE TABLE "session" (
                           "id" INTEGER GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
                           "jwt" text NOT NULL,
                           "os" varchar(16) NOT NULL,
                           "device_name" text NOT NULL,
                           "hash" varchar(64) NOT NULL,
                           "last_access_at" timestamptz NOT NULL DEFAULT (now()),
                           "user_id" integer NOT NULL
);

CREATE TABLE "session_deleted" (
                                   "id" INTEGER GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
                                   "session_id" integer NOT NULL
);

CREATE TABLE "email_tkn_log" (
                                 "id" INTEGER GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
                                 "reason" email_reason NOT NULL,
                                 "hash" varchar(128) NOT NULL,
                                 "user_id" integer NOT NULL,
                                 "sent_at" timestamptz NOT NULL DEFAULT (now())
);

CREATE TABLE "change_email_log" (
                                    "id" INTEGER GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
                                    "hash_from" varchar(128) NOT NULL,
                                    "hash_to" varchar(128) NOT NULL,
                                    "user_id" integer NOT NULL,
                                    "sent_at" timestamptz NOT NULL DEFAULT (now())
);

CREATE TABLE "default_settings" (
                                    "id" INTEGER GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
                                    "playback_speed" decimal(3,2) NOT NULL
);

ALTER TABLE "users" ADD FOREIGN KEY ("reg_tkn_id") REFERENCES "reg_tkn" ("id");

ALTER TABLE "session" ADD FOREIGN KEY ("user_id") REFERENCES "users" ("id");

ALTER TABLE "session_deleted" ADD FOREIGN KEY ("session_id") REFERENCES "session" ("id");

ALTER TABLE "email_tkn_log" ADD FOREIGN KEY ("user_id") REFERENCES "users" ("id");

ALTER TABLE "change_email_log" ADD FOREIGN KEY ("user_id") REFERENCES "users" ("id");
