# Quick Setup Guide

## Step 1: Install MongoDB

### macOS (using Homebrew)
```bash
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community
```

### Linux (Ubuntu/Debian)
```bash
sudo apt-get install -y mongodb
sudo systemctl start mongod
```

### Windows
Download and install from [MongoDB Download Center](https://www.mongodb.com/try/download/community)

### Or use MongoDB Atlas (Cloud)
1. Sign up at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free cluster
3. Get your connection string

## Step 2: Backend Setup

```bash
cd server
npm install
```

Create `server/.env`:
```
PORT=3001
MONGODB_URI=mongodb://localhost:27017/secret-santa
```

Or for MongoDB Atlas:
```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/secret-santa
```

Seed initial employees:
```bash
npm run seed
```

Start backend:
```bash
npm run dev
```

## Step 3: Frontend Setup

```bash
# From root directory
npm install
```

Create `.env` (optional, defaults to localhost:3001):
```
VITE_API_URL=http://localhost:3001/api
```

Start frontend:
```bash
npm run dev
```

## Step 4: Access the App

Open http://localhost:5173 in your browser

## Troubleshooting

- **MongoDB connection error**: Make sure MongoDB is running
- **Port already in use**: Change PORT in server/.env
- **CORS errors**: Backend has CORS enabled by default
- **API not found**: Check that backend is running on port 3001

