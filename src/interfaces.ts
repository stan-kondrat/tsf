export interface IBinding {
    expr;
    component;
    customVarNames: string[];
    customVarValues: any[];
    textNode: Text;
    evalFunction;
    compile;
}

export interface IBindings {
    [id: string]: IBinding;
}
