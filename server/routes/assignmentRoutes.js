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
    
    console.log('POST /assignments - Request:', { giverCode, receiverCode });
    
    if (!giverCode || !receiverCode) {
      return res.status(400).json({ error: 'Giver code and receiver code are required' });
    }

    const giverCodeUpper = giverCode.toUpperCase().trim();
    const receiverCodeUpper = receiverCode.toUpperCase().trim();
    
    console.log('POST /assignments - Normalized codes:', { giverCodeUpper, receiverCodeUpper });

    // CRITICAL: Check ONLY if they're already a GIVER (not a receiver)
    // An employee CAN be a receiver AND a giver - being a receiver does NOT block them from becoming a giver
    // Example: INUNITYFE106 received from INUNITYFE119, but INUNITYFE106 can still spin and become a giver to someone else
    const existingAssignmentAsGiver = await Assignment.findOne({ giverCode: giverCodeUpper });
    console.log('POST /assignments - Checking if already a GIVER:', existingAssignmentAsGiver ? `YES - already giver to ${existingAssignmentAsGiver.receiverCode}` : 'NO - can become a giver');
    
    // Check if they're a receiver (for logging ONLY - this does NOT block them)
    const isReceiver = await Assignment.findOne({ receiverCode: giverCodeUpper });
    if (isReceiver) {
      console.log('POST /assignments - NOTE: This employee is also a RECEIVER (received from', isReceiver.giverCode, ') - but this does NOT prevent them from becoming a giver!');
    }
    
    // ONLY block if they're already a giver
    if (existingAssignmentAsGiver) {
      console.log('POST /assignments - Employee is already a giver, returning existing assignment');
      return res.status(200).json({
        message: 'Employee already has an assignment as a giver. Returning existing assignment.',
        assignment: {
          giverCode: existingAssignmentAsGiver.giverCode,
          giverName: existingAssignmentAsGiver.giverName,
          receiverCode: existingAssignmentAsGiver.receiverCode,
          receiverName: existingAssignmentAsGiver.receiverName
        }
      });
    }
    
    // If we reach here, they're NOT a giver yet, so they can become one (even if they're a receiver)
    console.log('POST /assignments - Employee can become a giver. Proceeding with assignment creation...');

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
    console.log('POST /assignments - Receiver assignment check:', receiverAssigned ? 'Already assigned' : 'Available');
    if (receiverAssigned) {
      console.log('POST /assignments - Returning error: receiver already assigned to', receiverAssigned.giverCode);
      return res.status(400).json({ 
        error: `This person (${receiverCodeUpper}) has already been assigned as a receiver to someone else. Please try spinning again to get a different person.`,
        receiverCode: receiverCodeUpper
      });
    }

    const assignment = new Assignment({
      giverCode: giverCodeUpper,
      receiverCode: receiverCodeUpper,
      giverName: giver.name,
      receiverName: receiver.name,
    });
    
    // Save assignment, handling duplicate key errors
    console.log('POST /assignments - Attempting to save assignment:', {
      giverCode: giverCodeUpper,
      receiverCode: receiverCodeUpper
    });
    
    try {
      await assignment.save();
      console.log('POST /assignments - Assignment saved successfully');
    } catch (error) {
      console.error('POST /assignments - Save error:', error);
      console.error('POST /assignments - Error code:', error.code);
      console.error('POST /assignments - Error message:', error.message);
      console.error('POST /assignments - Error name:', error.name);
      
      // Handle duplicate key errors (MongoDB error code 11000)
      if (error.code === 11000) {
        console.log('POST /assignments - Duplicate key error detected');
        // Check if it's the legacy giver_1 index
        if (typeof error.message === 'string' && error.message.includes('giver_1 dup key')) {
          console.log('POST /assignments - Legacy giver_1 index detected, dropping and retrying');
          try {
            await Assignment.collection.dropIndex('giver_1');
            await assignment.save();
            console.log('POST /assignments - Assignment saved after dropping legacy index');
          } catch (innerErr) {
            console.error('POST /assignments - Error after dropping index:', innerErr);
            return res.status(500).json({ error: innerErr.message });
          }
        } else {
          // Duplicate giverCode - race condition: employee got an assignment between our check and save
          console.log('POST /assignments - Duplicate giverCode detected, fetching existing assignment');
          const raceConditionAssignment = await Assignment.findOne({ giverCode: giverCodeUpper });
          if (raceConditionAssignment) {
            console.log('POST /assignments - Returning existing assignment due to race condition');
            return res.status(200).json({
              message: 'Employee already has an assignment. Returning existing assignment.',
              assignment: {
                giverCode: raceConditionAssignment.giverCode,
                giverName: raceConditionAssignment.giverName,
                receiverCode: raceConditionAssignment.receiverCode,
                receiverName: raceConditionAssignment.receiverName
              }
            });
          }
          console.log('POST /assignments - No existing assignment found, returning error');
          return res.status(400).json({ 
            error: 'This person already has an assignment'
          });
        }
      } else {
        // Any other error
        console.error('POST /assignments - Unexpected error type:', error);
        return res.status(500).json({ error: error.message });
      }
    }

    console.log('POST /assignments - Assignment saved successfully:', {
      giverCode: assignment.giverCode,
      receiverCode: assignment.receiverCode
    });
    
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
    console.error('POST /assignments - Unexpected error:', error);
    console.error('POST /assignments - Error stack:', error.stack);
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
    
    // Check if this employee code has an assignment as a giver
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
    
    console.log('GET /available - Request for giver:', giverCodeUpper);
    
    // Get all employees
    const allEmployees = await Employee.find();
    console.log('GET /available - Total employees:', allEmployees.length);
    
    // Get all assigned receivers (normalize to uppercase for case-insensitive comparison)
    const assignments = await Assignment.find();
    const assignedReceiverCodes = assignments.map(a => a.receiverCode.toUpperCase().trim());
    console.log('GET /available - Assigned receivers:', assignedReceiverCodes);
    
    // Check if this giver is already a receiver (they can still be a giver)
    const isGiverAlsoReceiver = assignedReceiverCodes.includes(giverCodeUpper);
    console.log('GET /available - Is giver also a receiver?', isGiverAlsoReceiver);
    
    // Get available receivers (not the giver and not already assigned as receivers)
    // Note: An employee can be a receiver AND a giver, but cannot be assigned as a receiver twice
    // Circular assignments are allowed (TCE1 → TCE3 and TCE3 → TCE1 is valid)
    const availableReceivers = allEmployees
      .filter(emp => {
        const empCodeUpper = emp.employeeCode.toUpperCase().trim();
        const isNotGiver = empCodeUpper !== giverCodeUpper;
        const isNotAlreadyReceiver = !assignedReceiverCodes.includes(empCodeUpper);
        return isNotGiver && isNotAlreadyReceiver;
      })
      .map(emp => ({
        code: emp.employeeCode,
        name: emp.name
      }));
    
    console.log('GET /available - Available receivers count:', availableReceivers.length);
    console.log('GET /available - Available receivers:', availableReceivers.map(r => r.code));
    
    res.json(availableReceivers);
  } catch (error) {
    console.error('GET /available - Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Test endpoint to verify employee can become a giver even if they're a receiver
router.get('/test/:employeeCode', async (req, res) => {
  try {
    const { employeeCode } = req.params;
    const employeeCodeUpper = employeeCode.toUpperCase().trim();
    
    const isGiver = await Assignment.findOne({ giverCode: employeeCodeUpper });
    const isReceiver = await Assignment.findOne({ receiverCode: employeeCodeUpper });
    
    res.json({
      employeeCode: employeeCodeUpper,
      isGiver: !!isGiver,
      isReceiver: !!isReceiver,
      canBecomeGiver: !isGiver, // Can become a giver if not already a giver (being a receiver doesn't block)
      giverAssignment: isGiver ? {
        receiverCode: isGiver.receiverCode,
        receiverName: isGiver.receiverName
      } : null,
      receiverAssignment: isReceiver ? {
        giverCode: isReceiver.giverCode,
        giverName: isReceiver.giverName
      } : null
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
