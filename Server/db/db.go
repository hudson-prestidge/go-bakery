package db

import(
  "log"
  "database/sql"
  _ "github.com/lib/pq"
  "net/http"
  "encoding/json"
  "strings"
  "fmt"
  "crypto/rand"
  "golang.org/x/crypto/bcrypt"
  "encoding/base64"
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
    defer db.Close()
  }
}

func AddUser() http.HandlerFunc {
  return func(w http.ResponseWriter, r *http.Request) {
    if r.Method == "POST" {
      salt := make([]byte, 64)
      _, err := rand.Read(salt)
      r.ParseForm()
      username := strings.Join(r.Form["username"], "")
      password := strings.Join(r.Form["password"], "")
      passwordBytes := []byte(password)
      saltedpw := append(passwordBytes, salt...)
      hashedpw, err := bcrypt.GenerateFromPassword(saltedpw, 1)
      if err != nil {
        log.Printf("?", err)
      }
      encodedHash := base64.StdEncoding.EncodeToString(hashedpw)
      encodedSalt := base64.StdEncoding.EncodeToString(salt)
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
      formattedStatement := fmt.Sprintf("INSERT INTO users(username, passwordhash, passwordsalt, isdisabled) VALUES('%s', '%s', '%s', 'false')", username, encodedHash, encodedSalt)
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
