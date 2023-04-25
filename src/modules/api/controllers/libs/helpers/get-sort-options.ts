export const getSortOptions = (rawSortOptions: any) => {
    if (!rawSortOptions) {
        return null;
    }

    const sortOptions: any = {};
    for (const key of Object.keys(rawSortOptions)) {
        sortOptions[key] = +rawSortOptions[key];
    }

    return sortOptions;
};
