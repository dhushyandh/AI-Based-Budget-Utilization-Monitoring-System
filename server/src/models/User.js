import mongoose from 'mongoose';
const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 80 },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true },
  phone: { type: String, trim: true, maxlength: 20, default: '' },
  avatarUrl: { type: String, trim: true, maxlength: 500, default: '' },
  onboardingCompleted: { type: Boolean, default: false }
}, { timestamps: true });
export default mongoose.model('User', userSchema);
