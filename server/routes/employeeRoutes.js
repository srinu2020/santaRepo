import express from 'express';
import Employee from '../models/Employee.js';

const router = express.Router();

// GET all employees
router.get('/', async (req, res) => {
  try {
    const employees = await Employee.find().sort({ name: 1 });
    res.json(employees.map(emp => ({
      code: emp.employeeCode,
      name: emp.name
    })));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET employee by code (case-insensitive)
router.get('/code/:code', async (req, res) => {
  try {
    const { code } = req.params;
    const employee = await Employee.findOne({ 
      employeeCode: code.toUpperCase().trim() 
    });
    
    if (!employee) {
      return res.status(404).json({ error: 'Employee not found' });
    }
    
    res.json({ code: employee.employeeCode, name: employee.name });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST create a new employee
router.post('/', async (req, res) => {
  try {
    const { employeeCode, name } = req.body;
    
    if (!employeeCode || !employeeCode.trim()) {
      return res.status(400).json({ error: 'Employee code is required' });
    }
    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Employee name is required' });
    }

    const employee = new Employee({ 
      employeeCode: employeeCode.toUpperCase().trim(),
      name: name.trim() 
    });
    await employee.save();
    res.status(201).json({ 
      message: 'Employee added successfully', 
      code: employee.employeeCode,
      name: employee.name 
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ error: 'Employee code already exists' });
    }
    res.status(500).json({ error: error.message });
  }
});

// DELETE an employee by code
router.delete('/:code', async (req, res) => {
  try {
    const { code } = req.params;
    const employee = await Employee.findOneAndDelete({ 
      employeeCode: code.toUpperCase().trim() 
    });
    
    if (!employee) {
      return res.status(404).json({ error: 'Employee not found' });
    }
    
    res.json({ message: 'Employee deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
