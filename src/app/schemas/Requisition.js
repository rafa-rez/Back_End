import mongoose from '@/database';
import { mongo } from 'mongoose';

const RequisitionSchema = new mongoose.Schema({
  requisitor: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    unique: true,
    required: true,
    lowercase: true,
  },
  description: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

RequisitionSchema.pre('save', function (next) {
  const title = this.title;
  next();
});

export default mongoose.model('Requisition', RequisitionSchema);
