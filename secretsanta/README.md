# 🎅 Secret Santa App

A full-stack React application for managing office Secret Santa gift exchanges. Employees can enter their name and get randomly assigned someone to gift, with automatic duplicate prevention. The app uses Node.js, Express, and MongoDB for the backend.

## Features

- ✅ Employee list stored in MongoDB database
- ✅ Random assignment when an employee enters their name
- ✅ Automatic duplicate prevention (each person can only be assigned once)
- ✅ Progress tracking (shows how many assignments have been made)
- ✅ Database persistence (assignments saved in MongoDB)
- ✅ RESTful API for managing employees and assignments
- ✅ Beautiful, modern UI with gradient design
- ✅ Mobile responsive

## Architecture

- **Frontend**: React 18 + Vite
- **Backend**: Node.js + Express
- **Database**: MongoDB
- **API**: RESTful API with endpoints for employees and assignments

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- MongoDB (local installation or MongoDB Atlas account)

## Getting Started

### 1. Backend Setup

1. Navigate to the server directory:
```bash
cd server
```

2. Install backend dependencies:
```bash
npm install
```

3. Create a `.env` file in the `server` directory:
```bash
PORT=3001
MONGODB_URI=mongodb://localhost:27017/secret-santa
```

   For MongoDB Atlas, use:
```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/secret-santa
```

4. Make sure MongoDB is running (if using local MongoDB):
```bash
# On macOS with Homebrew
brew services start mongodb-community

# On Linux
sudo systemctl start mongod

# Or run MongoDB manually
mongod
```

5. Seed initial employee data (optional):
```bash
node scripts/seedEmployees.js
```

6. Start the backend server:
```bash
npm run dev
```

   Or for production:
```bash
npm start
```

The backend API will be running on `http://localhost:3001`

### 2. Frontend Setup

1. Navigate to the root directory (if not already there):
```bash
cd ..
```

2. Install frontend dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory (optional, defaults to localhost:3001):
```bash
VITE_API_URL=http://localhost:3001/api
```

4. Start the frontend development server:
```bash
npm run dev
```

5. Open your browser and navigate to `http://localhost:5173`

### 3. Running Both Servers

You'll need to run both the backend and frontend servers:

**Terminal 1 (Backend):**
```bash
cd server
npm run dev
```

**Terminal 2 (Frontend):**
```bash
npm run dev
```

## API Endpoints

### Employees
- `GET /api/employees` - Get all employees
- `POST /api/employees` - Create a new employee
- `PUT /api/employees/:oldName` - Update an employee name
- `DELETE /api/employees/:name` - Delete an employee

### Assignments
- `GET /api/assignments` - Get all assignments
- `POST /api/assignments` - Create a new assignment
- `DELETE /api/assignments` - Reset all assignments
- `GET /api/assignments/available/:giverName` - Get available receivers for a giver

### Health Check
- `GET /api/health` - Check if API is running

## How to Use

1. **Setup**: Add employees to the database using the API or seed script
2. **Pick Secret Santa**: When an employee is ready, they enter their name and click "Spin the Wheel!"
3. **Get Assignment**: The app will randomly assign them someone who hasn't been assigned yet
4. **No Duplicates**: Once a name is assigned, it won't appear again for other employees
5. **Reset**: Use "Reset All Assignments" to start over (useful for testing or next year)

## Managing Employees

### Using the Seed Script

Edit `server/scripts/seedEmployees.js` to update the employee list, then run:
```bash
cd server
node scripts/seedEmployees.js
```

### Using the API

You can use tools like Postman, curl, or the browser console to manage employees:

**Add an employee:**
```bash
curl -X POST http://localhost:3001/api/employees \
  -H "Content-Type: application/json" \
  -d '{"name": "John Doe"}'
```

**Get all employees:**
```bash
curl http://localhost:3001/api/employees
```

**Delete an employee:**
```bash
curl -X DELETE http://localhost:3001/api/employees/John%20Doe
```

## Building for Production

### Frontend
```bash
npm run build
```
The built files will be in the `dist` directory.

### Backend
```bash
cd server
npm start
```

## Project Structure

```
secretsanta/
├── server/                 # Backend
│   ├── config/            # Database configuration
│   ├── models/            # MongoDB models
│   ├── routes/            # API routes
│   ├── scripts/           # Utility scripts (seed, etc.)
│   ├── server.js          # Express server entry point
│   └── package.json       # Backend dependencies
├── src/                   # Frontend
│   ├── services/          # API service layer
│   ├── App.jsx            # Main React component
│   └── ...
└── package.json           # Frontend dependencies
```

## Notes

- Employee list is stored in MongoDB and fetched from the backend
- All assignments are stored in MongoDB
- Each person can only pick once (their assignment is saved in the database)
- The app ensures no one gets assigned to themselves
- Name matching is case-insensitive (e.g., "john doe" matches "John Doe")
- Progress is tracked so you can see how many assignments remain

## Technologies Used

### Frontend
- React 18
- Vite
- Axios
- CSS3 (with gradients and animations)

### Backend
- Node.js
- Express
- MongoDB / Mongoose
- CORS
- dotenv

## Troubleshooting

### Backend won't start
- Make sure MongoDB is running
- Check that the `MONGODB_URI` in `.env` is correct
- Ensure port 3001 is not already in use

### Frontend can't connect to backend
- Verify the backend is running on port 3001
- Check the `VITE_API_URL` in the frontend `.env` file
- Ensure CORS is enabled (it should be by default)

### Database connection issues
- Verify MongoDB is running
- Check your connection string
- For MongoDB Atlas, ensure your IP is whitelisted
