import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import User from '../models/User';
import { sendVerificationEmail } from '../utils/sendEmail';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'your-refresh-secret';

export const signup = async (req: Request, res: Response) => {
    try {
        const { name, email, password, phone, address } = req.body;

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'Email déjà utilisé' });
        }

        const verificationToken = crypto.randomBytes(32).toString('hex');
        const user = await User.create({
            name,
            email,
            password,
            phone,
            address,
            verificationToken
        });

        await sendVerificationEmail(user.email, verificationToken);

        res.status(201).json({
            message: 'Inscription réussie. Veuillez vérifier votre email pour activer votre compte.',
            user: { id: user._id, name: user.name, email: user.email, role: user.role, isVerified: user.isVerified }
        });
    } catch (error) {
        res.status(500).json({ message: 'Erreur serveur', error });
    }
};

export const login = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user || !(await user.comparePassword(password))) {
            return res.status(401).json({ message: 'Email ou mot de passe incorrect' });
        }

        if (!user.isVerified) {
            return res.status(401).json({
                message: 'Veuillez vérifier votre email avant de vous connecter.',
                isUnverified: true
            });
        }

        const accessToken = jwt.sign({ userId: user._id, role: user.role }, JWT_SECRET, { expiresIn: '15m' });
        const refreshToken = jwt.sign({ userId: user._id }, JWT_REFRESH_SECRET, { expiresIn: '7d' });

        res.status(200).json({
            message: 'Connexion réussie',
            user: { id: user._id, name: user.name, email: user.email, role: user.role },
            accessToken,
            refreshToken
        });
    } catch (error) {
        res.status(500).json({ message: 'Erreur serveur', error });
    }
};

export const refreshToken = async (req: Request, res: Response) => {
    try {
        const { refreshToken } = req.body;

        if (!refreshToken) {
            return res.status(401).json({ message: 'Refresh token manquant' });
        }

        const decoded: any = jwt.verify(refreshToken, JWT_REFRESH_SECRET);
        const user = await User.findById(decoded.userId);

        if (!user) {
            return res.status(404).json({ message: 'Utilisateur introuvable' });
        }

        const newAccessToken = jwt.sign({ userId: user._id, role: user.role }, JWT_SECRET, { expiresIn: '15m' });

        res.status(200).json({ accessToken: newAccessToken });
    } catch (error) {
        res.status(401).json({ message: 'Token invalide ou expiré' });
    }
};

export const getProfile = async (req: any, res: Response) => {
    try {
        const user = await User.findById(req.user?.userId).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'Utilisateur introuvable' });
        }
        res.status(200).json({ user });
    } catch (error) {
        res.status(500).json({ message: 'Erreur serveur', error });
    }
};

export const updateProfile = async (req: any, res: Response) => {
    try {
        const { name, phone, address } = req.body;

        const user = await User.findByIdAndUpdate(
            req.user?.userId,
            { name, phone, address },
            { new: true, runValidators: true }
        ).select('-password');

        if (!user) {
            return res.status(404).json({ message: 'Utilisateur introuvable' });
        }

        res.status(200).json({ message: 'Profil mis à jour', user });
    } catch (error) {
        res.status(500).json({ message: 'Erreur serveur', error });
    }
};

export const verifyEmail = async (req: Request, res: Response) => {
    try {
        const { token } = req.params;

        const user = await User.findOne({ verificationToken: token });
        if (!user) {
            return res.status(400).json({ message: 'Token de vérification invalide ou expiré' });
        }

        user.isVerified = true;
        user.verificationToken = undefined;
        await user.save();

        res.status(200).json({ message: 'Email vérifié avec succès. Vous pouvez maintenant vous connecter.' });
    } catch (error) {
        res.status(500).json({ message: 'Erreur serveur', error });
    }
};

export const resendVerificationEmail = async (req: Request, res: Response) => {
    try {
        const { email } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'Utilisateur introuvable' });
        }

        if (user.isVerified) {
            return res.status(400).json({ message: 'Cet email est déjà vérifié' });
        }

        // Générer un nouveau token
        const verificationToken = crypto.randomBytes(32).toString('hex');
        user.verificationToken = verificationToken;
        await user.save();

        await sendVerificationEmail(user.email, verificationToken);

        res.status(200).json({ message: 'Email de vérification renvoyé avec succès.' });
    } catch (error) {
        res.status(500).json({ message: 'Erreur serveur', error });
    }
};