package main

import (
  "os/exec"
  "log"
)

func main() {
  log.Print("Typescript compiling, Watching sass files for changes.")
  tscCmd := exec.Command("tsc")
  if err := tscCmd.Run(); err != nil {
    log.Fatal(err)
  }
  cmd := exec.Command("sass", "--watch", "./client/style.scss", "./client/static/styles/style.css")
  if err := cmd.Run(); err != nil {
    log.Fatal(err)
  }
}
