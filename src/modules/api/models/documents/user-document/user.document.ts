import Mongoose from 'mongoose';
import mongoose, { Document, Schema } from 'mongoose';

export interface UserDocument extends Document {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    securityQuestion: string;
    securityAnswer: string;
    loginStatus: {
        attempts: number;
        isBlocked: boolean;
        timeBlocked: number;
    },
    forgotPasswordStatus: {
        attempts: number;
        isBlocked: boolean;
        timeBlocked: number;
    },
}

export interface PublicUserData extends Pick<UserDocument, 'email' | '_id' | 'firstName' | 'lastName'> {
    isBlocked: boolean;
}

export type UserModel = Mongoose.Model<UserDocument, {}, {}>;

const userSchema = new Schema<UserDocument, UserModel>({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true, match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ },
    password: { type: String, required: true },
    loginStatus: {
        attempts: { type: Number, default: 0 },
        isBlocked: { type: Boolean, default: false },
        timeBlocked: { type: Number, default: 0 }
    },
    securityQuestion: { type: String, required: true },
    securityAnswer: { type: String, required: true },
    forgotPasswordStatus: {
        attempts: { type: Number, default: 0 },
        isBlocked: { type: Boolean, default: false },
        timeBlocked: { type: Number, default: 0 }
    },
});

userSchema.index({ email: 'text' });

userSchema.set('timestamps', true);

export default mongoose.model<UserDocument, UserModel>('User', userSchema);
