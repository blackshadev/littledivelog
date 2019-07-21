declare module "odbc" {
    export function connect(
        conn: string,
        cb: (err: Error, db: Connection) => void
    ): void;
    export function connect(conn: string): Promise<Connection>;
    export class Connection {
        query(
            q: string,
            params: any[],
            cb: (err: Error, rows: any, moreResults: boolean) => void
        ): void;
        query(
            q: string,
            cb: (err: Error, rows: any, moreResults: boolean) => void
        ): void;
        query(q: string, params: any[]): Promise<IResultSet>;
        query(q: string): Promise<IResultSet>;
        querySync(q: string, params?: any[]): IResultSet;

        columns(
            catelog: string | null,
            schema: string | null,
            table: string | null,
            column: string | null
        ): Promise<IColumn[]>;

        close(cb: (err?: Error) => void): void;
        close(): Promise<void>;
    }

    export class IResultSet extends Array {
        [index: number]: { [col: string]: any };
        columns: { column: string }[];
    }

    export interface IColumn {
        TABLE_CAT: string | null;
        TABLE_SCHEM: string | null;
        TABLE_NAME: string;
        COLUMN_NAME: string;
        DATA_TYPE: number;
        TYPE_NAME: string;
        COLUMN_SIZE: number;
        BUFFER_LENGTH: number;
        DECIMAL_DIGITS: number | null;
        NUM_PREC_RADIX: number | null;
        NULLABLE: 1 | 0 | null;
        REMARKS: string | null;
        COLUMN_DEF: any | null;
        SQL_DATA_TYPE: number;
        SQL_DATETIME_SUB: null;
        CHAR_OCTET_LENGTH: number | null;
        ORDINAL_POSITION: 68;
        IS_NULLABLE: "YES" | "NO";
        ORDINAL: number;
    }
}
