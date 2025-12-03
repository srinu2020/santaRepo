import express from 'express';
import Assignment from '../models/Assignment.js';
import Employee from '../models/Employee.js';

const router = express.Router();

// GET all assignments
router.get('/', async (req, res) => {
  try {
    const assignments = await Assignment.find();
    const pairs = {};
    assignments.forEach(assignment => {
      pairs[assignment.giverCode] = {
        receiverCode: assignment.receiverCode,
        receiverName: assignment.receiverName
      };
    });
    res.json(pairs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST create a new assignment
router.post('/', async (req, res) => {
  try {
    const { giverCode, receiverCode } = req.body;
    
    if (!giverCode || !receiverCode) {
      return res.status(400).json({ error: 'Giver code and receiver code are required' });
    }

    const giverCodeUpper = giverCode.toUpperCase().trim();
    const receiverCodeUpper = receiverCode.toUpperCase().trim();

    // Check if giver already has an assignment
    const existingAssignment = await Assignment.findOne({ giverCode: giverCodeUpper });
    if (existingAssignment) {
      return res.status(400).json({ 
        error: 'This person already has an assignment',
        assignment: { 
          giverCode: existingAssignment.giverCode,
          giverName: existingAssignment.giverName,
          receiverCode: existingAssignment.receiverCode,
          receiverName: existingAssignment.receiverName
        }
      });
    }

    // Check if giver and receiver are valid employees
    const giver = await Employee.findOne({ employeeCode: giverCodeUpper });
    const receiver = await Employee.findOne({ employeeCode: receiverCodeUpper });
    
    if (!giver) {
      return res.status(400).json({ error: 'Giver is not a valid employee' });
    }
    if (!receiver) {
      return res.status(400).json({ error: 'Receiver is not a valid employee' });
    }

    // Check if receiver is already assigned to someone
    const receiverAssigned = await Assignment.findOne({ receiverCode: receiverCodeUpper });
    if (receiverAssigned) {
      return res.status(400).json({ error: 'This receiver has already been assigned' });
    }

    const assignment = new Assignment({
      giverCode: giverCodeUpper,
      receiverCode: receiverCodeUpper,
      giverName: giver.name,
      receiverName: receiver.name,
    });
    
    await assignment.save();
    res.status(201).json({ 
      message: 'Assignment created successfully',
      assignment: { 
        giverCode: assignment.giverCode,
        giverName: assignment.giverName,
        receiverCode: assignment.receiverCode,
        receiverName: assignment.receiverName
      }
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ error: 'This person already has an assignment' });
    }
    res.status(500).json({ error: error.message });
  }
});

// DELETE all assignments (reset)
router.delete('/', async (req, res) => {
  try {
    await Assignment.deleteMany({});
    res.json({ message: 'All assignments reset successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET available receivers for a giver (by code)
router.get('/available/:giverCode', async (req, res) => {
  try {
    const { giverCode } = req.params;
    const giverCodeUpper = giverCode.toUpperCase().trim();
    
    // Get all employees
    const allEmployees = await Employee.find();
    
    // Get all assigned receivers
    const assignments = await Assignment.find();
    const assignedReceiverCodes = assignments.map(a => a.receiverCode);
    
    // Get available receivers (not the giver and not already assigned)
    const availableReceivers = allEmployees
      .filter(emp => 
        emp.employeeCode !== giverCodeUpper && 
        !assignedReceiverCodes.includes(emp.employeeCode)
      )
      .map(emp => ({
        code: emp.employeeCode,
        name: emp.name
      }));
    
    res.json(availableReceivers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
