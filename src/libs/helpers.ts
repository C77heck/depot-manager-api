export const round = (number: number, decimal = 100): number => {
    return Math.round(number / decimal) * decimal;
};

export const priceFormat = (amount: number, decimal = 1, currency: string = 'GBP') => {
    const val = !!amount ? amount : 0;
    const price = round(val, decimal);

    return Intl
        .NumberFormat('hu-HU', {
            style: 'currency', currency: (currency || '')
                .toUpperCase()
        })
        .format(price)
        .replace(/\D00(?=\D*$)/, '')
        .replace(/hun/i, 'Ft')
        .replace(/GBP/i, "£");
};

export const sleep = async (ms: number) => {
    return new Promise(resolve => setTimeout(() => resolve(null), ms));
};
