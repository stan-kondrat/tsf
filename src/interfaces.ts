export interface IBinding {
    expr;
    component;
    customVarNames: string[];
    customVarValues: any[];
    textNode;
    evalFunction;
    compile;
}

export interface IBindings {
    [id: number]: IBinding;
    push(IBinding);
    concat(IBindings): IBindings;
}
