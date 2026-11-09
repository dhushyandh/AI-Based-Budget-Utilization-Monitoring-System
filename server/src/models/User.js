import mongoose from 'mongoose';
const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 80 },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true },
  phone: { type: String, trim: true, maxlength: 20, default: '' },
  // Base64 data URLs are ~4/3 the binary image size. Allow the encoded
  // representation of the 600 KB avatar upload limit.
  avatarUrl: { type: String, trim: true, maxlength: 900000, default: '' },
  avatarPublicId: { type: String, trim: true, default: '' },
  onboardingCompleted: { type: Boolean, default: false }
}, { timestamps: true });
export default mongoose.model('User', userSchema);
