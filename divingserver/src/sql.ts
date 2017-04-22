import * as bluebird from "bluebird";
import * as pg from "pg";
import { database } from "./pg";

export class SQLStatement {
    public sql: string;
    public parameters: string[];
    public ondone: (ds: pg.QueryResult) => void = () => { /* done */ };

    public async executeClient(cl: pg.Client): Promise<pg.QueryResult> {
        console.log("exec", this.sql, this.parameters);
        const res = await cl.query(this.sql, this.parameters);
        this.ondone(res);
        return res;
    }
}

export class SqlBatch {
    protected statements: SQLStatement[] = [];

    public add(stmt: SQLStatement);
    public add(sql: string, params?: string[], ondone?: (r: pg.QueryResult) => void);
    public add(stmt: SQLStatement|string, params?: string[], ondone?: (r: pg.QueryResult) => void) {
        if (typeof(stmt) === "string") {
            const sql = stmt;
            stmt = new SQLStatement();
            stmt.sql = sql;
            stmt.parameters = params || [];
            stmt.ondone = ondone;
        }
        this.statements.push(stmt);
    }

    public async execute() {
        const client = await database.getConnection();
        await client.query("begin");
        try {
            console.log(this.statements);
            for (const stmt of this.statements) {
                await stmt.executeClient(client);
            }
            await client.query("commit");
        } catch (err) {
            await client.query("rollback");
        } finally {
            client.release();
        }
    }
}
