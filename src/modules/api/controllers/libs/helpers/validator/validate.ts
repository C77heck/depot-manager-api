import express from 'express';

export const validate = (req: express.Request) => {
    const errors = (req as any).errors;
    if (!errors?.length) {
        return {
            errors: [],
            isValid: true,
        };
    }

    return {
        errors,
        isValid: false,
    };
};
