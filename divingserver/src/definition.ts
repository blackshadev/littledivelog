
const all: { [name: string]: FormDef } = {};

export interface IFormDef {
    table: string;
    fields: IAnyFieldDef[];
}

export type IAnyFieldDef = IValueFieldDef|IJoinFieldDef|IFormFieldDef;

export interface IFieldDef {
    formField: string;
}

export interface IFormFieldDef extends IFieldDef {
    itemsDef: string|IFormDef;
}

export interface IValueFieldDef extends IFieldDef {
    dbField?: string;
    isPrimary?: boolean;
}

export interface IJoinFieldDef extends IFieldDef {
    joinTable?: string;
    detailTable: string;
    itemsDef: string;
}

export class FormDef {
    public static Add(name: string, f: IFormDef) {
        all[name] = FormDef.Create(f);
    }

    public static Get(name: string): FormDef {
        return all[name];
    }

    public static Create(f: IFormDef): FormDef {
        const def = new FormDef();
        def.table = f.table;
        def.fields = f.fields.map(
            (fld) => FieldDef.Create(fld),
        );

        return def;
    }

    public table: string;
    public fields: FieldDef[];
    public pkFields: string[];

    public updateSQL() {
        const flds: string[] = [];

        return `update ${this.table} set ${flds.join(", ")}`;
    }
}

export class FieldDef {
    public static Create(f: IAnyFieldDef): FieldDef {
        let field: FieldDef;
        if ((f as IValueFieldDef).formField) {
            field = ValueFieldDef.Create(f as IValueFieldDef);
        } else if ((f as IJoinFieldDef).detailTable) {
            field = JoinFieldDef.Create(f as IJoinFieldDef);
        } else {
            throw new Error("No valid field given");
        }

        field.formField = f.formField;
        return field;
    }
    public formField: string;
}

export class ValueFieldDef extends FieldDef {
    public static Create(f: IValueFieldDef): ValueFieldDef {
        const fld = new ValueFieldDef();
        fld.databaseField = f.formField || f.dbField;
        return fld;
    }

    public databaseField: string;
}

export class JoinFieldDef  extends FieldDef {
    public static Create(f: IJoinFieldDef): JoinFieldDef {
        const fld = new JoinFieldDef();
        fld.itemsDef = typeof(f.itemsDef) === "string" ? f.itemsDef : FormDef.Create(f.itemsDef);
        fld.detailTable = f.detailTable;
        fld.joinTable = f.joinTable;
        return fld;
    }

    public joinTable?: string;
    public detailTable: string;
    public itemsDef: string|FormDef;

}

FormDef.Add(
    "dives",
    {
        fields: [
            { formField: "buddies", itemsDef: "tags", joinTable: "dive_buddies" },
            { formField: "date" },
            { formField: "dive_id", isPrimary: true } ,
            { formField: "divetime" },
            { formField: "max_depth" },
            { formField: "tags", itemsDef: "tags", joinTable: "dive_tags", detailTable: "tags" },
        ],
        table: "dives",
    },
);
FormDef.Add(
    "buddy",
    {
        fields: [
            { formField: "buddy_id", isPrimary: true },
            { formField: "color" },
            { formField: "text", dbField: "name" },
        ],
        table: "buddies",
    },
);
FormDef.Add(
    "tags",
    {
        fields: [
            { formField: "color" },
            { formField: "tag_id", isPrimary: true },
            { formField: "text" },
        ],
        table: "tags",
    },
);
