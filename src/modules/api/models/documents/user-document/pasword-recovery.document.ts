import Mongoose from 'mongoose';
import mongoose, { Document, Schema } from 'mongoose';
import { UserDocument } from './user.document';

export interface PasswordRecoveryDocument extends Document {
    token: string;
    fulfilled: boolean;
    user: UserDocument;
}

export type PasswordRecoveryModel = Mongoose.Model<PasswordRecoveryDocument, {}, {}>;

const passwordRecoverySchema = new Schema<PasswordRecoveryDocument, PasswordRecoveryModel>({
    token: { type: String, required: true },
    fulfilled: { type: Boolean, default: false },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
});

passwordRecoverySchema.set('timestamps', true);

export default mongoose.model<PasswordRecoveryDocument, PasswordRecoveryModel>('PasswordRecovery', passwordRecoverySchema);
