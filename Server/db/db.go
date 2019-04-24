package db

import(
  "log"
  "database/sql"
  "github.com/lib/pq"
  "net/http"
  "encoding/json"
  "strings"
  "fmt"
  "golang.org/x/crypto/bcrypt"
  "crypto/rand"
  "time"
  "strconv"
)

type Cart struct {
  Products []Product
  Items pq.Int64Array
}

type Product struct {
  Id int
  Name string
  Price int
}

type User struct {
  Id int
  Username string
  Passwordhash string
  Isdisabled bool
  Cart []int
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

        http.Error(w, `{ "error": "not logged in"}`, 403)
        return
      } else {
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
}

func AddItemToCart() http.HandlerFunc {
  return func (w http.ResponseWriter, r *http.Request) {
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

    if r.Method == "GET" {
      formattedStatement := fmt.Sprintf(`SELECT products.id, products.name, products.price, cart FROM users
                                      INNER JOIN usersessions ON users.id=usersessions.userid
                                      LEFT JOIN products ON products.id=ANY(users.cart)
                                      WHERE sessionKey='%s'`, sessionKey)
      rows, err := db.Query(formattedStatement)
      if err != nil {
        log.Printf("?", err)
      }
      var (
          id int
          name string
          price int
          cart pq.Int64Array
        )

      defer rows.Close()
      var data Cart
      for rows.Next() {
        err := rows.Scan(&id, &name, &price, &cart)
        if err != nil {
          http.Error(w, "no items in cart", 406)
          return
        }
        p := Product{Id: id, Name: name, Price: price}
        data.Products = append(data.Products, p)
      }
      w.Header().Set("Content-Type", "application/json")
      w.WriteHeader(http.StatusCreated)
      data.Items = cart
      js, err := json.Marshal(data)
      if err != nil {
        log.Printf("?", err)
      }
      w.Write(js)
    }

    if r.Method == "PUT" {
      decoder := json.NewDecoder(r.Body)
      var p TestStruct
      err := decoder.Decode(&p)
      if err != nil {
        log.Printf("can't decode product id", err)
      }
      productId, err := strconv.Atoi(p.Id)
      if err != nil {
        log.Printf("can't convert product id", err)
      }
      formattedStatement := fmt.Sprintf("UPDATE users SET cart = cart || '{%d}' FROM usersessions WHERE users.id = usersessions.userid AND usersessions.sessionkey = '%s'", productId, sessionKey)
      stmt, err := db.Prepare(formattedStatement)
      if err != nil {
        log.Printf("can't prepare statement", err)
      }
      res, err := stmt.Exec()
      if err != nil {
        log.Printf("can't execute statement", err)
      }
      rowCnt, err := res.RowsAffected()
      if err != nil {
        log.Printf("can't get rows affected", err)
      }
      if rowCnt == 0 {
        http.Error(w, "You need to log in to add items to your cart.", 403)
      } else {
        w.Write([]byte("Item added to cart!"))
      }
    }
  }
}

func UserLogin() http.HandlerFunc {
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
        http.Redirect(w, r, "/login.html?attempt=failed", 303)
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
        cookie := http.Cookie{Name:"sessionKey" , Value: sessionKey, Path:"/", Expires: cookieExpiration, HttpOnly: true}
        http.SetCookie(w, &cookie)
        http.Redirect(w, r, "/", 303)
      }
    }
}

func LogoutUser() http.HandlerFunc{
  return func(w http.ResponseWriter, r *http.Request) {
    cookie := http.Cookie{Name:"sessionKey", Value: "", MaxAge: -1, Path:"/" , HttpOnly: true}
    http.SetCookie(w, &cookie)
    http.Redirect(w, r, "/index.html", 303)
  }
}

func HandleTransactions() http.HandlerFunc {
  return func(w http.ResponseWriter, r *http.Request) {
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

    if r.Method == "GET" {
      formattedStatement := fmt.Sprintf(`SELECT products.id, products.name, products.price, product_list FROM users
                                      INNER JOIN usersessions ON users.id=usersessions.userid
                                      INNER JOIN transactions ON users.id=transactions.user_id
                                      LEFT JOIN products ON products.id=ANY(transactions.product_list)
                                      WHERE sessionKey='%s'`, sessionKey)
      rows, err := db.Query(formattedStatement)
      if err != nil {
        log.Printf("?", err)
      }
      var (
          id int
          name string
          price int
          product_list pq.Int64Array
        )
      w.Header().Set("Content-Type", "application/json")
      w.WriteHeader(http.StatusCreated)
      defer rows.Close()
      var data Cart
      for rows.Next() {
        err := rows.Scan(&id, &name, &price, &product_list)
        if err != nil {
          log.Printf("?", err)
        }
        p := Product{Id: id, Name: name, Price: price}
        data.Products = append(data.Products, p)
      }
      data.Items = product_list
      js, err := json.Marshal(data)
      if err != nil {
        log.Printf("?", err)
      }
      w.Write(js)
    }

    if r.Method == "POST" {
      tx, err := db.Begin()
      defer tx.Commit()
      formattedStatement := fmt.Sprintf(`INSERT INTO transactions(user_id, product_list)
                                      SELECT id, cart
                                      FROM users INNER JOIN usersessions
                                      ON users.id=usersessions.userid
                                      WHERE sessionkey='%s'
                                      AND array_length(cart, 1) > 0`, sessionKey)
      stmt, err := tx.Prepare(formattedStatement)
      if err != nil {
        log.Printf("?", err)
      }
      _, err = stmt.Exec()
      if err != nil {
        log.Printf("?", err)
      }
      formattedStatement = fmt.Sprintf(`UPDATE users SET cart = '{}' FROM usersessions
                                    WHERE users.id = usersessions.userid
                                    AND usersessions.sessionkey = '%s' `, sessionKey)
      stmt, err = tx.Prepare(formattedStatement)
      if err != nil {
        log.Printf("?", err)
      }
      _, err = stmt.Exec()
      if err != nil {
        log.Printf("?", err)
      }
    }
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
