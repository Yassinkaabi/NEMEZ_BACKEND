import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcryptjs';
import Counter from './Counter';

export interface IAdminPermissions {
    canManageUsers: boolean;
    canManageProducts: boolean;
    canManageCategories: boolean;
    canManageOrders: boolean;
    canManageReviews: boolean;
}

export interface IUser extends Document {
    userId: number;
    name: string;
    email: string;
    password: string;
    address?: string;
    phone?: string;
    role: 'user' | 'admin';
    permissions?: IAdminPermissions;
    createdAt: Date;
    comparePassword(candidatePassword: string): Promise<boolean>;
}

const userSchema = new Schema<IUser>({
    userId: { type: Number, unique: true },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    address: { type: String },
    phone: { type: String },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    permissions: {
        canManageUsers: { type: Boolean, default: false },
        canManageProducts: { type: Boolean, default: false },
        canManageCategories: { type: Boolean, default: false },
        canManageOrders: { type: Boolean, default: false },
        canManageReviews: { type: Boolean, default: false }
    },
    createdAt: { type: Date, default: Date.now },
});

// Hash du mot de passe
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 12);
    next();
});

// Auto-incrément de userId
userSchema.pre<IUser>('save', async function (next) {
    if (this.isNew) {
        const counter = await Counter.findOneAndUpdate(
            { model: 'User' },
            { $inc: { count: 1 } },
            { new: true, upsert: true }
        );
        this.userId = counter.count;
    }
    next();
});

userSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
    return await bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.model<IUser>('User', userSchema);
