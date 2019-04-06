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
  "crypto/rand"
  "time"
  "strconv"
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

type TestStruct struct {
  Id string
}

func GetProducts() http.HandlerFunc {
  return func(w http.ResponseWriter, r *http.Request){
    connStr := "user=postgres dbname=postgres password=test sslmode=disable host=127.0.0.1"
    db, err := sql.Open("postgres", connStr)
    if err != nil {
      log.Printf("?", err)
    }
    defer db.Close()
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
    connStr := "user=postgres dbname=postgres password=test sslmode=disable host=127.0.0.1"
    db, err := sql.Open("postgres", connStr)
    if err != nil {
      log.Printf("?", err)
    }
    defer db.Close()
    if r.Method == "POST" {
      r.ParseForm()
      username := strings.Join(r.Form["username"], "")
      password := strings.Join(r.Form["password"], "")
      hashedpw, err := bcrypt.GenerateFromPassword([]byte(password), 14)
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

    if r.Method == "GET" {
      cookie, err := r.Cookie("sessionKey")
      if err != nil {
        log.Printf("?", err)
      }
      sessionKey := cookie.Value
      var (
        id int
        username string
        isdisabled bool
      )
      formattedStatement := fmt.Sprintf("SELECT id, username, isdisabled FROM users INNER JOIN usersessions ON users.id = usersessions.userid WHERE sessionkey='%s'", sessionKey)
      rows, err := db.Query(formattedStatement)
      if err != nil {
        log.Printf("?", err)
      }
      w.Header().Set("Content-Type", "application/json")
      w.WriteHeader(http.StatusCreated)
      var data []User
      defer rows.Close()
      for rows.Next() {
        err := rows.Scan(&id, &username, &isdisabled)
        if err != nil {
          log.Printf("?", err)
        }
        p := User{Id: id, Username: username, Isdisabled: isdisabled}
        data = append(data, p)
      }
      js, err := json.Marshal(data)
      if err != nil {
        log.Printf("?", err)
      }
      w.Write(js)
    }
  }
}

func AddItemToCart() http.HandlerFunc {
  return func (w http.ResponseWriter, r *http.Request) {
    decoder := json.NewDecoder(r.Body)
    var p TestStruct
    err := decoder.Decode(&p)
    if err != nil {
      log.Printf("?", err)
    }
    productId, err := strconv.Atoi(p.Id)
    log.Printf("?", productId)
    if err != nil {
      log.Printf("?", err)
    }
    connStr := "user=postgres dbname=postgres password=test sslmode=disable host=127.0.0.1"
    db, err := sql.Open("postgres", connStr)
    if err != nil {
      log.Printf("?", err)
    }
    defer db.Close()
    cookie, err := r.Cookie("sessionKey")
    if err != nil {
      log.Printf("?", err)
    }
    sessionKey := cookie.Value
    formattedStatement := fmt.Sprintf("UPDATE users SET cart = cart || '{%d}' FROM usersessions WHERE users.id = usersessions.userid AND usersessions.sessionkey = '%s'", productId, sessionKey)
    log.Printf(formattedStatement)
    stmt, err := db.Prepare(formattedStatement)
    if err != nil {
      log.Printf("?", err)
    }
    _, err = stmt.Exec()
    if err != nil {
      log.Printf("?", err)
    }
  }
}

func AuthenticateUser() http.HandlerFunc {
    return func(w http.ResponseWriter, r *http.Request) {
      r.ParseForm()
      username := strings.Join(r.Form["username"], "")
      password := strings.Join(r.Form["password"], "")
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
      query := fmt.Sprintf("SELECT id, username, passwordhash, isdisabled FROM users WHERE username='%s'", username)
      rows, err := tx.Query(query)

      if err != nil {
        log.Printf("?", err)
      }
      var currentUser User
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
        currentUser = User{Id: id, Username: username, Passwordhash: passwordhash, Isdisabled: isdisabled}
      }
      rows.Close()
      err = bcrypt.CompareHashAndPassword([]byte(currentUser.Passwordhash), []byte(password))
      if err != nil {
        log.Printf("password doesn't match")
      } else {
        sessionKey, err := generateRandomString(50)
        if err != nil {
          log.Printf("failed to generate a session key")
        }
        formattedStatement := fmt.Sprintf("INSERT INTO usersessions(sessionkey, userid, logintime, lastseentime) VALUES('%s', %d, NOW(), NOW())", sessionKey, currentUser.Id)
        stmt, err := tx.Prepare(formattedStatement)
        if err != nil {
          log.Printf("?", err)
        }
        _, err = stmt.Exec()
        if err != nil {
          log.Printf("?", err)
        }
        cookieExpiration := time.Now().Add(time.Hour)
        cookie := http.Cookie{Name:"sessionKey" , Value: sessionKey, Expires: cookieExpiration}
        http.SetCookie(w, &cookie)
      }
      http.Redirect(w, r, "/index.html", 303)
    }
}

func generateRandomString(n int) (string, error) {
  bytes := make([]byte, n)
  _, err := rand.Read(bytes)
  if err != nil {
    return "", err
  }
  const letters = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ"
  for i, b := range bytes {
    bytes[i] = letters[b % byte(len(letters))]
  }
  return string(bytes), nil
}
