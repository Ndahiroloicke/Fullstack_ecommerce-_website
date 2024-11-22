import prisma from "@/lib/prismadb";
import { auth } from "@clerk/nextjs";
import { redirect } from "next/navigation";

interface DashboardPageProps {
    params: Promise<{
        storeId: string
    }>;
}
const DashboardPage = async ({
    params
}: DashboardPageProps) => {
    // Check authentication
    const { userId } = auth();
    
    if (!userId) {
        redirect('/sign-in');
    }

    // Await the params before destructuring
    const resolvedParams = await params;
    const { storeId } = resolvedParams;
    
    const store = await prisma.store.findFirst({
        where: {
            id: storeId
        }
    });

    return (
        <div>Active Store: {store?.name}</div>
    );
}

export default DashboardPage;