import { currentUser } from "@clerk/nextjs";
import prisma from "@/lib/prismadb";

export default async function getCurrentUser() {
  try {
    const user = await currentUser();

    if (!user?.id) {
      return null;
    }

    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        name: true,
        email: true,
        stores: {
          select: {
            id: true,
          },
          take: 1,
          orderBy: {
            createdAt: 'desc'
          }
        }
      },
    });

    if (!dbUser) {
      return null;
    }

    return {
      ...dbUser,
      activeStoreId: dbUser.stores[0]?.id || null
    };
  } catch (error) {
    return null;
  }
}

