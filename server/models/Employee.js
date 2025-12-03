import mongoose from 'mongoose';

const employeeSchema = new mongoose.Schema({
  employeeCode: {
    type: String,
    required: true,
    trim: true,
    unique: true,
    uppercase: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
}, {
  timestamps: true,
});

const Employee = mongoose.model('Employee', employeeSchema);

export default Employee;

