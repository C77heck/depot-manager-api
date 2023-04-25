import * as jwt from 'jsonwebtoken';
import { startSession } from 'mongoose';
import { Forbidden, Unauthorized } from '../../../application/models/errors';
import { Provider } from '../../../application/provider';
import { ERROR_MESSAGES } from '../../../libs/constants';
import PasswordRecovery, { PasswordRecoveryDocument, PasswordRecoveryModel } from '../models/documents/user-document/pasword-recovery.document';
import { UserDocument } from '../models/documents/user-document/user.document';

class PasswordRecoveryService extends Provider {
    private collection: PasswordRecoveryModel = PasswordRecovery;

    public async getRecoveryToken(user: UserDocument, answer: string) {
        const session = await startSession();
        session.startTransaction();
        try {
            const token = jwt.sign({ answer },
                process.env?.JWT_KEY || '',
                { expiresIn: '24h' }
            );

            const recovery = new this.collection({
                token, user
            });

            await recovery.save();
            await session.commitTransaction();
            await session.endSession();

            return recovery;
        } catch (err) {
            await session.abortTransaction();
            await session.endSession();

            throw err;
        }
    }

    public async get(token: string): Promise<PasswordRecoveryDocument> {
        const recovery = await this.collection.findOne({ token });

        if (!recovery) {
            throw new Forbidden(ERROR_MESSAGES.INVALID_TOKEN);
        }

        await recovery.populate('user');

        return recovery;
    }

    public async fulfillRecovery(recovery: PasswordRecoveryDocument): Promise<PasswordRecoveryDocument> {
        recovery.fulfilled = true;

        return recovery.save();
    }

    public async validateToken(token: string): Promise<boolean> {
        try {
            const recovery = await this.collection.findOne({ token });

            if (!recovery || recovery.fulfilled) {
                throw new Forbidden(ERROR_MESSAGES.EXPIRED_TOKEN);
            }

            await recovery.populate('user');

            const decodedToken: any = jwt.verify(token, process.env?.JWT_KEY || '');

            return decodedToken.answer === recovery.user.securityAnswer;
        } catch (e) {
            throw new Unauthorized(ERROR_MESSAGES.INVALID_TOKEN);
        }
    }
}

export default PasswordRecoveryService;
