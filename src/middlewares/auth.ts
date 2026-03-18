import { Request, Response, NextFunction } from 'express';
import { clerkClient, requireAuth, getAuth } from '@clerk/express';
import prisma from '../utils/prisma';

// Step 1: Verify JWT with Clerk
export const clerkAuth = requireAuth();

// Step 2: Sync Clerk user with DB and attach to req
export const syncUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId: clerkId } = getAuth(req);

    if (!clerkId) {
      res.status(401).json({ 
        success : false,
        message: 'Unauthorized' 
      });
      return;
    }

    // Find user in DB
    let user = await prisma.user.findUnique({ where: { clerkId } });

    // First time login — fetch from Clerk and create in DB
    if (!user) {
      const clerkUser = await clerkClient.users.getUser(clerkId);
      const email = clerkUser.emailAddresses[0]?.emailAddress ?? '';
      const name = `${clerkUser.firstName ?? ''} ${clerkUser.lastName ?? ''}`.trim();

      user = await prisma.user.create({
        data: { clerkId, email, name },
      });
    }

    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};
