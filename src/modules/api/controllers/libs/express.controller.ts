import express from 'express';
import { UnprocessableEntity } from '../../../../application/models/errors';
import { Provider } from '../../../../application/provider';

export abstract class ExpressController extends Provider {
    public router: express.Router;

    public boot() {
        this.router = express.Router();
        this.routes();
    }

    public abstract routes(): void;

    public handleValidation(req: express.Request) {
        const errors = this.validate(req);
        console.log(errors);
        if (!errors.isValid) {
            throw new UnprocessableEntity(`Invalid inputs passed, please check your data`, errors);
        }
    }

    private validate(req: express.Request) {
        const errors = (req as any).errors;
        console.log(errors);
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
    }
}
