package main

import (
  "log"
  "net/http"
  "./db"
)

func main() {
  mux := http.NewServeMux()
  mux.HandleFunc("/api/v1/products", db.GetProducts())
  mux.HandleFunc("/api/v1/users", db.AddUser())
  mux.HandleFunc("/api/v1/users/cart", db.AddItemToCart())
  mux.HandleFunc("/api/v1/users/login", db.UserLogin())
  mux.HandleFunc("/logout", db.LogoutUser())
  fs := http.FileServer(http.Dir("../client/static"))
  mux.Handle("/", fs)

  log.Println("Listening on port 3000")
  http.ListenAndServe(":3000", mux)
}
