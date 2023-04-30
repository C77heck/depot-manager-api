import express, { NextFunction } from 'express';
import { Inject } from '../../../application/libs/inject.decorator';
import { MESSAGE } from '../../../libs/constants';
import { handleError } from '../../../libs/handle-error';
import UserService from '../services/user.service';
import { ExpressController } from './libs/express.controller';
import { trim } from './libs/helpers/validator/formatters';
import { validate } from './libs/helpers/validator/input-validator';
import { email, required } from './libs/helpers/validator/validators';

export class UserController extends ExpressController {
    @Inject()
    private userService: UserService;

    public routes() {
        this.router.post('/login', [
            validate.bind(this, {
                email: { validators: [required, email], formatters: [trim] },
                password: { validators: [required] },
            })
        ], this.login.bind(this));

        this.router.post('/register', [
            validate.bind(this, {
                email: { validators: [required, email], formatters: [trim] },
                firstName: { validators: [required] },
                lastName: { validators: [required] },
            })
        ], this.register.bind(this));

        this.router.put('/update', [
            validate.bind(this, {
                firstName: { validators: [required] },
                lastName: { validators: [required] }
            })
        ], this.updateUserData.bind(this));

        this.router.get('/whoami', [], this.whoami.bind(this));

        this.router.delete('/delete-account', [], this.deleteAccount.bind(this));
    }

    private async register(req: express.Request, res: express.Response, next: NextFunction) {
        try {
            this.handleValidation(req);

            const { user, token } = await this.userService.register(req);

            const userData = await this.userService.getPublicData(user);

            res.json({
                payload: {
                    ...userData,
                    token: token,
                }
            });
        } catch (err) {
            return next(handleError(err));
        }
    }

    private async login(req: express.Request, res: express.Response, next: NextFunction) {
        try {
            this.handleValidation(req);

            const { user, token } = await this.userService.login(req);

            const userData = await this.userService.getPublicData(user);

            res.json({
                payload: {
                    ...userData,
                    token: token,
                }
            });
        } catch (err) {
            return next(handleError(err));
        }
    }

    private async updateUserData(req: express.Request, res: express.Response, next: NextFunction) {
        try {
            this.handleValidation(req);
            const user = await this.userService.extractUser(req);
            await this.userService.updateUser(user, req.body);

            res.status(201).json({ message: MESSAGE.SUCCESS.USER_DATA_UPDATED });
        } catch (err) {
            return next(handleError(err));
        }
    }

    private async deleteAccount(req: express.Request, res: express.Response, next: NextFunction) {
        try {
            const user = await this.userService.extractUser(req);

            await user.remove();

            res.status(200).json({ message: MESSAGE.SUCCESS.ACCOUNT_DELETED });
        } catch (err) {
            return next(handleError(err));
        }
    }

    private async whoami(req: express.Request, res: express.Response, next: NextFunction) {
        try {
            const user = await this.userService.extractUser(req);
            const userData = await this.userService.getPublicData(user);

            res.status(200).json({ payload: userData });
        } catch (err) {
            return next(handleError(err));
        }
    }
}
