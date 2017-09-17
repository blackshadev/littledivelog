import * as pg from "pg";

const T_DATE = 1082;
const T_TIMESTAMP = 1114;
const T_TIMESTAMPTZ = 1184;
pg.types.setTypeParser(T_DATE       , (str) => str);
pg.types.setTypeParser(T_TIMESTAMP  , (str) => str);
pg.types.setTypeParser(T_TIMESTAMPTZ, (str) => str);

const cnf = {
  database: "divelog",
  host: "yildun.littledev.nl",
  idleTimeoutMillis: 30000,
  max: 10,
  password: "tester",
  port: 5432,
  user: "divelog",
};

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

class DbAdapter {
    private pool: pg.Pool;

    constructor() {
        this.pool = new pg.Pool(cnf);
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
