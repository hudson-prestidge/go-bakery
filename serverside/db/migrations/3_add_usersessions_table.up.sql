CREATE TABLE usersessions (
  sessionkey TEXT PRIMARY KEY,
  userid INTEGER NOT NULL REFERENCES users(id),
  logintime TIMESTAMPTZ NOT NULL,
  lastseentime TIMESTAMPTZ NOT NULL
);
