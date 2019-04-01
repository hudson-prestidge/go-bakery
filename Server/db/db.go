package db

import(
  "log"
  "database/sql"
  _ "github.com/lib/pq"
  "net/http"
  "encoding/json"
  "strings"
  "fmt"
)

type Product struct {
  Id int
  Name string
  Price int
}

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
      price int
    )
    rows, err := db.Query("SELECT id, name, price FROM products")
    if err != nil {
      log.Fatal(err)
    }
    w.Header().Set("Content-Type", "application/json")
    w.WriteHeader(http.StatusCreated)
    var data []Product
    defer rows.Close()
    for rows.Next() {
      err := rows.Scan(&id, &name, &price)
      if err != nil {
        log.Fatal(err)
      }
      p := Product{Id: id, Name: name, Price: price}
      data = append(data, p)
    }
    js, err := json.Marshal(data)
    if err != nil {
      log.Fatal(err)
    }
    w.Write(js)
    defer db.Close()
  }
}

func AddUser() http.HandlerFunc {
  return func(w http.ResponseWriter, r *http.Request) {
    if r.Method == "POST" {
      r.ParseForm()
      username := strings.Join(r.Form["username"], "")
      password := strings.Join(r.Form["password"], "")
      connStr := "user=postgres dbname=postgres password=test sslmode=disable host=127.0.0.1"
      db, err := sql.Open("postgres", connStr)
      if err != nil {
        log.Printf("?", err)
      }
      tx, err := db.Begin()
      if err != nil {
        log.Printf("?", err)
      }
      test := fmt.Sprintf("INSERT INTO users(username, passwordhash, passwordsalt, isdisabled) VALUES('%s', '%s', 'srjkbrjkbsrj', 'false')", username, password)
      stmt, err := tx.Prepare(test)
      if err != nil {
        log.Printf("?", err)
      }
      _, err = stmt.Exec()
      if err != nil {
        log.Printf("?", err)
      }
      tx.Commit()
      defer db.Close()
      http.Redirect(w, r, "/index.html", 303)
      }
   }
}
