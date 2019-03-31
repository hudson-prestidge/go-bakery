package db

import(
  "log"
  "database/sql"
  _ "github.com/lib/pq"
  "net/http"
  "encoding/json"
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
      connStr := "user=postgres dbname=postgres password=test sslmode=disable host=127.0.0.1"
      db, err := sql.Open("postgres", connStr)
      if err != nil {
        log.Fatal(err)
      }
      stmt, err := db.Prepare("INSERT INTO users(username, passwordhash, passwordsalt, isdisabled) VALUES ")
      if err != nil {
        log.Fatal(err)
        }
        res, err := stmt.Exec("testuser", "sdfjksdklgh", "srjkbrjkbsrj", false)
        if err != nil {
          log.Fatal(err)
        }
        lastId, err := res.LastInsertId()
        if err != nil {
          log.Fatal(err)
        }
        rowCnt, err := res.RowsAffected()
        if err != nil {
          log.Fatal(err)
        }
        log.Printf("ID = %d, affected = %d\n", lastId, rowCnt)
      } else {
        log.Printf("/api/v1/users GET route")
      }
   }
}
