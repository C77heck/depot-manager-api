import express, { NextFunction } from 'express';
import { Inject } from '../../../application/libs/inject.decorator';
import { BadRequest, Forbidden } from '../../../application/models/errors';
import { ERROR_MESSAGES, MESSAGE } from '../../../libs/constants';
import { handleError } from '../../../libs/handle-error';
import PasswordRecoveryService from '../services/password-recovery.service';
import UserService from '../services/user.service';
import { ExpressController } from './libs/express.controller';
import { trim } from './libs/helpers/validator/formatters';
import { validate } from './libs/helpers/validator/input-validator';
import { email, required } from './libs/helpers/validator/validators';

export class UserController extends ExpressController {
    @Inject()
    private userService: UserService;

    @Inject()
    private passwordRecoveryService: PasswordRecoveryService;

    public routes() {
        this.router.post('/login', [
            validate.bind(this, {
                email: { validators: [required, email], formatters: [trim] },
                password: { validators: [required] },
            })
        ], this.login.bind(this));

        this.router.post('/forgot-password', [
            validate.bind(this, {
                email: { validators: [required, email], formatters: [trim] }
            })
        ], this.forgotPassword.bind(this));

        this.router.post('/security-check', [
            validate.bind(this, {
                email: { validators: [required, email], formatters: [trim] },
                answer: { validators: [required], formatters: [trim] }
            })
        ], this.securityCheck.bind(this));

        this.router.post('/recover-password', [
            validate.bind(this, {
                token: { validators: [required], formatters: [trim] },
                password: { validators: [required], formatters: [trim] }
            })
        ], this.recoverPassword.bind(this));

        this.router.post('/register', [
            validate.bind(this, {
                email: { validators: [required, email], formatters: [trim] },
                firstName: { validators: [required] },
                lastName: { validators: [required] },
                securityAnswer: { validators: [required], formatters: [trim] },
                securityQuestion: { validators: [required] },
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

    private async forgotPassword(req: express.Request, res: express.Response, next: NextFunction) {
        try {
            this.handleValidation(req);
            const user = await this.userService.getUserByEmail(req.body?.email);

            const securityQuestion = await this.userService.getSecurityQuestion(user);

            res.json({
                payload: {
                    securityQuestion
                }
            });
        } catch (err) {
            return next(handleError(err));
        }
    }

    private async securityCheck(req: express.Request, res: express.Response, next: NextFunction) {
        try {
            this.handleValidation(req);
            const user = await this.userService.getUserByEmail(req.body?.email);

            const isMatch = await this.userService.checkSecurityAnswer(user, req.body?.answer);

            if (!isMatch) {
                throw new BadRequest(ERROR_MESSAGES.WRONG_ANSWER);
            }

            const recovery = await this.passwordRecoveryService.getRecoveryToken(user, req.body.answer);

            res.json({
                payload: {
                    token: recovery.token
                }
            });
        } catch (err) {
            return next(handleError(err));
        }
    }

    private async recoverPassword(req: express.Request, res: express.Response, next: NextFunction) {
        try {
            this.handleValidation(req);
            const recovery = await this.passwordRecoveryService.get(req.body?.token);

            const isValid = await this.passwordRecoveryService.validateToken(req.body?.token);

            if (!isValid) {
                throw new Forbidden(ERROR_MESSAGES.GENERIC);
            }

            await this.userService.setPassword(recovery.user, req.body?.password);

            await this.passwordRecoveryService.fulfillRecovery(recovery);

            res.json({
                payload: {
                    message: MESSAGE.SUCCESS.GENERIC
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
