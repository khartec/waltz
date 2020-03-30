/*
 * Waltz - Enterprise Architecture
 * Copyright (C) 2016, 2017, 2018, 2019 Waltz open source project
 * See README.md for more information
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific
 *
 */

import {initialiseData} from "../../common/index";
import template from "./playpen3.html";
import {CORE_API} from "../../common/services/core-api-utils";
import {mergeUpwards, populateParents} from "../../common/hierarchy-utils";


const initialState = {
    parentEntityRef: {
        id: 51,
        kind: "APPLICATION"
    },
    schemeId: 2
};

const root = { id: 0 }

const nA = {
    id: 1,
    parentId: root.id
};

const nA1 = {
    id: 11,
    parentId: nA.id
};

const nA2 = {
    id: 12,
    parentId: nA.id
};

const nB = {
    id: 2,
    parentId: root.id
};

const nB1 = {
    id: 21,
    parentId: nB.id
};

const nC = {
    id: 3,
    parentId: root.id
};

const nC1 = {
    id: 31,
    parentId: nC.id
};

const nC2 = {
    id: 32,
    parentId: nC.id
};

const nC21 = {
    id: 321,
    parentId: nC2.id
};

const nC11 = {
    id: 311,
    parentId: nC1.id
};

const allNodes = [root, nA, nA1, nA2, nB, nB1, nC, nC1, nC11, nC2, nC21];


function controller($stateParams, serviceBroker) {
    const vm = initialiseData(this, initialState);

    const merged = mergeUpwards(
        allNodes,
        (p, c) => {
            const descendantIds = _.uniq(_.concat(
                c.descendantIds || [],
                [c.id],
                p.descendantIds || []));

            return Object.assign({}, p, { descendantIds });
        });

    console.log({merged, allNodes});
}


controller.$inject = [
    "$stateParams",
    "ServiceBroker"
];


const view = {
    template,
    controller,
    controllerAs: "ctrl",
    bindToController: true,
    scope: {}
};


export default view;
