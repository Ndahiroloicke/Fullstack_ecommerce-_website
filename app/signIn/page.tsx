'use client'

import { FcGoogle } from "react-icons/fc";
import { useSignIn, useSignUp, useClerk } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { useCallback, useState, useMemo, useEffect } from 'react';
import * as z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { SignInResource } from '@clerk/types';
import { currentUser } from "@clerk/nextjs";
import { redirect } from "next/navigation";

import { Button } from '@/components/ui/button'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

type Variant = 'LOGIN' | 'REGISTER';

// Move schemas outside component
const registerSchema = z.object({
    name: z.string().min(3),
    email: z.string().email(),
    password: z.string().min(4),
    variant: z.literal("REGISTER"),
    verificationCode: z.string().optional(),
});

const loginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(4),
    variant: z.literal("LOGIN"),
    verificationCode: z.string().optional(),
});

export default async function SignInPage() {
    const { signIn } = useSignIn();
    const { signUp } = useSignUp();
    const { signOut } = useClerk();
    const router = useRouter();
    const [variant, setVariant] = useState<Variant>('LOGIN');
    const [isLoading, setIsLoading] = useState(false);
    const [isVerification, setIsVerification] = useState(false);
    const [signUpId, setSignUpId] = useState<string | null>(null);
    const [verificationCode, setVerificationCode] = useState("");

    const formSchema = useMemo(() => 
        z.discriminatedUnion("variant", [registerSchema, loginSchema])
    , []);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            email: "",
            password: "",
            variant: variant,
        },
    });

    useEffect(() => {
        form.setValue("variant", variant);
    }, [variant, form]);

    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('verificationCode');
        
        if (code && signUp) {
            handleVerification(code);
        }
    }, [signUp]);

    useEffect(() => {
        const checkAndSignOut = async () => {
            try {
                await signOut();
            } catch (error) {
                console.error('Error during signout:', error);
            }
        };
        
        checkAndSignOut();
    }, [signOut]);

    const toggleVariant = useCallback(() => {
        setVariant(current => current === 'LOGIN' ? 'REGISTER' : 'LOGIN');
    }, []);

    const onSubmit = async (data: z.infer<typeof formSchema>) => {
        setIsLoading(true);

        try {
            if (variant === 'LOGIN') {
                const result = await signIn?.create({
                    identifier: data.email,
                    password: data.password,
                });

                if (result?.status === "complete") {
                    // First redirect to a loading page
                    router.replace('/auth-callback');
                    toast.success('Logged in successfully!');
                }
            }

            if (variant === 'REGISTER') {
                if (!signUp) {
                    console.log('SignUp object is not available');
                    return;
                }
                
                try {
                    // Validate input
                    if (!data.email || !data.password) {
                        toast.error('Please fill in all required fields');
                        return;
                    }

                    console.log('Starting registration process...');

                    // Step 1: Create the signup
                    const signUpAttempt = await signUp.create({
                        emailAddress: data.email,
                        password: data.password
                    });

                    console.log('Initial signup response:', signUpAttempt.status);

                    // Step 2: Prepare email verification
                    if (signUpAttempt.status === "missing_requirements" && 
                        signUpAttempt.unverifiedFields.includes("email_address")) {
                        
                        await signUpAttempt.prepareEmailAddressVerification();
                        setSignUpId(signUpAttempt.id ?? null);
                        setIsVerification(true);
                        toast.success('Please check your email for a verification code');
                        return;
                    }

                    // If we somehow get here without needing verification
                    if (signUpAttempt.status === "complete") {
                        toast.success('Account created successfully!');
                        router.push('/');
                    }

                } catch (err: any) {
                    console.error('Registration error:', {
                        status: err.status,
                        message: err.errors?.[0]?.message || 'Unknown error',
                        code: err.errors?.[0]?.code,
                        fullError: err
                    });
                    
                    // Handle specific error cases
                    if (err.errors?.[0]?.code === "form_password_weak") {
                        toast.error('Password must be at least 8 characters long and include numbers and letters');
                    } else if (err.errors?.[0]?.code === "form_identifier_exists") {
                        toast.error('An account with this email already exists');
                    } else if (err.errors?.[0]?.message) {
                        toast.error(err.errors[0].message);
                    } else {
                        toast.error('Error creating account');
                    }
                } finally {
                    setIsLoading(false);
                }
            }
        } catch (error: any) {
            if (error.errors?.[0]?.message) {
                toast.error(error.errors[0].message);
            } else {
                toast.error('Something went wrong');
            }
        } finally {
            setIsLoading(false);
        }
    };

    const signInWithGoogle = useCallback(async () => {
        try {
            await signIn?.authenticateWithRedirect({
                strategy: "oauth_google",
                redirectUrl: "/sso-callback",
                redirectUrlComplete: "/dashboard"
            });
        } catch (error) {
            toast.error('Error signing in with Google');
        }
    }, [signIn]);

    const formContent = useMemo(() => (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                {variant === 'REGISTER' && (
                    <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Name</FormLabel>
                                <FormControl>
                                    <Input placeholder="Username" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                )}
                <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                                <Input type="email" placeholder="johndoe@email.com" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Password</FormLabel>
                            <FormControl>
                                <Input type="password" placeholder="Password" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <Button 
                    className="w-full" 
                    onClick={() => form.setValue("variant", variant)} 
                    type="submit" 
                    disabled={isLoading}
                >
                    Continue
                </Button>
            </form>
        </Form>
    ), [form, variant, isLoading, onSubmit]);

    const handleVerification = async (code: string) => {
        try {
            setIsLoading(true);
            
            // Remove any existing session first
            await signOut();
            
            const signUpAttempt = await signUp?.attemptEmailAddressVerification({
                code,
            });

            if (signUpAttempt?.status === "complete") {
                toast.success("Email verified successfully!");
                
                // Add a small delay before sign in attempt
                await new Promise(resolve => setTimeout(resolve, 500));
                
                const signInAttempt = await signIn?.create({
                    identifier: signUpAttempt.emailAddress!,
                    password: form.getValues('password'),
                });

                if (signInAttempt?.status === "complete") {
                    router.replace('/auth-callback');
                }
            } else {
                toast.error("Verification failed. Please try again.");
            }
        } catch (err: any) {
            console.error('Verification error:', err);
            toast.error(err.errors?.[0]?.message || "Verification failed");
        } finally {
            setIsLoading(false);
        }
    };

    const user = await currentUser();

    // If user is already logged in, redirect to their first store or stores page
    if (user) {
        return redirect('/stores');
    }

    return (
        <div className="flex justify-center items-center h-full">
            <Card className="shadow-md">
                <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl">
                        {isVerification 
                            ? 'Verify Your Email' 
                            : variant === 'LOGIN' 
                                ? 'Sign In!' 
                                : 'Sign Up!'}
                    </CardTitle>
                    <CardDescription>
                        {isVerification 
                            ? 'Enter the verification code sent to your email'
                            : variant === 'LOGIN'
                                ? 'Enter your credentials to Login'
                                : 'Enter your details to create an account'}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {isVerification ? (
                        // Verification Form
                        <Form {...form}>
                            <form className="space-y-4">
                                <FormField
                                    control={form.control}
                                    name="verificationCode"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Verification Code</FormLabel>
                                            <FormControl>
                                                <Input 
                                                    {...field}
                                                    value={verificationCode}
                                                    onChange={(e) => setVerificationCode(e.target.value)}
                                                    placeholder="Enter verification code"
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <Button 
                                    className="w-full" 
                                    onClick={() => handleVerification(verificationCode)}
                                    disabled={isLoading}
                                >
                                    Verify Email
                                </Button>
                            </form>
                        </Form>
                    ) : (
                        // Regular Sign In/Up Form
                        <div className="space-y-4 py-2 pb-4">
                            {formContent}
                        </div>
                    )}
                </CardContent>
                {!isVerification && (
                    <CardFooter>
                        <div className="relative pb-2">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-muted-foreground" />
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-background px-2 text-muted-foreground">
                                    Or continue with
                                </span>
                            </div>
                        </div>
                        <Button 
                            className="w-full flex gap-3" 
                            onClick={signInWithGoogle}
                        >
                            <FcGoogle size={18} /> Continue with google
                        </Button>
                        <div className="mt-6 px-2 flex gap-2 justify-center text-sm text-gray-500">
                            <span>
                                {variant === 'LOGIN' ? 'No Account?' : 'Already have an account'}
                            </span>
                            <span 
                                className="underline cursor-pointer text-blue-900" 
                                onClick={toggleVariant}
                            >
                                {variant === 'LOGIN' ? 'Create an Account' : 'Log In'}
                            </span>
                        </div>
                    </CardFooter>
                )}
            </Card>
        </div>
    );
} 