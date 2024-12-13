import { auth } from "@clerk/nextjs";
import prisma from "@/lib/prismadb";
import { redirect } from "next/navigation";

interface DashboardPageProps {
    params: { storeId: string }
}

const DashboardPage: React.FC<DashboardPageProps> = async ({ params }) => {
    try {
        const { userId } = await auth();

        if (!userId) {
            return redirect('/signIn');
        }

        const store = await prisma.store.findFirst({
            where: {
                id: params.storeId
            }
        });

        if (!store) {
            return <div>Store not found.</div>;
        }

        return (
            <div>
                <h1>Active Store: {store.name}</h1>
                {/* Add more dashboard content here as needed */}
            </div>
        );

    } catch (error) {
        console.error('Authentication error:', error);
        return redirect('/signIn');
    }
}

export default DashboardPage;