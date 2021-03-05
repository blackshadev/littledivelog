export interface IDataChanged {
    type: 'update' | 'insert' | 'delete';
    key: number;
}
