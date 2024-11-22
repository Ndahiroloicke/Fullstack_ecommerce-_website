import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";
import prisma from "@/lib/prismadb";

export async function GET() {
    try {
        const { userId } = auth();

        if (!userId) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        // Get the user's most recent store
        const store = await prisma.store.findFirst({
            where: {
                userId
            },
            orderBy: {
                createdAt: 'desc'
            },
            select: {
                id: true
            }
        });

        return NextResponse.json({ storeId: store?.id || null });
    } catch (error) {
        console.log('[STORES_GET]', error);
        return new NextResponse("Internal error", { status: 500 });
    }
} 