import mongoose from '@/database';
import bcrypt from 'bcryptjs';
import { mongo } from 'mongoose';

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    unique: true,
    required: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
    select: false,
  },
  passwordResetToken: {
    type: String,
    select: false,
  },
  passwordResetTokenExpiration: {
    type: Date,
    select: false,
  },
  Curso: {
    type: String,
    required: false,
    default: '',
  },
  administrador: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

UserSchema.pre('save', function (next) {
  bcrypt
    .hash(this.password, 10)
    .then((hash) => {
      this.password = hash;
      next();
    })
    .catch((error) => {
      console.error('Error hashing password', error);
    });
});

export default mongoose.model('User', UserSchema);
