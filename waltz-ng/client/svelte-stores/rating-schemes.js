/*
 * Waltz - Enterprise Architecture
 * Copyright (C) 2016, 2017, 2018, 2019, 2020, 2021 Waltz open source project
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

import {remote} from "./remote";


export function mkStore() {
    const getById = (id, force) => remote
        .fetchViewList(
            "GET",
            `api/rating-scheme/id/${id}`,
            null,
            {force});

    const loadAll = (force) => remote
        .fetchViewList(
            "GET",
            `api/rating-scheme`,
            null,
            {force});

    const save = (scheme) => remote
        .execute(
            "PUT",
            `api/rating-scheme`,
            scheme);

    const saveItem = (ratingSchemeItem) => remote
        .execute(
            "PUT",
            `api/rating-scheme/id/${ratingSchemeItem.ratingSchemeId}/rating-item`,
            ratingSchemeItem);

    const removeItem = (itemId) => remote
        .execute(
            "DELETE",
            `api/rating-scheme/items/id/${itemId}`);

    const removeScheme = (schemeId) => remote
        .execute(
            "DELETE",
            `api/rating-scheme/id/${schemeId}`);

    const calcRatingUsageStats = (force) => remote
        .fetchViewList(
            "GET",
            "api/rating-scheme/items/usage",
            null,
            {force});

    return {
        calcRatingUsageStats,
        getById,
        loadAll,
        save,
        saveItem,
        removeItem,
        removeScheme
    };
}

export const ratingSchemeStore = mkStore();