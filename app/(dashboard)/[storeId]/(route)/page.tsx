import { headers } from 'next/headers';
import { auth } from "@clerk/nextjs";
import { redirect } from "next/navigation";

interface DashboardPageProps {
    params: { storeId: string }
}

const DashboardPage = async ({ 
    params 
}: DashboardPageProps) => {
    // Initialize headers first
    headers();
    
    try {
        const { userId } = await auth();

        if (!userId) {
            return redirect('/signin');
        }

        return (
            <div>
                {/* Your JSX */}
            </div>
        );
    } catch (error) {
        return redirect('/signin');
    }
}

export default DashboardPage;