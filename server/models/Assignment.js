import mongoose from 'mongoose';

const assignmentSchema = new mongoose.Schema({
  giverCode: {
    type: String,
    required: true,
    trim: true,
    uppercase: true,
  },
  receiverCode: {
    type: String,
    required: true,
    trim: true,
    uppercase: true,
  },
  giverName: {
    type: String,
    required: true,
    trim: true,
  },
  receiverName: {
    type: String,
    required: true,
    trim: true,
  },
}, {
  timestamps: true,
});

// Ensure unique giver assignments
assignmentSchema.index({ giverCode: 1 }, { unique: true });

const Assignment = mongoose.model('Assignment', assignmentSchema);

export default Assignment;

