import { Request, Response } from 'express';
import cloudinary from '../config/clouddinayConfig';
import { Readable } from 'stream';

interface MulterRequest extends Request {
    file?: Express.Multer.File;
}

export const uploadImage = async (req: MulterRequest, res: Response) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        // Create a readable stream from the buffer
        const stream = Readable.from(req.file.buffer);

        // Upload to Cloudinary using upload_stream
        const uploadPromise = new Promise<string>((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                {
                    folder: 'nemez-shop',
                    resource_type: 'image'
                },
                (error, result) => {
                    if (error) {
                        reject(error);
                    } else if (result) {
                        resolve(result.secure_url);
                    } else {
                        reject(new Error('Upload failed'));
                    }
                }
            );

            stream.pipe(uploadStream);
        });

        const imageUrl = await uploadPromise;

        res.status(200).json({
            message: 'Image uploaded successfully',
            url: imageUrl
        });
    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ message: 'Error uploading image', error });
    }
};
