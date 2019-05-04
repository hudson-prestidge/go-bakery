package main

import (
  "log"
  "net/http"
  "github.com/hudson-prestidge/go-bakery/serverside/db"
  "regexp"
  "os"
)
var fs = http.FileServer(http.Dir("/app/clientsideside/static"))

func main() {
  log.Printf("cwd: ", dir)
  mux := http.NewServeMux()
  mux.HandleFunc("/api/v1/products", db.GetProducts())
  mux.HandleFunc("/api/v1/users", db.HandleUser())
  mux.HandleFunc("/api/v1/users/cart", db.HandleCart())
  mux.HandleFunc("/api/v1/users/login", db.UserLogin())
  mux.HandleFunc("/logout", db.UserLogout())
  mux.HandleFunc("/api/v1/transactions", db.HandleTransactions())
  mux.HandleFunc("/", myfileserver)

  port := os.Getenv("PORT")
  if port == "" {
    port = "3000"
  }

  log.Println("Listening on port " + port)
  http.ListenAndServe(":" + port, mux)
}

func myfileserver(w http.ResponseWriter, r *http.Request) {
      var jsFile = regexp.MustCompile("\\.js$")
      ruri := r.RequestURI
      if jsFile.MatchString(ruri) {
          w.Header().Set("Content-Type", "text/javascript")
      }
      fs.ServeHTTP(w, r)
}
