import { redirect } from 'next/navigation';
import { auth } from "@clerk/nextjs";

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
    const { userId } = await auth();
    
    if (!userId) {
        return redirect('/signin');
    }

    const currentUser = await getCurrentUser();
    if (!currentUser) {
        return redirect('/signin');
    }

    const store = await prisma.store.findFirst({
        where: {
            id: params.storeId,
            userId: userId,
        }
    });

    if (!store) {
        return redirect('/stores');
    }

    return (
        <>
            <Navbar currentUser={currentUser}/>
            {children}
        </>
    );
}