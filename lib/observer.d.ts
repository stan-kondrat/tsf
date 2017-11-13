export interface IBinding {
    expr: any;
    component: any;
    customVarNames: string[];
    customVarValues: any[];
    textNode: any;
    evalFunction: any;
    compile: any;
}
export interface IBindings {
    [id: number]: IBinding;
    push(IBinding: any): any;
    concat(IBindings: any): IBindings;
}
export declare class ObservableStructure {
    private static isObject(obj);
    private static isArray(obj);
    private allWatchedObjects;
    private bindingsByAttr;
    private bindings;
    observe(obj: any, bindings: IBindings, attrFullName?: string): void;
    private compileBinding(obj, attrFullName, params?);
    private observeObject(obj, bindings, attrParent);
    private observeArray(arr, bindings, attrParent);
    private observeArrayDefineIndexProperty(arr, bindings, index, attrParent);
}
