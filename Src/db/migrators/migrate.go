package main

import (
  "database/sql"
  "github.com/golang-migrate/migrate"
  "github.com/golang-migrate/migrate/database/postgres"
  _ "github.com/golang-migrate/migrate/source/file"
  _ "github.com/lib/pq"
  "log"
  "os"
  "strconv"
)

func main() {
  steps, err := strconv.Atoi(os.Args[1])
  if err != nil {
    log.Printf("could not convert arg to int")
  }
  connStr := "user=postgres dbname=postgres password=test sslmode=disable host=127.0.0.1"
  db, err := sql.Open("postgres", connStr)
  if err != nil {
    log.Printf("could not connect to the postgres database, %v", err)
  }
  if err := db.Ping(); err != nil {
		log.Printf("could not ping DB, %v", err)
	}
  driver, err := postgres.WithInstance(db, &postgres.Config{})
  if err != nil {
    log.Printf("could not start sql migration, %v", err)
  }
  m, err := migrate.NewWithDatabaseInstance(
    "file://../migrations",
    "postgres", driver)
  if err != nil {
    log.Printf("could not start sql migration, %v", err)
  }
  if err := m.Steps(steps); err != nil {
    log.Printf("could not start sql migration, %v", err)
  }
  defer db.Close()
}
