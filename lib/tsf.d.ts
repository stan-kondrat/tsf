export declare class TSF {
    private static prepareTemplate(template);
    private rootElement;
    private initializedComponents;
    private componentClasses;
    private watcher;
    constructor(selector: any);
    register(name: any, componentClass: any): void;
    component(name: any, componentInstance: any): void;
    run(component: any): void;
    private process(component, domElement, customTemplate?, customVarNames?, customVarValues?);
    private processTextNodes(component, domElement, customVarNames?, customVarValues?);
    private processEvents(component, domElement);
    private prepareDynamicIf(component, domElement);
    private prepareDynamicFor(component, domElement);
    private processDynamic(component, domElement, bindings);
    private processComponents(domElement);
    private newElement(html);
}
