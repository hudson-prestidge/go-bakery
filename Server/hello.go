package main

import (
  "log"
  "net/http"
)

func main() {
  fs := http.FileServer(http.Dir("../client/static"))
  http.Handle("/", fs)

  log.Println("Listening on port 3000")
  http.ListenAndServe(":3000", nil)
}
