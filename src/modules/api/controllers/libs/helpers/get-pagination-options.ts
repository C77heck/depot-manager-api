export interface PaginationOptions {
    skip: number;
    limit: number;
}

export const getPaginationOptions = (query: any = null): PaginationOptions => {
    const paginationOptions = {
        skip: 0,
        limit: 20
    };

    const page = query?.page || 0;

    if (!page) {
        return paginationOptions;
    }

    paginationOptions.skip = paginationOptions.limit * page;

    return paginationOptions;
};
