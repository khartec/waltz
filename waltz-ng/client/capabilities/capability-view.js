/*
 *  Waltz
 * Copyright (c) David Watkins. All rights reserved.
 * The use and distribution terms for this software are covered by the
 * Eclipse Public License 1.0 (http://opensource.org/licenses/eclipse-1.0.php)
 * which can be found in the file epl-v10.html at the root of this distribution.
 * By using this software in any fashion, you are agreeing to be bound by
 * the terms of this license.
 * You must not remove this notice, or any other, from this software.
 *
 */

import _ from "lodash";
import d3 from "d3";
import {perhaps, populateParents} from "../common";
import {calculateGroupSummary} from "../ratings/directives/common";

function loadTraitInfo(traitStore, traitUsageStore, capabilityId) {
    const result = {
        usages: [],
        traits: []
    };

    return traitUsageStore
        .findByEntityReference('CAPABILITY', capabilityId)
        .then(usages => {
            if (! usages) { return result; } // shortcut

            result.usages = usages;
            const traitIds =_.chain(usages)
                .map('traitId')
                .uniq()
                .value();

            return traitStore.findByIds(traitIds)
                .then(traits => result.traits = traits)
                .then(() => result);
        });
}


function logHistory(capability, historyStore) {
    historyStore.put(
        capability.name,
        'CAPABILITY',
        'main.capabilities.view',
        { id: capability.id });
}


function nestBySubjectThenMeasurable(ratings) {
    return d3.nest()
        .key(r => r.parent.id)
        .key(r => r.measurable.code)
        .map(ratings);
}

function prepareRawData(apps, measurables, bySubjectThenMeasurable) {
    return _.chain(apps)
        .map(s => ({
            ratings: _.map(
                measurables,
                m => {
                    const ragRating = perhaps(() => bySubjectThenMeasurable[s.id][m.code][0].ragRating, 'Z');
                    return { original: ragRating, current: ragRating, measurable: m.code || m.id };
                }),
            subject: s
        }))
        .sortBy('subject.name')
        .value();
}


function prepareGroupData(capability, apps, perspective, ratings) {

    const measurables = perspective.measurables;
    const bySubjectThenMeasurable = nestBySubjectThenMeasurable(ratings);

    const raw = prepareRawData(
        apps,
        measurables,
        bySubjectThenMeasurable);

    const groupRef = { id: capability.id, name: capability.name, kind: 'CAPABILITY' };

    const summaries = calculateGroupSummary(raw);

    const group = {
        groupRef,
        measurables,
        raw,
        summaries,
        collapsed: false
    };

    return group;
}


function controller($scope,
                    $q,
                    $stateParams,
                    $state,
                    capabilities,
                    appCapabilityStore,
                    perspectiveStore,
                    ratingStore,
                    historyStore,
                    dataFlowStore,
                    complexityStore,
                    assetCostStore,
                    applicationStore,
                    traitUsageStore,
                    traitStore,
                    techStatsService) {

    const vm = this;

    const capId = $stateParams.id;
    const capability = _.find(populateParents(capabilities), { id: capId });

    const capabilitiesById = _.keyBy(capabilities, 'id');

    const assetCosts = {
        stats: {},
        costs: [],
        loading: false
    };

    const tweakers = {
        subjectLabel: {
            enter: selection =>
                selection.on('click.go', d => $state.go('main.app-view', { id: d.subject.id }))
        }
    };


    const processApps = (groupedApps) => {
        const apps = _.union(groupedApps.primaryApps, groupedApps.secondaryApps);
        vm.groupedApps = groupedApps;
        vm.apps = apps;
        return _.map(apps, 'id');
    };


    appCapabilityStore.findApplicationsByCapabilityId(capability.id)
        .then(processApps)
        .then(appIds => {
            $q.all([
                perspectiveStore.findByCode('BUSINESS'),
                ratingStore.findByAppIds(appIds),
                dataFlowStore.findByAppIds(appIds),
                complexityStore.findByAppIds(appIds),
                assetCostStore.findStatsByAppIds(appIds),
                techStatsService.findByAppIds(appIds)
            ]).then(([
                perspective,
                ratings,
                flows,
                complexity,
                assetCostStats,
                techStats
            ]) => {
                vm.ratings = {
                    group: prepareGroupData(capability, vm.apps, perspective, ratings),
                    tweakers
                };
                vm.dataFlows = flows;
                vm.complexity = complexity;
                vm.assetCosts.stats = assetCostStats;
                vm.techStats = techStats;
            });
        });


    appCapabilityStore.findAssociatedApplicationCapabilitiesByCapabilityId(capability.id)
        .then(assocAppCaps => {
            const associatedAppIds = _.map(assocAppCaps, 'applicationId');


            applicationStore
                .findByIds(associatedAppIds)
                .then((assocApps) => {
                    const appsById = _.keyBy(assocApps, 'id');
                    return _.chain(assocAppCaps)
                        .groupBy('capabilityId')
                        .map((associations, capabilityId) => {
                            return {
                                capability: capabilitiesById[capabilityId],
                                apps: _.map(associations, assoc => appsById[assoc.applicationId])
                            }
                        })
                        .value()
                })
                .then(associatedCapabilities => vm.associatedCapabilities = associatedCapabilities);
        });


    logHistory(capability, historyStore);


    vm.capability = capability;
    vm.capabilitiesById = capabilitiesById;
    vm.assetCosts = assetCosts;

    vm.onAssetBucketSelect = (bucket) => {
        $scope.$applyAsync(() => {
            assetCosts.selectedBucket = bucket;
            if (assetCosts.costs.length == 0) {
                assetCosts.loading = true;
                assetCostStore
                    .findAppCostsByAppIds(_.map(vm.apps, "id"))
                    .then(costs => {
                        assetCosts.costs = costs;
                        assetCosts.loading = false;
                    });
            }
        });
    };

    loadTraitInfo(traitStore, traitUsageStore, capability.id)
        .then(r => vm.traitInfo = r);
}

controller.$inject = [
    '$scope',
    '$q',
    '$stateParams',
    '$state',
    'capabilities',
    'AppCapabilityStore',
    'PerspectiveStore',
    'RatingStore',
    'HistoryStore',
    'DataFlowDataStore',
    'ComplexityStore',
    'AssetCostStore',
    'ApplicationStore',
    'TraitUsageStore',
    'TraitStore',
    'TechnologyStatisticsService'
];


export default {
    template: require('./capability-view.html'),
    controller,
    controllerAs: 'ctrl'
};
