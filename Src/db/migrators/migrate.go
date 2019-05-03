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
  "fmt"
)

func CreateDbConnectionString() string {
  user := os.Getenv("DATABASE_USER")
  dbname := os.Getenv("DATABASE")
  password := os.Getenv("DATABASE_PASSWORD")
  host := os.Getenv("DATABASE_HOST")
  port := os.Getenv("DATABASE_PORT")
  connectionString := fmt.Sprintf("user=%s dbname=%s password=%s sslmode=disable host=%s port=%s", user, dbname, password, host, port)
  return connectionString
}

func main() {
  steps, err := strconv.Atoi(os.Args[1])
  if err != nil {
    log.Printf("could not convert arg to int")
  }
  connStr := CreateDbConnectionString()
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
