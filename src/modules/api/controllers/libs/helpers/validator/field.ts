import express from 'express';
import { FormatterFunction } from './formatters';
import { ValidatorFunction } from './validators';

export type ValidatorArgumentOptions = ValidatorFunction[];

export const field = (field: string, validators: ValidatorArgumentOptions, formatters: FormatterFunction<any>[], req: express.Request, res: express.Response, next: express.NextFunction) => {
    const fieldValue = req.body?.[field];
    const errors = [];

    for (const validator of validators) {
        const result = validator(fieldValue);

        if (!result.isValid) {
            errors.push(result.error);
        }
    }

    for (const formatter of formatters) {
        const result = formatter(fieldValue);
        req.body[field] = result;
    }

    if (errors?.length) {
        (req as any).errors = !(req as any).errors ? [{ [field]: errors }] : [...(req as any).errors, { [field]: errors }];
    }

    next();
};
