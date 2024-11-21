import prisma from "@/lib/prismadb";

interface DashboardPageProps {
    params: Promise<{
        storeId: string
    }>;
}

const DashboardPage = async ({
    params
}: DashboardPageProps) => {
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