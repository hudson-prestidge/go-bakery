package main

import (
  "log"
  "net/http"
  "./db"
  "regexp"
)

var fs = http.FileServer(http.Dir("../client/static"))

func main() {
  mux := http.NewServeMux()
  mux.HandleFunc("/api/v1/products", db.GetProducts())
  mux.HandleFunc("/api/v1/users", db.HandleUser())
  mux.HandleFunc("/api/v1/users/cart", db.HandleCart())
  mux.HandleFunc("/api/v1/users/login", db.UserLogin())
  mux.HandleFunc("/logout", db.LogoutUser())
  mux.HandleFunc("/api/v1/transactions", db.HandleTransactions())
  mux.HandleFunc("/", myfileserver)



  log.Println("Listening on port 3000")
  http.ListenAndServe(":3000", mux)
}

func myfileserver(w http.ResponseWriter, r *http.Request) {
      var jsFile = regexp.MustCompile("\\.js$")
      ruri := r.RequestURI
      if jsFile.MatchString(ruri) {
          w.Header().Set("Content-Type", "text/javascript")
      }
      fs.ServeHTTP(w, r)
}
