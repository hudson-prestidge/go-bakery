package db

import(
  "log"
  "database/sql"
  _ "github.com/lib/pq"
  "net/http"
  "encoding/json"
  "strings"
  "fmt"
  "golang.org/x/crypto/bcrypt"
)

type Product struct {
  Id int
  Name string
  Price int
}

type User struct {
  Id int
  Username string
  Passwordhash string
  Passwordsalt string
  Isdisabled bool
}

func GetProducts() http.HandlerFunc {
  return func(w http.ResponseWriter, r *http.Request){
    connStr := "user=postgres dbname=postgres password=test sslmode=disable host=127.0.0.1"
    db, err := sql.Open("postgres", connStr)
    defer db.Close()
    if err != nil {
      log.Printf("?", err)
    }
    var (
      id int
      name string
      price int
    )
    rows, err := db.Query("SELECT id, name, price FROM products")
    if err != nil {
      log.Printf("?", err)
    }
    w.Header().Set("Content-Type", "application/json")
    w.WriteHeader(http.StatusCreated)
    var data []Product
    defer rows.Close()
    for rows.Next() {
      err := rows.Scan(&id, &name, &price)
      if err != nil {
        log.Printf("?", err)
      }
      p := Product{Id: id, Name: name, Price: price}
      data = append(data, p)
    }
    js, err := json.Marshal(data)
    if err != nil {
      log.Printf("?", err)
    }
    w.Write(js)
  }
}

func AddUser() http.HandlerFunc {
  return func(w http.ResponseWriter, r *http.Request) {
    if r.Method == "POST" {
      r.ParseForm()
      username := strings.Join(r.Form["username"], "")
      password := strings.Join(r.Form["password"], "")
      hashedpw, err := bcrypt.GenerateFromPassword([]byte(password), 14)
      if err != nil {
        log.Printf("?", err)
      }
      connStr := "user=postgres dbname=postgres password=test sslmode=disable host=127.0.0.1"
      db, err := sql.Open("postgres", connStr)
      defer db.Close()
      if err != nil {
        log.Printf("?", err)
      }
      tx, err := db.Begin()
      defer tx.Commit()
      if err != nil {
        log.Printf("?", err)
      }
      formattedStatement := fmt.Sprintf("INSERT INTO users(username, passwordhash, isdisabled) VALUES('%s', '%s', 'false')", username, string(hashedpw))
      stmt, err := tx.Prepare(formattedStatement)
      if err != nil {
        log.Printf("?", err)
      }
      _, err = stmt.Exec()
      if err != nil {
        log.Printf("?", err)
      }
      http.Redirect(w, r, "/index.html", 303)
      }
   }
}

func AuthenticateUser() http.HandlerFunc {
    return func(w http.ResponseWriter, r *http.Request) {
      log.Printf("attempted login")
      r.ParseForm()
      username := strings.Join(r.Form["username"], "")
      password := strings.Join(r.Form["password"], "")
      connStr := "user=postgres dbname=postgres password=test sslmode=disable host=127.0.0.1"
      db, err := sql.Open("postgres", connStr)
      defer db.Close()
      if err != nil {
        log.Printf("?", err)
      }
      query := fmt.Sprintf("SELECT * FROM users WHERE username='%s'", username)
      rows, err := db.Query(query)
      defer rows.Close()
      if err != nil {
        log.Printf("?", err)
      }
      for rows.Next() {
        var (
          id int
          username string
          passwordhash string
          isdisabled bool
        )
        err := rows.Scan(&id, &username, &passwordhash, &isdisabled)
        if err != nil {
          log.Printf("?", err)
        }
        u := User{Id: id, Username: username, Passwordhash: passwordhash, Isdisabled: isdisabled}
        err = bcrypt.CompareHashAndPassword([]byte(u.Passwordhash), []byte(password))
        if err != nil {
          log.Printf("password doesn't match")
        } else {
          log.Printf("login successful")
        }
      }
      http.Redirect(w, r, "/index.html", 303)
    }
}
