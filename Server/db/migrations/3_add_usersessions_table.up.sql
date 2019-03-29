CREATE TABLE usersessions (
  sessionkey TEXT PRIMARY KEY,
  userid INTEGER NOT NULL REFERENCES users(id),
  logintime TIMESTAMP NOT NULL,
  lastseentime TIMESTAMP NOT NULL
);
