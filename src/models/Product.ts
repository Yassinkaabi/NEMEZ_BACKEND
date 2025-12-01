import mongoose, { Schema, Document } from 'mongoose';
import Counter from './Counter';

export interface IProductVariant {
    size: string;
    color: string;
    stock: number;
}

export interface IProduct extends Document {
    productId: number;
    name: string;
    description: string;
    price: number;
    categoryId: mongoose.Types.ObjectId;
    images: string[];
    sizes: string[];
    colors: string[];
    variants: IProductVariant[];
    stock: number;
    createdAt: Date;
}

const productVariantSchema = new Schema({
    size: { type: String, required: true },
    color: { type: String, required: true },
    stock: { type: Number, required: true, default: 0 }
}, { _id: false });

const productSchema = new Schema<IProduct>({
    productId: { type: Number, unique: true },
    name: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    categoryId: { type: Schema.Types.ObjectId, ref: 'Category', required: true },
    images: [{ type: String }],
    sizes: [{ type: String }],
    colors: [{ type: String }],
    variants: [productVariantSchema],
    createdAt: { type: Date, default: Date.now },
}, {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Virtual field for total stock (sum of all variants)
productSchema.virtual('stock').get(function () {
    if (this.variants && this.variants.length > 0) {
        return this.variants.reduce((total, variant) => total + variant.stock, 0);
    }
    return 0;
});

// Virtual field for reviews
productSchema.virtual('reviews', {
    ref: 'Review',
    localField: '_id',
    foreignField: 'productId'
});

productSchema.pre<IProduct>('save', async function (next) {
    if (this.isNew) {
        const counter = await Counter.findOneAndUpdate(
            { model: 'Product' },
            { $inc: { count: 1 } },
            { new: true, upsert: true }
        );
        this.productId = counter.count;
    }
    next();
});

export default mongoose.model<IProduct>('Product', productSchema);

