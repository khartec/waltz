const BINDINGS = {
    entries: '=',
    entityReference: '='
};


function controller() {
}


const directive = {
    restrict: 'E',
    replace: false,
    scope: {},
    bindToController: BINDINGS,
    controllerAs: 'ctrl',
    controller,
    template: require('./change-log-section.html')
};


export default () => directive;
