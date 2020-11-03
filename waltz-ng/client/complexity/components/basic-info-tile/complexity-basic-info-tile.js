import template from "./complexity-basic-info-tile.html";
import {initialiseData} from "../../../common";
import {CORE_API} from "../../../common/services/core-api-utils";
import {determineDownwardsScopeForKind} from "../../../common/selector-utils";
import {calcComplexitySummary} from "../../services/complexity-utilities";


const bindings = {
    parentEntityRef: "<",
    filters: "<?"
};


const initialState = {
    filters: {}
};



function controller(serviceBroker) {

    const vm = initialiseData(this, initialState);

    vm.$onChanges = () => {
        const selector = {
            entityReference: vm.parentEntityRef,
            scope: determineDownwardsScopeForKind(vm.parentEntityRef.kind),
            filters: vm.filters
        };

        serviceBroker
            .loadViewData(
                CORE_API.ComplexityStore.findBySelector,
                [ selector ])
            .then(r => vm.stats = calcComplexitySummary(r.data));
    };

}

controller.$inject = [
    "ServiceBroker"
];


const component = {
    template,
    bindings,
    controller
};


export default {
    id: "waltzComplexityBasicInfoTile",
    component
};