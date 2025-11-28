import mongoose, { Schema, Document } from 'mongoose';

export interface IReview extends Document {
    userId: mongoose.Types.ObjectId;
    productId: mongoose.Types.ObjectId;
    rating: number;
    comment: string;
    createdAt: Date;
    updatedAt: Date;
}

const reviewSchema = new Schema<IReview>({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    productId: {
        type: Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },
    comment: {
        type: String,
        required: true,
        trim: true,
        minlength: 3,
        maxlength: 1000
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Index to ensure one review per user per product
reviewSchema.index({ userId: 1, productId: 1 }, { unique: true });

// Update the updatedAt timestamp on save
reviewSchema.pre<IReview>('save', function (next) {
    this.updatedAt = new Date();
    next();
});

export default mongoose.model<IReview>('Review', reviewSchema);
