package main

import (
  "log"
  "database/sql"
  _ "github.com/lib/pq"
)

func main() {
  connStr := "user=postgres dbname=postgres password=test sslmode=disable host=127.0.0.1"
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
  (2, 'Mini Pies', 'Mini Pies', 120),
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
