import { Router } from 'express';
import auth from '../middleware/auth.js';
import User from '../models/User.js';

const router = Router();
router.use(auth);

router.get('/', async (req, res, next) => {
  try {
    const user = await User.findById(req.userId).select('name email phone avatarUrl onboardingCompleted createdAt');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ user });
  } catch (error) { next(error); }
});

router.patch('/', async (req, res, next) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (req.body.name !== undefined) {
      const name = String(req.body.name).trim();
      if (name.length < 2 || name.length > 80) return res.status(400).json({ message: 'Name must be between 2 and 80 characters' });
      user.name = name;
    }
    if (req.body.phone !== undefined) {
      const phone = String(req.body.phone).trim();
      if (phone && !/^\\+?[0-9 ()-]{7,20}$/.test(phone)) return res.status(400).json({ message: 'Enter a valid phone number' });
      user.phone = phone;
    }
    if (req.body.avatarUrl !== undefined) {
      const avatarUrl = String(req.body.avatarUrl).trim();
      if (avatarUrl && (!/^https:\\/\\//i.test(avatarUrl) || avatarUrl.length > 500)) return res.status(400).json({ message: 'Avatar must be a secure https URL' });
      user.avatarUrl = avatarUrl;
    }
    if (req.body.onboardingCompleted === true) user.onboardingCompleted = true;
    await user.save();
    res.json({ user: { id: user._id, name: user.name, email: user.email, phone: user.phone, avatarUrl: user.avatarUrl, onboardingCompleted: user.onboardingCompleted } });
  } catch (error) { next(error); }
});

export default router;
