import { redirect } from 'next/navigation';
import { auth } from "@clerk/nextjs";

//Local imports
import Navbar from '@/components/navbar'
import prisma from '@/lib/prismadb';
import getCurrentUser from '@/app/actions/getCurrentUser';

export default async function DashboardLayout({
    children,
    params
}: {
    children: React.ReactNode
    params: { storeId: string }
}) {
    console.log("Starting DashboardLayout");
    
    try {
        //get current User details
        const currentUser = await getCurrentUser();
        console.log("CurrentUser:", currentUser);
        
        const { userId } = await auth();
        console.log("UserId:", userId);

        if (!currentUser || !userId) {
            console.log("No user found, redirecting to signin");
            redirect('/signIn');
        }

        const store = await prisma.store.findFirst({
            where: {
                id: params.storeId,
                userId: userId,
            }
        });
        console.log("Store found:", store);

        if (!store) {
            console.log("No store found, redirecting to stores");
            redirect('/stores');
        }

        return (
            <>
                <Navbar currentUser={currentUser}/>
                {children}
            </>
        );
    } catch (error) {
        console.error("Error in DashboardLayout:", error);
        throw error;
    }
};
//1:52