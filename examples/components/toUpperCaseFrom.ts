export default class ToUpperCaseFrom {
    public $template = '<input $onkeypress="this.text = $event.target.value"> {{ this.text.toUpperCase() }}';
    public text = 'To Upper Case';
}
