export type FormatterFunction<TValue> = (value: TValue) => TValue;

export const trim: FormatterFunction<string> = (value) => {
    return (value || '').trim();
};

export const escape: FormatterFunction<string> = (value) => {
    const specialChars = /[ `!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]/;

    return (value || '').replace(specialChars, '');
};
