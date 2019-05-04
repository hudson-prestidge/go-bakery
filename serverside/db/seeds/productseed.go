package main

import (
  "log"
  "database/sql"
  _ "github.com/lib/pq"
  "os"
  "fmt"
)

func CreateDbConnectionString() string {
  user := os.Getenv("DATABASE_USER")
  dbname := os.Getenv("DATABASE")
  password := os.Getenv("DATABASE_PASSWORD")
  host := os.Getenv("DATABASE_HOST")
  port := os.Getenv("DATABASE_PORT")
  connectionString := fmt.Sprintf("user=%s dbname=%s password=%s sslmode=disable host=%s port=%s", user, dbname, password, host, port)
  return connectionString
}

func main() {
  connStr := CreateDbConnectionString()
  db, err := sql.Open("postgres", connStr)
  if err != nil {
    log.Printf("?", err)
  }
  defer db.Close()
  tx, err := db.Begin()
  if err != nil {
    log.Printf("?", err)
  }
  defer tx.Commit()
  stmt, err := tx.Prepare(`INSERT INTO products(id, name, image_name, price)
  VALUES (1, 'Bread', 'Bread', 200),
  (2, 'Mini Pies', 'Minipie', 120),
  (3, 'Custard Slice', 'Custardslice', 250),
  (4, 'Pinwheel Scone', 'Pinwheelscone', 150),
  (5, 'Blueberry Danish', 'Blueberrydanish', 320),
  (6, 'Apricot Danish', 'Apricotdanish', 320)
  ` )
  if err != nil {
    log.Printf("?", err)
  }
  _, err = stmt.Exec()
  if err != nil {
    log.Printf("?", err)
  }
}
