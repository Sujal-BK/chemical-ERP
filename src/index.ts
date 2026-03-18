import express from 'express';
import dotenv from 'dotenv';
import helmet from 'helmet';
import { clerkMiddleware } from '@clerk/express';
import { clerkAuth, syncUser } from './middlewares/auth';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(helmet());
app.use(express.json());
app.use(clerkMiddleware()); // Attach Clerk auth context to all requests

// Public route
app.get('/', (_req, res) => {
  res.json({ message: 'ERP API is running' });
});

// Protected route example
app.get('/me', clerkAuth, syncUser, (req, res) => {
  res.json({ user: req.user });
});

// TODO: mount ERP routes here with clerkAuth + syncUser middleware

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
