
const all: { [name: string]: FormDef } = {};

export interface IFormDef {
    table: string;
    fields: {
        [fldName: string]: IFieldDef;
    };
}

export type IFieldDef = IValueFieldDef|IJoinFieldDef|IFormFieldDef;

export interface IFormFieldDef {
    itemsDef: string|IFormDef;
}

export interface IValueFieldDef {
    field: string;
    isPrimary?: boolean;
}

export interface IJoinFieldDef {
    joinTable?: string;
    detailTable: string;
    itemsDef: string|IFormDef;
}

export class FormDef {
    public static Add(name: string, f: IFormDef) {
        all[name] = FormDef.Create(f);
    }

    public static Create(f: IFormDef): FormDef {
        const def = new FormDef();
        def.table = f.table;
        def.fields = [];
        for (const k in f.fields) {
            if (f.fields.hasOwnProperty(k)) {
                def.fields.push(FieldDef.Create(f.fields[k]));
            }
        }

        return def;
    }

    protected table: string;
    protected fields: FieldDef[];
    protected pkFields: string[];

    protected createUpdateSQL() {
        const flds: string[] = [];

        return `update ${this.table} set ${flds.join(", ")}`;
    }
}

export class FieldDef {
    public static Create(f: IFieldDef): FieldDef {
        let field: FieldDef;
        if ((f as IValueFieldDef).field) {
            field = ValueFieldDef.Create(f as IValueFieldDef);
        } else if ((f as IJoinFieldDef).detailTable) {
            field = JoinFieldDef.Create(f as IJoinFieldDef);
        } else {
            throw new Error("No valid field given");
        }

        field.name = name;
        return field;
    }
    protected name: string;
}

export class ValueFieldDef extends FieldDef {
    public static Create(f: IValueFieldDef): ValueFieldDef {
        const fld = new ValueFieldDef();
        fld.field = f.field;
        return fld;
    }

    protected field: string;
}

export class JoinFieldDef  extends FieldDef {
    public static Create(f: IJoinFieldDef): JoinFieldDef {
        const fld = new JoinFieldDef();
        fld.itemsDef = typeof(f.itemsDef) === "string" ? f.itemsDef : FormDef.Create(f.itemsDef);
        fld.detailTable = f.detailTable;
        fld.joinTable = f.joinTable;
        return fld;
    }

    protected joinTable?: string;
    protected detailTable: string;
    protected itemsDef: string|FormDef;

}

FormDef.Add(
    "dives",
    {
        fields: {
            buddies: { itemsDef: "tags", joinTable: "dive_buddies" },
            date: { field: "date" },
            dive_id: { field: "dive_id", isPrimary: true } ,
            divetime: { field: "divetime" },
            max_depth: { field: "max_depth" },
            tags: { itemsDef: "tags", joinTable: "dive_tags", detailTable: "tags" },
        },
        table: "dives",
    },
);
FormDef.Add(
    "buddy",
    {
        fields: {
            buddy_id: { field: "buddy_id", isPrimary: true },
            color: { field: "color" },
            text: { field: "name" },
        },
        table: "buddies",
    },
);
FormDef.Add(
    "tags",
    {
        fields: {
            color: { field: "color" },
            tag_id: { field: "tag_id", isPrimary: true },
            text: { field: "text" },
        },
        table: "tags",
    },
);
