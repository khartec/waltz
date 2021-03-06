import _ from "lodash";
import {randomPick} from "../../../../common";
import {toGraphId} from "../../../flow-diagram-utils";

export const colorSchemes = [
    { fill: "red", stroke: "#ee9c9c" },
    { fill: "orange", stroke: "#e2a864" },
    { fill: "blue", stroke: "#74b7f1" },
    { fill: "pink", stroke: "#ecbbdf" },
    { fill: "green", stroke: "#97e580" },
    { fill: "purple", stroke: "#c7a5ea" }
];

const symbols = ["star", "square", "diamond", "circle", "wye", "triangle", "cross"];

export function mkDecoratorId(symbol, fill, stroke) {
    return `${symbol}_${fill}_${stroke}`;
}

const symbolColorCombinations = _.flatMap(
    symbols,
    s => _.map(colorSchemes, (colorScheme) => Object.assign(
        {},
        colorScheme,
        {
            decoratorId: mkDecoratorId(s, colorScheme.fill, colorScheme.stroke),
            symbol: s
        })));


export function determineFillAndSymbol(existingGroups) {
    const taken = (desiredDecoration) => {
        const desiredDecorationId = mkDecoratorId(
            desiredDecoration.symbol,
            desiredDecoration.fill,
            desiredDecoration.stroke);

        return _.find(
            existingGroups,
            g => {
                const takenDecorationId = mkDecoratorId(g.data.symbol, g.data.fill, g.data.stroke);
                return desiredDecorationId === takenDecorationId;
            });
    };

    let candidate = randomPick(symbolColorCombinations);

    while (taken(candidate)) {
        candidate = randomPick(symbolColorCombinations);
    }

    return candidate;
}


export function getNewOverlay(overlayEntity, overlays) {
    return Object.assign(
        {},
        determineFillAndSymbol(overlays),
        {
            id: toGraphId(overlayEntity),
            entityReference: overlayEntity,
            kind: "OVERLAY"
        });
}

