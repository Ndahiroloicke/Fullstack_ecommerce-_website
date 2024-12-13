import { SignIn } from '@clerk/nextjs';

const SignInPage = () => {
    return (
        <div className="flex justify-center items-center h-screen">
            <SignIn 
                path="/signIn" 
                routing="path" 
                signUpUrl="/signUp" // Redirect to sign-up page if needed
            />
        </div>
    );
};

export default SignInPage; 