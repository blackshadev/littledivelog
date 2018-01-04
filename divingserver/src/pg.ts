import * as pg from "pg";

const T_DATE = 1082;
const T_TIMESTAMP = 1114;
const T_TIMESTAMPTZ = 1184;
pg.types.setTypeParser(T_DATE       , (str) => str);
pg.types.setTypeParser(T_TIMESTAMP  , (str) => str);
pg.types.setTypeParser(T_TIMESTAMPTZ, (str) => str + ":00");

enum ConnectionState {
    Disconnected,
    Connecting,
    Connected,
}

interface IBulkInsertParams {
    chunkSize?: number;
    data: any[];
    table: string;
    mapping: {
        [fieldname: string]: {
            field: string;
            transform?: (val: any, row: any) => any;
            sql?: string;
        };
    };
}

interface IDbConfig {
    database: string;
    host: string;
    username: string;
    password?: string;
    port?: number;
}

class DbAdapter {
    private pool: pg.Pool;
    private cnf: IDbConfig;

    public setConfig(
        cnf: IDbConfig,
    ) {
        this.cnf = cnf;
    }

    public async start() {
        if (!this.cnf) {
            throw new Error("No config set");
        }
        this.pool = new pg.Pool({
            database: this.cnf.database,
            host: this.cnf.host,
            port: this.cnf.port,
            user: this.cnf.username,
            password: this.cnf.password,
            application_name: "DiveLog",
            max: 10,
        });
    }

    public async call(sql: string, params: any[]): Promise<pg.QueryResult> {
        return this.pool.query(sql, params);
    }

    public async getConnection(): Promise<pg.Client> {
        return this.pool.connect();
    }

    public async stop() {
        return this.pool.end();
    }

    public async bulkInsert(oPar: IBulkInsertParams): Promise<pg.QueryResult> {
        oPar.chunkSize = 50;
        const params: any[] = [];
        const sqlRows: string[] = [];
        const fields = Object.keys(oPar.mapping);
        const baseSql = `insert into ${oPar.table} (${fields.join(", ")}) values`;
        for (const row of oPar.data) {
            sqlRows.push(
                `(
                    ${
                        fields.map(
                            (fld) => {
                                let val = row[oPar.mapping[fld].field];
                                if (oPar.mapping[fld].transform) {
                                    val = oPar.mapping[fld].transform(val, row);
                                }

                                params.push(val);
                                const iXParam = "$" + params.length;
                                if (oPar.mapping[fld].sql !== undefined) {
                                    return oPar.mapping[fld].sql.replace("{value}", iXParam);
                                }
                                return iXParam;
                            },
                        )
                    }
                )`,
            );
        }

        return this.call(`${baseSql} ${sqlRows.join(",")}`, params);
    }

}
export const database: DbAdapter = new DbAdapter();
