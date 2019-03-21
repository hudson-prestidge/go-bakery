package main

import (
  "log"
  "net/http"
  "./db"
)

func main() {
  mux := http.NewServeMux()
  handler := db.GetProducts()
  mux.HandleFunc("/api/v1/products", handler)
  fs := http.FileServer(http.Dir("../client/static"))
  mux.Handle("/", fs)
  
  log.Println("Listening on port 3000")
  http.ListenAndServe(":3000", mux)
}
