import * as pg from "pg";
import { database } from "./pg";

export class SQLStatement {
    public sql: string;
    public parameters: Array<string|(() => any)>;
    public ondone: (ds: pg.QueryResult) => void = () => { /* done */ };

    public async executeClient(cl: pg.Client): Promise<pg.QueryResult> {
        let res: pg.QueryResult;
        try {
            res = await cl.query(
                this.sql,
                this.parameters.map(
                    (v) => typeof(v) === "function" ? v() : v),
                );
            this.ondone(res);
        } catch (err) {
            console.log("Error", err, this.sql, this.parameters);
            throw err;
        }
        return res;
    }
}

export class SqlBatch {
    protected statements: SQLStatement[] = [];

    public add(stmt: SQLStatement);
    public add(sql: string, params?: any[], ondone?: (r: pg.QueryResult) => void);
    public add(stmt: SQLStatement|string, params?: string[], ondone?: (r: pg.QueryResult) => void) {
        if (typeof(stmt) === "string") {
            const sql = stmt;
            stmt = new SQLStatement();
            stmt.sql = sql;
            stmt.parameters = params || [];
            stmt.ondone = ondone || stmt.ondone;
        }
        this.statements.push(stmt);
    }

    public async execute() {
        const client = await database.getConnection();
        let error: Error;
        await client.query("begin");
        try {
            for (const stmt of this.statements) {
                await stmt.executeClient(client);
            }
            await client.query("commit");
        } catch (err) {
            error = err;
            await client.query("rollback");
        } finally {
            client.release();
        }
        if (error !== undefined) {
            throw error;
        }
    }
}
