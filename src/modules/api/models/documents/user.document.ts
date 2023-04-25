import Mongoose from 'mongoose';
import mongoose, { Document, Schema } from 'mongoose';

export interface UserDocument extends Document {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    securityQuestion: string;
    securityAnswer: string;
    status: {
        attempts: number;
        isBlocked: boolean;
    },
    forgotPasswordStatus: {
        attempts: number;
        isBlocked: boolean;
    },
    getPublicData: () => Promise<PublicUserData>;
}

export type PublicUserData = Pick<UserDocument, 'email' | '_id' | 'firstName' | 'lastName'>

export type UserModel = Mongoose.Model<UserDocument>;

const userSchema = new Schema<UserDocument>({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true, match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ },
    password: { type: String, required: true },
    status: {
        attempts: { type: Number, required: false, default: 0 },
        isBlocked: { type: Boolean, required: false, default: false }
    },
    securityQuestion: { type: String, required: true },
    securityAnswer: { type: String, required: true },
    forgotPasswordStatus: {
        attempts: { type: Number, required: false, default: 0 },
        isBlocked: { type: Boolean, required: false, default: false }
    },
});

userSchema.index({ email: 'text' });

userSchema.set('timestamps', true);

export default mongoose.model<UserDocument, UserModel>('User', userSchema);
