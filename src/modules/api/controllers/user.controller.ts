import express, { NextFunction } from 'express';
import { Inject } from '../../../application/libs/inject.decorator';
import { MESSAGE } from '../../../libs/constants';
import { handleError } from '../../../libs/handle-error';
import { ExpressController } from '../controllers/libs/express.controller';
import UserService from '../services/user.service';
import { field } from './libs/helpers/validator/field';
import { trim } from './libs/helpers/validator/formatters';
import { email, required } from './libs/helpers/validator/validators';

export class UserController extends ExpressController {
    @Inject()
    private userService: UserService;

    public routes() {
        this.router.post('/login', [
            field.bind(this, 'email', [required, email], [trim]),
            field.bind(this, 'password', [required])
        ], this.login.bind(this));

        this.router.post('/register', [
            field.bind(this, 'name', [required]),
            field.bind(this, 'email', [required, email], [trim]),
        ], this.register.bind(this));

        this.router.put('/update', [
            field.bind(this, 'name', []),
        ], this.updateUserData.bind(this));

        this.router.get('/whoami', [], this.whoami.bind(this));

        this.router.delete('/delete-account', [], this.deleteAccount.bind(this));
    }

    private async register(req: express.Request, res: express.Response, next: NextFunction) {
        try {
            this.handleValidation(req);

            const { user, token } = await this.userService.register(req);

            const userData = user.getPublicData();

            res.json({
                userData: {
                    ...userData,
                    userId: user.id,
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

            const userData = user.getPublicData();

            res.json({
                userData: {
                    ...userData,
                    userId: user.id,
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
            await this.userService.updateUser(req, req.body);

            res.status(201).json({ message: MESSAGE.SUCCESS.USER_DATA_UPDATED });
        } catch (err) {
            return next(handleError(err));
        }
    }

    private async deleteAccount(req: express.Request, res: express.Response, next: NextFunction) {
        try {
            const recruiter = await this.userService.extractUser(req);

            await recruiter.remove();

            res.status(200).json({ message: MESSAGE.SUCCESS.ACCOUNT_DELETED });
        } catch (err) {
            return next(handleError(err));
        }
    }

    private async whoami(req: express.Request, res: express.Response, next: NextFunction) {
        try {
            const recruiter = await this.userService.extractUser(req);

            res.status(200).json({ userData: recruiter.getPublicData() });
        } catch (err) {
            return next(handleError(err));
        }
    }
}
