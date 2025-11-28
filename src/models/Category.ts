import mongoose, { Schema, Document } from 'mongoose';
import Counter from './Counter';

export interface ICategory extends Document {
    categoryId: number;
    name: string;
    image: string;
    description?: string;
}

const categorySchema = new Schema<ICategory>({
    categoryId: { type: Number, unique: true },
    name: { type: String, required: true, unique: true },
    image: { type: String, required: true },
    description: { type: String }
});


categorySchema.pre<ICategory>('save', async function (next) {
    if (this.isNew) {
        const counter = await Counter.findOneAndUpdate(
            { model: 'Category' },
            { $inc: { count: 1 } },
            { new: true, upsert: true }
        );
        this.categoryId = counter.count;
    }
    next();
});
export default mongoose.model<ICategory>('Category', categorySchema);