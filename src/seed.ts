// src/seed.ts
import dotenv from 'dotenv';
import connectDB from './config/db';
import User from './models/User';
import Category from './models/Category';
import Product from './models/Product';

dotenv.config();

const seedData = async () => {
    try {
        await connectDB();

        // Nettoyer la base
        await User.deleteMany({});
        await Category.deleteMany({});
        await Product.deleteMany({});

        console.log('🗑️  Base de données nettoyée');

        // Créer un utilisateur admin
        const admin = await User.create({
            name: 'Admin HM',
            email: 'admin@hm-shop.com',
            password: 'admin123',
            role: 'admin',
            phone: '20 123 456',
            address: 'Sousse, Tunisie'
        });

        // Créer un utilisateur test
        await User.create({
            name: 'Ahmed Ben Ali',
            email: 'ahmed@example.com',
            password: 'test123',
            role: 'user',
            phone: '22 555 777',
            address: 'Tunis, Tunisie'
        });

        console.log('✅ Utilisateurs créés');

        // Créer des catégories
        const categories = await Category.insertMany([
            {
                name: 'T-Shirts',
                image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400',
                description: 'T-shirts confortables pour tous les jours'
            },
            {
                name: 'Vestes',
                image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400',
                description: 'Vestes élégantes et pratiques'
            },
            {
                name: 'Pantalons',
                image: 'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=400',
                description: 'Pantalons pour toutes les occasions'
            },
            {
                name: 'Chaussures',
                image: 'https://images.unsplash.com/photo-1460353581641-37baddab0fa2?w=400',
                description: 'Chaussures confortables et stylées'
            }
        ]);

        console.log('✅ Catégories créées');

        // Créer des produits
        const products = [
            // T-Shirts
            {
                name: 'T-shirt basique noir',
                description: 'T-shirt en coton 100% de qualité supérieure, coupe regular fit',
                price: 35,
                categoryId: categories[0]._id,
                images: [
                    'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500',
                    'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=500'
                ],
                sizes: ['S', 'M', 'L', 'XL'],
                colors: ['Noir', 'Blanc', 'Gris'],
                stock: 50
            },
            {
                name: 'T-shirt polo blanc',
                description: 'Polo classique en piqué de coton, col et manches contrastés',
                price: 45,
                categoryId: categories[0]._id,
                images: ['https://images.unsplash.com/photo-1586363104862-3a5e2ab60d99?w=500'],
                sizes: ['M', 'L', 'XL', 'XXL'],
                colors: ['Blanc', 'Bleu', 'Noir'],
                stock: 30
            },
            {
                name: 'T-shirt graphique',
                description: 'T-shirt avec imprimé tendance, coupe moderne',
                price: 40,
                categoryId: categories[0]._id,
                images: ['https://images.unsplash.com/photo-1622445275576-721325763afe?w=500'],
                sizes: ['S', 'M', 'L', 'XL'],
                colors: ['Noir', 'Blanc', 'Gris'],
                stock: 25
            },

            // Vestes
            {
                name: 'Veste en jean',
                description: 'Veste en denim classique, coupe ajustée',
                price: 120,
                categoryId: categories[1]._id,
                images: [
                    'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=500',
                    'https://images.unsplash.com/photo-1543076447-215ad9ba6923?w=500'
                ],
                sizes: ['M', 'L', 'XL'],
                colors: ['Bleu', 'Noir'],
                stock: 15
            },
            {
                name: 'Blouson cuir',
                description: 'Blouson en cuir véritable, style biker',
                price: 280,
                categoryId: categories[1]._id,
                images: ['https://images.unsplash.com/photo-1520975916090-3105956dac38?w=500'],
                sizes: ['M', 'L', 'XL', 'XXL'],
                colors: ['Noir', 'Marron'],
                stock: 8
            },
            {
                name: 'Veste bomber',
                description: 'Veste bomber classique, doublure satinée',
                price: 95,
                categoryId: categories[1]._id,
                images: ['https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=500'],
                sizes: ['S', 'M', 'L', 'XL'],
                colors: ['Noir', 'Kaki', 'Bleu'],
                stock: 20
            },

            // Pantalons
            {
                name: 'Jean slim noir',
                description: 'Jean stretch coupe slim, taille normale',
                price: 75,
                categoryId: categories[2]._id,
                images: [
                    'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=500',
                    'https://images.unsplash.com/photo-1542272604-787c3835535d?w=500'
                ],
                sizes: ['28', '30', '32', '34', '36'],
                colors: ['Noir', 'Bleu foncé'],
                stock: 40
            },
            {
                name: 'Chino beige',
                description: 'Pantalon chino en coton, coupe droite',
                price: 65,
                categoryId: categories[2]._id,
                images: ['https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=500'],
                sizes: ['30', '32', '34', '36'],
                colors: ['Beige', 'Kaki', 'Gris'],
                stock: 35
            },
            {
                name: 'Jogging sport',
                description: 'Pantalon de jogging confortable, molleton intérieur',
                price: 50,
                categoryId: categories[2]._id,
                images: ['https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=500'],
                sizes: ['S', 'M', 'L', 'XL', 'XXL'],
                colors: ['Noir', 'Gris', 'Bleu'],
                stock: 45
            },

            // Chaussures
            {
                name: 'Sneakers blanches',
                description: 'Baskets en cuir blanc, semelle en caoutchouc',
                price: 85,
                categoryId: categories[3]._id,
                images: [
                    'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=500',
                    'https://images.unsplash.com/photo-1600185365926-3a2ce3cdb9eb?w=500'
                ],
                sizes: ['40', '41', '42', '43', '44', '45'],
                colors: ['Blanc', 'Blanc/Noir'],
                stock: 30
            },
            {
                name: 'Boots en cuir',
                description: 'Bottines en cuir véritable, style Chelsea',
                price: 140,
                categoryId: categories[3]._id,
                images: ['https://images.unsplash.com/photo-1608256246200-53e635b5b65f?w=500'],
                sizes: ['40', '41', '42', '43', '44'],
                colors: ['Noir', 'Marron'],
                stock: 18
            },
            {
                name: 'Mocassins élégants',
                description: 'Mocassins en daim, semelle en cuir',
                price: 95,
                categoryId: categories[3]._id,
                images: ['https://images.unsplash.com/photo-1533867617858-e7b97e060509?w=500'],
                sizes: ['40', '41', '42', '43', '44'],
                colors: ['Bleu', 'Marron', 'Noir'],
                stock: 22
            }
        ];

        await Product.insertMany(products);

        console.log('✅ Produits créés');
        console.log('\n📊 Statistiques :');
        console.log(`   - ${await User.countDocuments()} utilisateurs`);
        console.log(`   - ${await Category.countDocuments()} catégories`);
        console.log(`   - ${await Product.countDocuments()} produits`);
        console.log('\n🔑 Compte admin :');
        console.log('   Email: admin@hm-shop.com');
        console.log('   Password: admin123');
        console.log('\n👤 Compte utilisateur :');
        console.log('   Email: ahmed@example.com');
        console.log('   Password: test123');

        process.exit(0);
    } catch (error) {
        console.error('❌ Erreur lors du seeding:', error);
        process.exit(1);
    }
};

seedData();