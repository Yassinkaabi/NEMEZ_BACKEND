import mongoose, { Schema, Document } from 'mongoose';
import Counter from './Counter';

interface OrderItem {
    productId: mongoose.Types.ObjectId;
    quantity: number;
    size: string;
    color: string;
    price: number;
}

export interface IOrder extends Document {
    orderId: number;
    userId?: mongoose.Types.ObjectId;
    items: OrderItem[];
    address: string;
    phone: string;
    email?: string;
    name: string;
    totalAmount: number;
    status: 'pending' | 'confirmed' | 'delivered';
    createdAt: Date;
}

const orderSchema = new Schema<IOrder>({
    orderId: { type: Number, unique: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: false },
    items: [{
        productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
        quantity: { type: Number, required: true },
        size: { type: String, required: true },
        color: { type: String, required: true },
        price: { type: Number, required: true }
    }],
    address: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String, required: false },
    name: { type: String, required: true },
    totalAmount: { type: Number, required: true },
    status: { type: String, enum: ['pending', 'confirmed', 'delivered'], default: 'pending' },
    createdAt: { type: Date, default: Date.now }
});

orderSchema.pre<IOrder>('save', async function (next) {
    if (this.isNew) {
        const counter = await Counter.findOneAndUpdate(
            { model: 'Order' },
            { $inc: { count: 1 } },
            { new: true, upsert: true }
        );
        this.orderId = counter.count;
    }
    next();
});

export default mongoose.model<IOrder>('Order', orderSchema);