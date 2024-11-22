'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from "lucide-react";
import { useClerk } from '@clerk/nextjs';

export default function AuthCallback() {
    const router = useRouter();
    const { user } = useClerk();

    useEffect(() => {
        const initializeUser = async () => {
            try {
                // First try to get the user's active store
                const response = await fetch('/api/stores/active');
                const data = await response.json();

                if (data.storeId) {
                    // If user has an active store, redirect to it
                    router.replace(`/${data.storeId}`);
                } else {
                    // If no active store, redirect to stores page
                    router.replace('/stores');
                }
            } catch (error) {
                // If any error, redirect to stores page
                router.replace('/stores');
            }
        };

        const timer = setTimeout(() => {
            initializeUser();
        }, 1000);

        return () => clearTimeout(timer);
    }, [router, user]);

    return (
        <div className="w-full h-full flex items-center justify-center">
            <div className="flex flex-col items-center gap-2">
                <Loader2 className="h-8 w-8 animate-spin text-zinc-800" />
                <h3 className="font-semibold text-xl">Setting up your account...</h3>
                <p>You will be redirected automatically.</p>
            </div>
        </div>
    );
} 