import * as pg from "pg";

const cnf = {
  database: "divelog",
  host: "192.168.2.42",
  idleTimeoutMillis: 30000,
  max: 10,
  password: "tester",
  port: 5432,
  user: "divelog",
};

const pool = new pg.Pool(
    cnf,
);

enum ConnectionState {
    Disconnected,
    Connecting,
    Connected,
}

export async function call(sql: string, params: any[]): Promise<pg.QueryResult> {
    return pool.query(sql, params);
}

export async function connect() {
    return pool.connect();
}

export async function disconnect() {
    return pool.end();
}