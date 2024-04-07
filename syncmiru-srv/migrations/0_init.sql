CREATE TABLE "users" (
                         "id" INTEGER GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
                         "username" varchar(16) NOT NULL,
                         "display_name" varchar(24) NOT NULL,
                         "email" varchar(320) NOT NULL,
                         "avatar" bytea,
                         "hash" varchar(72) NOT NULL,
                         "salt" varchar(16) NOT NULL,
                         "reg_at" timestamp NOT NULL,
                         "reg_tkn_id" integer
);

CREATE TABLE "reg_tkn" (
                           "id" INTEGER GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
                           "name" varchar(16) NOT NULL,
                           "key" varchar(32) NOT NULL,
                           "max_reg" integer
);

CREATE TABLE "group" (
                         "id" INTEGER GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
                         "name" varchar(16) UNIQUE NOT NULL,
                         "public" bool NOT NULL,
                         "admin" bool NOT NULL
);

CREATE TABLE "member" (
                          "user_id" integer,
                          "group_id" integer,
                          PRIMARY KEY ("user_id", "group_id")
);

CREATE TABLE "room" (
                        "id" INTEGER GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
                        "name" varchar(32),
                        "playback_speed" decimal(3,2) NOT NULL,
                        "show_order" integer NOT NULL
);

CREATE TABLE "perm" (
                        "id" INTEGER GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
                        "name_id" varchar(16) UNIQUE NOT NULL,
                        "name_pretty" varchar(64) NOT NULL,
                        "desc" varchar(64) NOT NULL
);

CREATE TABLE "perm_assignment" (
                                   "id" INTEGER GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
                                   "state" integer NOT NULL,
                                   "perm_id" integer NOT NULL,
                                   "group_id" integer,
                                   "room_id" integer,
                                   "user_id" integer,
                                   "parent" integer
);

CREATE TABLE "sessions" (
                            "id" INTEGER GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
                            "jwt" text NOT NULL,
                            "ip" varchar(45) NOT NULL,
                            "os" varchar(16) NOT NULL,
                            "serial" text NOT NULL,
                            "last_access_at" timestamp NOT NULL,
                            "user_id" integer NOT NULL
);

CREATE TABLE "session_deleted" (
                                   "id" INTEGER GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
                                   "jwt" text NOT NULL
);

CREATE TABLE "email_sent_log" (
                                  "id" INTEGER GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
                                  "reason" integer NOT NULL,
                                  "user_id" integer NOT NULL,
                                  "sent_at" timestamp NOT NULL
);

ALTER TABLE "users" ADD FOREIGN KEY ("reg_tkn_id") REFERENCES "reg_tkn" ("id");

ALTER TABLE "member" ADD FOREIGN KEY ("user_id") REFERENCES "users" ("id");

ALTER TABLE "member" ADD FOREIGN KEY ("group_id") REFERENCES "group" ("id");

ALTER TABLE "perm_assignment" ADD FOREIGN KEY ("perm_id") REFERENCES "perm" ("id");

ALTER TABLE "perm_assignment" ADD FOREIGN KEY ("group_id") REFERENCES "group" ("id");

ALTER TABLE "perm_assignment" ADD FOREIGN KEY ("room_id") REFERENCES "room" ("id");

ALTER TABLE "perm_assignment" ADD FOREIGN KEY ("user_id") REFERENCES "users" ("id");

ALTER TABLE "perm_assignment" ADD FOREIGN KEY ("parent") REFERENCES "perm_assignment" ("id");

ALTER TABLE "sessions" ADD FOREIGN KEY ("user_id") REFERENCES "users" ("id");

ALTER TABLE "email_sent_log" ADD FOREIGN KEY ("user_id") REFERENCES "users" ("id");
