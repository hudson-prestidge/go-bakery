package db

import(
  "log"
  "database/sql"
  _ "github.com/lib/pq"
  "net/http"
)

func GetProducts() http.HandlerFunc {
  return func(w http.ResponseWriter, r *http.Request){
    connStr := "user=postgres dbname=postgres password=test sslmode=disable host=127.0.0.1"
    db, err := sql.Open("postgres", connStr)
    if err != nil {
      log.Fatal(err)
    }
    var (
      id int
      name string
    )
    rows, err := db.Query("SELECT id, name FROM products")
    if err != nil {
      log.Fatal(err)
    }
    defer rows.Close()
    for rows.Next() {
      err := rows.Scan(&id, &name)
      if err != nil {
        log.Fatal(err)
      }
      // w.Write([]byte("" + name))
      log.Print(name)
    }
    defer db.Close()
  }
}
