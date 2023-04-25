import * as bcrypt from 'bcryptjs';
import express from 'express';
import * as jwt from 'jsonwebtoken';
import { startSession } from 'mongoose';
import { BadRequest, Forbidden, InternalServerError, Unauthorized } from '../../../application/models/errors';
import { Provider } from '../../../application/provider';
import { ERROR_MESSAGES } from '../../../libs/constants';
import User, { PublicUserData, UserDocument, UserModel } from '../models/documents/user-document/user.document';

class UserService extends Provider {
    private collection: UserModel = User;

    public async register(req: express.Request) {
        const session = await startSession();
        session.startTransaction();

        try {
            const { email, password, firstName, lastName, securityQuestion, securityAnswer } = req.body;
            const existingUser = await this.collection.findOne({ email: email });

            if (existingUser) {
                throw new BadRequest('The email you entered, is already in use');
            }

            let hashedPassword: string;

            try {
                hashedPassword = await bcrypt.hash(password, 12);
            } catch (err) {
                throw new InternalServerError('Could not create user, please try again.');
            }

            let createdUser: any;
            try {
                createdUser = new this.collection({
                    securityQuestion,
                    securityAnswer,
                    email,
                    firstName,
                    lastName,
                    password: hashedPassword
                });

                await createdUser.save();
            } catch (err) {
                throw new InternalServerError('Could not create user, please try again.');
            }

            await session.commitTransaction();
            await session.endSession();

            return this.login(req);
        } catch (err) {
            await session.abortTransaction();
            await session.endSession();

            throw err;
        }
    }

    public async login(req: express.Request): Promise<{ user: UserDocument; token: string }> {
        const { email, password } = req.body;

        const user = await this.collection.findOne({ email: email });

        if (!user) {
            throw new Forbidden('Invalid credentials, please try again.');
        }

        await this.checkIfLoginIsBlocked(user);

        try {
            const isValidPassword = await bcrypt.compare(password, user.password);

            if (!isValidPassword) {
                throw new Forbidden(ERROR_MESSAGES.INVALID_LOGIN);
            }
        } catch (err) {
            await this.addLoginAttempt(user);

            throw err;
        }

        await this.resetAttempts(user);

        let token;
        try {
            token = jwt.sign({ userId: user._id, email: user.email },
                process.env?.JWT_KEY || '',
                { expiresIn: '24h' }
            );
        } catch (err) {
            throw new InternalServerError(ERROR_MESSAGES.FAILED_LOGIN);
        }

        return { user, token };
    }

    public getToken(req: express.Request): string {
        if (!req?.headers?.authorization) {
            return '';
        }

        return (req?.headers?.authorization || '').split(' ')?.[1] || '';
    }

    public getUserId(req: express.Request): string {
        try {
            const token = this.getToken(req);
            const decodedToken: any = jwt.verify(token, process.env?.JWT_KEY || '');

            return decodedToken.userId;
        } catch (e) {
            throw new Unauthorized(ERROR_MESSAGES.INVALID_TOKEN);
        }
    }

    public async extractUser(req: express.Request): Promise<UserDocument> {
        const userId = this.getUserId(req);

        const user = await this.collection.findById(userId);

        if (!user) {
            throw new BadRequest(ERROR_MESSAGES.NOT_FOUND.USER);
        }

        return user;
    }

    public async getUserByEmail(email: string): Promise<UserDocument> {
        if (!email) {
            throw new BadRequest(ERROR_MESSAGES.GENERIC);
        }

        const user = await this.collection.findOne({ email });

        if (!user) {
            throw new BadRequest(ERROR_MESSAGES.NOT_FOUND.USER);
        }

        return user;
    }

    public async updateUser(user: UserDocument, data: UserDocument) {
        return user.update({
            firstName: data?.firstName ?? user.firstName,
            lastName: data?.lastName ?? user.lastName
        });
    }

    public async setPassword(user: UserDocument, password: string) {
        const hashedPassword = await bcrypt.hash(password, 12);

        return user.update({ password: hashedPassword });
    }

    public async getPublicData(user: UserDocument): Promise<PublicUserData> {
        return {
            userId: user._id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            isBlocked: user.loginStatus.isBlocked,
        };
    }

    public async checkSecurityAnswer(user: UserDocument, answer: string) {
        const isMatch = user.securityAnswer === answer;

        if (!isMatch) {
            if (user.forgotPasswordStatus.attempts > 5) {
                user.forgotPasswordStatus.isBlocked = true;
                user.forgotPasswordStatus.timeBlocked = Date.now() + (3 * 60 * 1000);
            } else {
                user.forgotPasswordStatus.attempts++;
            }

            await user.save();
        }

        return isMatch;
    }

    public async getSecurityQuestion(user: UserDocument) {
        const securityQuestion = user.securityQuestion;

        if (!securityQuestion) {
            throw new InternalServerError(ERROR_MESSAGES.GENERIC);
        }

        return securityQuestion;
    }

    private async checkIfLoginIsBlocked(user: UserDocument) {
        if (!user.loginStatus.isBlocked) {
            return;
        }

        if (user.loginStatus.timeBlocked <= Date.now()) {
            user.loginStatus.isBlocked = false;
            user.loginStatus.attempts = 0;
            await user.save();

            return;
        }

        throw new Unauthorized(ERROR_MESSAGES.TOO_MANY_ATTEMPTS);
    }

    private async addLoginAttempt(user: UserDocument) {
        if (user.loginStatus.attempts > 5) {
            user.loginStatus.isBlocked = true;
            user.loginStatus.timeBlocked = Date.now() + (3 * 60 * 1000);

            await user.save();

            throw new Unauthorized(ERROR_MESSAGES.TOO_MANY_ATTEMPTS);
        }
        user.loginStatus.attempts++;

        return user.save();
    }

    private async getIsForgottenPasswordBlocked(user: UserDocument) {
        if (!user.forgotPasswordStatus.isBlocked) {
            return;
        }

        if (user.forgotPasswordStatus.timeBlocked <= Date.now()) {
            user.forgotPasswordStatus.isBlocked = false;
            user.forgotPasswordStatus.attempts = 0;

            await user.save();

            return;
        }

        throw new Unauthorized(ERROR_MESSAGES.TOO_MANY_ATTEMPTS);
    }

    private async resetAttempts(user: UserDocument) {
        user.loginStatus.attempts = 0;
        user.forgotPasswordStatus.attempts = 0;

        return user.save();
    }
}

export default UserService;
