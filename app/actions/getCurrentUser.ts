import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prismadb";

export default async function getCurrentUser() {
  try {
    // Get the authenticated session from Clerk
    const { userId } = await auth();

    // Check if user is authenticated
    if (!userId) {
      return null;
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: {
        id: userId
      }
    });

    if (!user) {
      return null;
    }

    return user;
  } catch (error) {
    return null;
  }
}

