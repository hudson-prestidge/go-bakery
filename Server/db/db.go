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
  Image_name string
}

type User struct {
  Id int
  Username string
  Passwordhash string
  Isdisabled bool
  Cart []int
}

type LoginDetails struct {
  Username string
  Password string
}

type Transaction struct {
  Id int
  Product_list pq.Int64Array
  Order_time string
}

type JsonResponse struct {
  Id string
}

type IdList struct {
  List string
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
      image_name string
    )
    rows, err := db.Query("SELECT id, name, price, image_name FROM products")
    if err != nil {
      log.Printf("?", err)
    }
    w.Header().Set("Content-Type", "application/json")
    w.WriteHeader(http.StatusCreated)
    var data []Product
    defer rows.Close()
    for rows.Next() {
      err := rows.Scan(&id, &name, &price, &image_name)
      if err != nil {
        log.Printf("?", err)
      }
      p := Product{Id: id, Name: name, Price: price, Image_name: image_name}
      data = append(data, p)
    }
    js, err := json.Marshal(data)
    if err != nil {
      log.Printf("?", err)
    }
    w.Write(js)
  }
}

func HandleUser() http.HandlerFunc {
  return func(w http.ResponseWriter, r *http.Request) {
    connStr := "user=postgres dbname=postgres password=test sslmode=disable host=127.0.0.1"
    db, err := sql.Open("postgres", connStr)
    if err != nil {
      log.Printf("?", err)
    }
    defer db.Close()

    if r.Method == "POST" {
      // create a new row in the users table
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
      // retrieve a row from the users table
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

func HandleCart() http.HandlerFunc {
  return func (w http.ResponseWriter, r *http.Request) {
    connStr := "user=postgres dbname=postgres password=test sslmode=disable host=127.0.0.1"
    db, err := sql.Open("postgres", connStr)
    if err != nil {
      log.Printf("?", err)
    }
    defer db.Close()
    cookie, err := r.Cookie("sessionKey")
    if err != nil {
      http.Error(w, `Log in to add an item to your cart!`, 403)
      return
    }
    sessionKey := cookie.Value

    if r.Method == "GET" {
      // Returns contents of users cart array
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

    if r.Method == "POST" {
      // Add an item to a user's cart array
      decoder := json.NewDecoder(r.Body)
      var p JsonResponse
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


    if r.Method == "PUT" {
      // Remove one or more items from users cart array, or modify quantity
      // of an item in the users cart array.
      decoder := json.NewDecoder(r.Body)
      var idList IdList
      err := decoder.Decode(&idList)
      if err != nil {
        log.Printf("can't decode updated cart", err)
      }
      var newCart []string = strings.Split(idList.List, ",")
      newCartIds := make([]int, len(newCart))
        for i := 0; i < len(newCart); i++ {
          if newCart[i] != "" {
            newCartIds[i], err = strconv.Atoi(newCart[i])
            if err != nil {
              log.Printf("can't convert product id", err)
            }
          } else {
            // recieved empty cart variable, resetting user cart
            res, err := db.Exec("UPDATE users SET cart = '{}' FROM usersessions WHERE users.id = usersessions.userid AND usersessions.sessionkey = $1", sessionKey)
            if err != nil {
              log.Printf("can't execute statement", err)
            }
            rowCnt, err := res.RowsAffected()
            if err != nil {
              log.Printf("can't get rows affected", err)
            }
            if rowCnt == 0 {
              http.Error(w, "You need to log in to change items in your cart.", 403)
              } else {
                w.Write([]byte("Cart modified!"))
              }
              return
          }
        }
      res, err := db.Exec("UPDATE users SET cart = $1 FROM usersessions WHERE users.id = usersessions.userid AND usersessions.sessionkey = $2", pq.Array(newCartIds), sessionKey)
      if err != nil {
        log.Printf("can't execute statement", err)
      }
      rowCnt, err := res.RowsAffected()
      if err != nil {
        log.Printf("can't get rows affected", err)
      }
      if rowCnt == 0 {
        http.Error(w, "You need to log in to change items in your cart.", 403)
        } else {
          w.Write([]byte("Cart modified!"))
        }
    }

  }
}

func UserLogin() http.HandlerFunc {
    return func(w http.ResponseWriter, r *http.Request) {
      decoder := json.NewDecoder(r.Body)
      var userDetails LoginDetails
      err := decoder.Decode(&userDetails)
      if err != nil {
        log.Printf("can't decode login details", err)
      }
      username := userDetails.Username
      password := userDetails.Password
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
        http.Error(w, "Invalid username or password.", 403)
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
        w.Write([]byte("Login successful!"))
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
    tx, err := db.Begin()
    if err != nil {
      log.Printf("?", err)
    }
    defer tx.Commit()

    if r.Method == "GET" {
      formattedStatement := fmt.Sprintf(`SELECT transactions.id, product_list, order_time FROM transactions
                                      INNER JOIN users ON users.id=transactions.user_id
                                      INNER JOIN usersessions ON users.id=usersessions.userid
                                      WHERE sessionKey='%s'`, sessionKey)
      rows, err := tx.Query(formattedStatement)
      if err != nil {
        log.Printf("?", err)
      }
      var (
          transaction_id int
          product_list pq.Int64Array
          order_time string
        )
      w.Header().Set("Content-Type", "application/json")
      w.WriteHeader(http.StatusCreated)
      defer rows.Close()
      var data []Transaction
      for rows.Next() {
        err := rows.Scan(&transaction_id, &product_list, &order_time)
        if err != nil {
          log.Printf("?", err)
        }
        t := Transaction{Id: transaction_id, Product_list: product_list, Order_time: order_time}
        data = append(data, t)
      }
      js, err := json.Marshal(data)
      if err != nil {
        log.Printf("?", err)
      }
      w.Write(js)
    }

    if r.Method == "POST" {
      formattedStatement := fmt.Sprintf(`INSERT INTO transactions(user_id, product_list, order_time)
                                      SELECT id, cart, '%s'
                                      FROM users INNER JOIN usersessions
                                      ON users.id=usersessions.userid
                                      WHERE sessionkey='%s'
                                      AND array_length(cart, 1) > 0`, time.Now().Format(time.RFC3339), sessionKey)
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
      w.Write([]byte("Transaction successful!"))
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
