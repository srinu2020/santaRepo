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

    // NEW RULE:
    // If an employee code has already been used as a RECEIVER,
    // they are not allowed to act as a GIVER at all.
    //
    // This prevents the flow:
    //  - You (TCE062) spin and get colleague TCE010
    //  - Then you try to "log in" as TCE010 and spin again
    const giverAlreadyReceiver = await Assignment.findOne({ receiverCode: giverCodeUpper });
    if (giverAlreadyReceiver) {
      return res.status(400).json({
        error: 'This employee has already been assigned a Secret Santa and cannot assign again using this code.',
      });
    }

    // Check if giver already has an assignment
    const existingAssignment = await Assignment.findOne({ giverCode: giverCodeUpper });
    if (existingAssignment) {
      // Instead of error, just return existing assignment
      return res.status(200).json({
        message: 'Employee already has an assignment. Returning existing assignment.',
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
    
    // Save assignment, handling legacy duplicate index on old "giver" field (giver_1)
    try {
      await assignment.save();
    } catch (error) {
      // If we hit a duplicate key on legacy index giver_1 (giver: null), drop that index and retry once
      if (error.code === 11000 && typeof error.message === 'string' && error.message.includes('giver_1 dup key')) {
        try {
          await Assignment.collection.dropIndex('giver_1');
          await assignment.save();
        } catch (innerErr) {
          return res.status(500).json({ error: innerErr.message });
        }
      } else {
        return res.status(500).json({ error: error.message });
      }
    }

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

// GET assignment by employee code
router.get('/by-code/:employeeCode', async (req, res) => {
  try {
    const { employeeCode } = req.params;
    const employeeCodeUpper = employeeCode.toUpperCase().trim();
    
    const assignment = await Assignment.findOne({ giverCode: employeeCodeUpper });
    
    if (!assignment) {
      return res.status(404).json({ 
        error: 'No assignment found for this employee code',
        hasAssignment: false
      });
    }
    
    res.json({
      hasAssignment: true,
      assignment: {
        giverCode: assignment.giverCode,
        giverName: assignment.giverName,
        receiverCode: assignment.receiverCode,
        receiverName: assignment.receiverName
      }
    });
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
    // Note: Circular assignments are allowed (TCE1 → TCE3 and TCE3 → TCE1 is valid)
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
