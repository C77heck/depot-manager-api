import express from 'express';
import { FormatterFunction } from './formatters';
import { ValidatorFunction } from './validators';

export interface Validate {
    validators: ValidatorFunction[];
    formatters: FormatterFunction<any>[];
}

export const validate = (fields: Record<string, Validate>, req: express.Request, res: express.Response, next: express.NextFunction) => {
    const errors = [];

    for (const field of Object.keys(fields)) {
        const fieldValue = req.body?.[field];
        const validators = fields[field]?.validators || [];
        const formatters = fields[field]?.formatters || [];

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
    }

    next();
};
