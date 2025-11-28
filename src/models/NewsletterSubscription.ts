import mongoose, { Schema, Document } from 'mongoose';

export interface INewsletterSubscription extends Document {
    email: string;
    userId?: mongoose.Types.ObjectId;

    // Préférences
    preferences: {
        newArrivals: boolean;
        promotions: boolean;
        weeklyDigest: boolean;
    };

    // Statut
    isActive: boolean;
    unsubscribedAt?: Date;

    // Métadonnées
    subscribedAt: Date;
    lastEmailSent?: Date;
    emailsSentCount: number;
}

const NewsletterSubscriptionSchema = new Schema<INewsletterSubscription>({
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        index: true
    },
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },

    preferences: {
        newArrivals: { type: Boolean, default: true },
        promotions: { type: Boolean, default: true },
        weeklyDigest: { type: Boolean, default: false }
    },

    isActive: {
        type: Boolean,
        default: true,
        index: true
    },
    unsubscribedAt: {
        type: Date
    },

    subscribedAt: {
        type: Date,
        default: Date.now
    },
    lastEmailSent: {
        type: Date
    },
    emailsSentCount: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

export default mongoose.model<INewsletterSubscription>('NewsletterSubscription', NewsletterSubscriptionSchema);
