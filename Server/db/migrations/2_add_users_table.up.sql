CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  passwordhash TEXT NOT NULL,
  isdisabled BOOLEAN
);
