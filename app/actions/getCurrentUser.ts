import { auth } from "@clerk/nextjs";
import prisma from "@/lib/prismadb";

export default async function getCurrentUser() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return null;
    }

    const user = await prisma.user.findUnique({
      where: {
        clerkId: userId
      }
    });

    return user;
  } catch (error) {
    return null;
  }
}

