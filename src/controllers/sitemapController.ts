import { Request, Response } from 'express';
import Product from '../models/Product';
import Category from '../models/Category';

export const generateSitemap = async (req: Request, res: Response) => {
    try {
        const domain = process.env.DOMAIN || 'https://nemez.shop';
        const products = await Product.find({}, 'name slug updatedAt');
        const categories = await Category.find({}, '_id updatedAt');

        let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${domain}</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>`;

        // Add Categories
        categories.forEach(cat => {
            xml += `
  <url>
    <loc>${domain}/category/${cat._id}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`;
        });

        // Add Products
        products.forEach(prod => {
            xml += `
  <url>
    <loc>${domain}/product/${encodeURIComponent(prod.name)}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`;
        });

        xml += `
</urlset>`;

        res.header('Content-Type', 'application/xml');
        res.status(200).send(xml);
    } catch (error) {
        res.status(500).send('Error generating sitemap');
    }
};

export const generateRobots = (req: Request, res: Response) => {
    const domain = process.env.DOMAIN || 'https://nemez.shop';
    const robots = `User-agent: *
Allow: /

Sitemap: ${domain}/sitemap.xml
`;
    res.header('Content-Type', 'text/plain');
    res.status(200).send(robots);
};
