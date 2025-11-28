import mongoose, { Schema, Document } from 'mongoose';

export interface ICounter {
    model: string;
    count: number;
}

const counterSchema = new Schema<ICounter>({
    model: { type: String, required: true, unique: true },
    count: { type: Number, default: 0 },
});

export default mongoose.model<ICounter>('Counter', counterSchema);
