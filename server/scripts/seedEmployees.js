import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Employee from '../models/Employee.js';

dotenv.config();

const employees = [
  { code: 'InunityFE001', name: 'Johnson Tellis' },
  { code: 'InunityFE002', name: 'Gautham Nayak' },
  { code: 'InunityFE003', name: 'Preetham Kulal' },
  { code: 'InunityFE004', name: 'Sujay Shetty' },
  { code: 'InunityFE018', name: 'Hemanth S Rao' },
  { code: 'InunityFE019', name: 'Srajan' },
  { code: 'InunityFE028', name: 'Ashwini Tirkey' },
  { code: 'InunityFE030', name: 'Sushmitha M K' },
  { code: 'InunityFE034', name: 'Sayooj MK' },
  { code: 'InunityFE052', name: 'Ananya Bangera' },
  { code: 'InunityFE053', name: 'Soumya Shetty' },
  { code: 'InunityFE054', name: 'Vaishnavi H' },
  { code: 'InunityFE072', name: 'Harshith Kumar TS' },
  { code: 'InunityFE082', name: 'Karthik S Rai' },
  { code: 'InunityFE085', name: 'Pulkit Saxena' },
  { code: 'InUnityFE093', name: 'Arjun P' },
  { code: 'InUnityFE097', name: 'Somesh Hotkar' },
  { code: 'InUnityFE098', name: 'Imran Mohammed' },
  { code: 'InUnityFE100', name: 'Rishabh Kamath' },
  { code: 'InUnityFE103', name: 'Uday Bhargav' },
  { code: 'InUnityFE106', name: 'Sathwik Shetty N' },
  { code: 'InUnityFE107', name: 'Defnel Alison Dsouza' },
  { code: 'InUnityFE108', name: 'Nikhil U Kundar' },
  { code: 'InUnityFE110', name: 'Tejas Nayak B' },
  { code: 'InUnityFE112', name: 'ABHISHEK P' },
  { code: 'InUnityFE113', name: 'KEERTHANA S' },
  { code: 'InUnityFE114', name: 'Jithesh RD' },
  { code: 'InUnityFE115', name: 'K B Chandrashekaran' },
  { code: 'InUnityFE116', name: 'Umesh VP' },
  { code: 'InUnityFE117', name: 'Shency Jose' },
  { code: 'InUnityFE118', name: 'Anubhav S' },
  { code: 'InUnityFE119', name: 'Shalvian John Dsouza' },
  { code: 'InUnityFE120', name: 'Shashikiran' },
  { code: 'InUnityFE121', name: 'Shreesha S Shetty' },
  { code: 'InUnityFE122', name: 'Jones Dharmaraj J' },
  { code: 'InUnityFE123', name: 'Subramanya K' },
  { code: 'InUnityFE124', name: 'Chaithanya H Rao' },
  { code: 'InUnityFE125', name: 'Ashokananda S' },
  { code: 'InUnityFE126', name: 'Donthu Naga Siva Sai Ravikanth' },
  { code: 'InUnityFE127', name: 'G Pavan Kalyan' },
  { code: 'TCEFE005', name: 'Sushma' },
  { code: 'TCEFE037', name: 'Sushma KS' },
  { code: 'TCEFE051', name: 'Vinutha' },
  { code: 'TCEFE046', name: 'Lavanya' },
  { code: 'TCEFE027', name: 'Abhinaya' },
  { code: 'TCEFE021', name: 'Prajwal' },
  { code: 'TCEFE047', name: 'Kashi Sharma' },
  { code: 'TCEFE052', name: 'Akhiljith Gigi' },
  { code: 'TCEFE055', name: 'Jason D\'Silva' },
  { code: 'TCEFE054', name: 'Sonika Shetty' },
  { code: 'TCEFE057', name: 'Tushar Bangera' },
  { code: 'TCEFE058', name: 'Vipula B' },
  { code: 'TCEFE059', name: 'Dhanush B D' },
  { code: 'TCEFE061', name: 'Rushikesh Suryakant Rajulwar' },
  { code: 'TCEFE062', name: 'Pawar Srinivas Naik' },
  { code: 'TCEFE063', name: 'Vineeth Rai K' },
  { code: 'TCEFE064', name: 'Pulkit Garg' },
  { code: 'TCEFE065', name: 'Shreyas KM' },
  { code: 'TCEFE066', name: 'Melvita Menezes' },
  { code: 'C001', name: 'Akshay Kumar U' }
];

const seedEmployees = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://localhost:27017/secret-santa');
    console.log('Connected to MongoDB');

    // Clear existing employees
    await Employee.deleteMany({});
    console.log('Cleared existing employees');

    // Insert new employees
    const employeeDocs = employees.map(emp => ({ 
      employeeCode: emp.code.toUpperCase(), 
      name: emp.name 
    }));
    await Employee.insertMany(employeeDocs);
    console.log(`Seeded ${employees.length} employees`);

    process.exit(0);
  } catch (error) {
    console.error('Error seeding employees:', error);
    process.exit(1);
  }
};

seedEmployees();

