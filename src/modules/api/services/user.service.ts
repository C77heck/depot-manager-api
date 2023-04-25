import * as bcrypt from 'bcryptjs';
import express from 'express';
import * as jwt from 'jsonwebtoken';
import Mongoose, { startSession } from 'mongoose';
import { BadRequest, Forbidden, InternalServerError, Unauthorized } from '../../../application/models/errors';
import { Provider } from '../../../application/provider';
import { ERROR_MESSAGES } from '../../../libs/constants';
import User, { UserDocument } from '../models/documents/user.document';

class UserService extends Provider {
    public collection: Mongoose.Model<UserDocument, {}> = User;

    public async register(req: express.Request) {
        const session = await startSession();
        session.startTransaction();

        try {
            const { email, password } = req.body;

            const existingUser = await User.findOne({ email: email });

            if (existingUser) {
                throw new BadRequest('The email you entered, is already in use', { session });
            }

            let hashedPassword: string;

            try {
                hashedPassword = await bcrypt.hash(password, 12);
            } catch (err) {
                throw new InternalServerError('Could not create user, please try again.', { session });
            }

            let createdUser: any;
            try {
                createdUser = new this.collection({
                    ...req.body,
                    password: hashedPassword
                });

                await createdUser.save();
            } catch (err) {
                throw new InternalServerError('Could not create user, please try again.', { session });
            }

            await session.commitTransaction();
            await session.endSession();

            return this.login(req);
        } catch (err) {
            await err.payload?.session?.abortTransaction();
            await err.payload?.session?.endSession();

            throw err;
        }
    }

    public async login(req: express.Request): Promise<{ user: UserDocument; token: string }> {
        const { email, password } = req.body;

        const user = await this.collection.findOne({ email: email });

        if (!user) {
            throw new Forbidden('Invalid credentials, please try again.');
        }

        let isValidPassword = false;
        try {
            isValidPassword = await bcrypt.compare(password, user.password);
        } catch (err) {
            user.loginAttempts();

            throw new Forbidden('Could not log you in, please check your credentials and try again');
        }

        if (!isValidPassword) {
            user.loginAttempts();

            throw new Forbidden('Could not log you in, please check your credentials and try again');
        }

        await user.loginAttempts(0);

        let token;
        try {
            token = jwt.sign({ userId: user._id, email: user.email },
                process.env?.JWT_KEY || '',
                { expiresIn: '24h' }
            );
        } catch (err) {
            throw new InternalServerError('Login failed, please try again');
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

    public async updateUser(req: express.Request, data: any) {
        const user = await this.extractUser(req);

        return user.update(data);
    }

    public async getSecurityQuestion(req: express.Request) {
        const user = await this.collection.findOne({ email: req.body.email });

        if (!user) {
            throw new BadRequest(ERROR_MESSAGES.NOT_FOUND.USER);
        }

        const securityQuestion = await user.getUserSecurityQuestion();

        if (!securityQuestion) {
            throw new InternalServerError(ERROR_MESSAGES.GENERIC);
        }

        return securityQuestion;
    }
}

export default UserService;
