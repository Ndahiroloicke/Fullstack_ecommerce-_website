'use client'

import { FcGoogle } from "react-icons/fc";
import { useSignIn, useSignUp } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { useCallback, useState, useMemo, useEffect } from 'react';
import * as z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { SignInResource } from '@clerk/types';

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
});

const loginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(4),
    variant: z.literal("LOGIN"),
});

export default function SignInPage() {
    const { signIn } = useSignIn();
    const { signUp } = useSignUp();
    const router = useRouter();
    const [variant, setVariant] = useState<Variant>('LOGIN');
    const [isLoading, setIsLoading] = useState(false);

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
                }) as SignInResource;

                if (result?.status === "complete") {
                    router.push('/');
                    toast.success('Logged in successfully!');
                } else {
                    // Handle any necessary verification steps
                    const firstFactor = result?.firstFactorVerification;
                    if (firstFactor?.status === "unverified") {
                        toast.error('Please verify your email');
                    }
                }
            }

            if (variant === 'REGISTER') {
                if (!signUp) return;
                
                try {
                    const result = await signUp.create({
                        emailAddress: data.email,
                        password: data.password,
                        firstName: (data as z.infer<typeof registerSchema>).name
                    });

                    if (result.status === "complete") {
                        toast.success('Account created successfully!');
                        router.push('/');
                    } else {
                        // Fixed type checking for verification status
                        const verifyEmail = result.status === "missing_requirements" && 
                                         result.missingFields.includes("email_address");
                        
                        if (verifyEmail) {
                            await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
                            toast.success('Please check your email for verification code');
                        }
                    }
                } catch (err: any) {
                    if (err.errors?.[0]?.message) {
                        toast.error(err.errors[0].message);
                    } else {
                        toast.error('Error creating account');
                    }
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
                redirectUrlComplete: "/"
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
                                    <Input placeholder="E-commerce" {...field} />
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
                                <Input {...field} type="email" placeholder="johndoe@email.com" />
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

    return (
        <div className="flex justify-center items-center h-full">
            <Card className="shadow-md">
                <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl">
                        {variant === 'LOGIN' ? 'Sign In!' : 'Sign Up! Create an account'}
                    </CardTitle>
                    <CardDescription>
                        {variant === 'LOGIN' 
                            ? 'Enter your credentials to Login into your account'
                            : 'Enter your email below to create your account'
                        }
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4 py-2 pb-4">
                        {formContent}
                    </div>
                </CardContent>
                <CardFooter className="flex flex-col">
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
            </Card>
        </div>
    );
} 