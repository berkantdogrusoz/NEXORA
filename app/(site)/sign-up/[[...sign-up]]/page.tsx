import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
    return (
        <main className="relative min-h-screen flex items-center justify-center overflow-hidden">
            <div className="orb-bg" aria-hidden="true">
                <div className="orb orb-1" />
                <div className="orb orb-2" />
                <div className="orb orb-3" />
            </div>
            <div className="relative z-10">
                <SignUp />
            </div>
        </main>
    );
}
