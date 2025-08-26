import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  uid: { type: String, required: true, unique: true },
  username: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true },
  institution: { type: String, default: '' }
}, {
  timestamps: true
});

export default mongoose.model('User', userSchema);