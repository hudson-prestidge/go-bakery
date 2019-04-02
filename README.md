# go-bakery
Simple shopping cart web app built with go backend.

broad plan:
shopping cart for mini pies and other baked goods
using
  GO
  typescript
  sass
to show I can work with different technologies!

once this project is complete I'm going to build the portfolio site that houses this and the previous project(https://github.com/hudson-prestidge/note-taking-express)

Relevant Database Schema:


Products table{
  id SERIAL PRIMARY KEY NOT NULL
  name VARCHAR(50) UNIQUE NOT NULL
  image_name VARCHAR NOT NULL
  price INTEGER NOT NULL
}

To add:

Users table{
  id SERIAL PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  passwordhash TEXT NOT NULL,
  isdisabled BOOLEAN
}

 usersessions table{
  sessionkey TEXT PRIMARY KEY,
  userid INTEGER NOT NULL REFERENCES users(id),
  logintime TIMESTAMP NOT NULL,
  lastseentime TIMESTAMP NOT NULL
}

Transactions table{
  id SERIAL PRIMARY KEY
  user_id INTEGER REFERENCES users(id) NOT NULL
  product_id INTEGER REFERENCES product(id) NOT NULL
  time DATETIME NOT NULL
}

Colors in mind so far:

#3E92CC
RGB: 62, 147, 204
#2A628F
RGB: 42, 98, 143
#13293D
RGB: 19, 41, 61
#16324F
RGB: 22, 50, 79
#18435A
RGB: 24, 67, 90

External dependencies:

"github.com/lib/pq"
"github.com/golang-migrate/migrate"
