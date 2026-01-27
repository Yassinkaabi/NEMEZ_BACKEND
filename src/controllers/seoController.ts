import { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import Product from '../models/Product';
import Category from '../models/Category';

// Helper to inject meta tags into HTML
const injectMetaTags = (html: string, tags: { [key: string]: string }) => {
    let injectedHtml = html;

    // Replace default title
    if (tags.title) {
        injectedHtml = injectedHtml.replace(/<title>.*?<\/title>/, `<title>${tags.title}</title>`);
    }

    // Prepare meta tags string
    const metaString = Object.entries(tags)
        .map(([name, content]) => {
            if (name.startsWith('og:') || name.startsWith('product:')) {
                return `<meta property="${name}" content="${content}" />`;
            }
            return `<meta name="${name}" content="${content}" />`;
        })
        .join('\n    ');

    // Inject before </head>
    return injectedHtml.replace('</head>', `    ${metaString}\n  </head>`);
};

export const handleProductSEO = async (req: Request, res: Response) => {
    try {
        const { slug } = req.params;
        const product = await Product.findOne({ name: slug }).populate('categoryId');

        if (!product) {
            return res.sendFile(path.join(__dirname, '../../../Frontend/dist/index.html'));
        }

        const frontendPath = process.env.FRONTEND_PATH || path.join(__dirname, '../../../Frontend');
        const indexPath = path.join(frontendPath, 'dist/index.html');
        // If dist doesn't exist (dev mode), try the root index.html
        const finalIndexPath = fs.existsSync(indexPath)
            ? indexPath
            : path.join(frontendPath, 'index.html');

        let html = fs.readFileSync(finalIndexPath, 'utf8');

        const totalStock = product.variants?.reduce((sum, v) => sum + v.stock, 0) || 0;
        const firstImage = product.images?.[0] || '';

        // Prepare tags
        const tags = {
            'title': `${product.name} - NEMEZ`,
            'description': product.description?.substring(0, 160) || '',
            'og:title': product.name,
            'og:description': product.description?.substring(0, 200) || '',
            'og:image': firstImage,
            'og:type': 'product',
            'product:price:amount': product.price.toString(),
            'product:price:currency': 'TND',
            'product:availability': totalStock > 0 ? 'in stock' : 'out of stock'
        };

        html = injectMetaTags(html, tags);
        res.send(html);
    } catch (error) {
        console.error('SEO Injection Error:', error);
        res.sendFile(path.join(__dirname, '../../../Frontend/index.html'));
    }
};

export const handleCategorySEO = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const category = await Category.findById(id);

        if (!category) {
            return res.sendFile(path.join(__dirname, '../../../Frontend/index.html'));
        }

        const frontendPath = process.env.FRONTEND_PATH || path.join(__dirname, '../../../Frontend');
        const indexPath = path.join(frontendPath, 'index.html');
        let html = fs.readFileSync(indexPath, 'utf8');

        const tags = {
            'title': `${category.name} - NEMEZ`,
            'description': `Découvrez notre collection ${category.name} sur NEMEZ.`,
            'og:title': category.name,
            'og:type': 'website'
        };

        html = injectMetaTags(html, tags);
        res.send(html);
    } catch (error) {
        res.sendFile(path.join(__dirname, '../../../Frontend/index.html'));
    }
};
