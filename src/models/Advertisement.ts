import mongoose, { Schema, Document } from 'mongoose';

export interface IAdvertisement extends Document {
    title: string;
    description: string;
    imageUrl: string;
    linkUrl?: string;
    productId?: mongoose.Types.ObjectId;

    // Gestion chronologique
    startDate: Date;
    endDate: Date;
    priority: number; // 1-10, pour l'ordre d'affichage

    // Statut
    status: 'draft' | 'scheduled' | 'active' | 'expired' | 'archived';

    // Ciblage
    targetAudience?: {
        userType?: 'all' | 'new' | 'returning' | 'vip';
        categories?: string[];
    };

    // Métriques
    impressions: number;
    clicks: number;

    // Email
    emailSent: boolean;
    emailSentDate?: Date;
    emailRecipients?: number;

    // Métadonnées
    createdBy: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

const AdvertisementSchema = new Schema<IAdvertisement>({
    title: {
        type: String,
        required: true,
        maxlength: 100
    },
    description: {
        type: String,
        required: true,
        maxlength: 500
    },
    imageUrl: {
        type: String,
        required: true
    },
    linkUrl: {
        type: String
    },
    productId: {
        type: Schema.Types.ObjectId,
        ref: 'Product'
    },

    startDate: {
        type: Date,
        required: true,
        index: true
    },
    endDate: {
        type: Date,
        required: true,
        index: true
    },
    priority: {
        type: Number,
        default: 5,
        min: 1,
        max: 10
    },

    status: {
        type: String,
        enum: ['draft', 'scheduled', 'active', 'expired', 'archived'],
        default: 'draft',
        index: true
    },

    targetAudience: {
        userType: {
            type: String,
            enum: ['all', 'new', 'returning', 'vip'],
            default: 'all'
        },
        categories: [{ type: String }]
    },

    impressions: {
        type: Number,
        default: 0
    },
    clicks: {
        type: Number,
        default: 0
    },

    emailSent: {
        type: Boolean,
        default: false
    },
    emailSentDate: {
        type: Date
    },
    emailRecipients: {
        type: Number,
        default: 0
    },

    createdBy: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, {
    timestamps: true
});

// Index composé pour les requêtes chronologiques
AdvertisementSchema.index({ status: 1, startDate: -1 });
AdvertisementSchema.index({ status: 1, priority: -1, startDate: -1 });

export default mongoose.model<IAdvertisement>('Advertisement', AdvertisementSchema);
