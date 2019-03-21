package main

import (
  "log"
  "net/http"
  "./db"
)

func main() {
  fs := http.FileServer(http.Dir("../client/static"))
  http.Handle("/", fs)
  db.GetProducts()

  log.Println("Listening on port 3000")
  http.ListenAndServe(":3000", nil)
}
