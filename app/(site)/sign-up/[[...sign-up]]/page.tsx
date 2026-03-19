import { SignUp } from "@clerk/nextjs";
import Link from "next/link";
import { clerkAuthCardAppearance } from "@/lib/clerk-appearance";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Sign Up – Free AI Studio",
    description: "Create your free Nexora AI account. Get 100 credits to generate AI videos and images with DALL-E 3, Sora 2, Kling 3.0, and more.",
};

export default function SignUpPage() {
    return (
        <main className="relative min-h-screen flex items-center justify-center bg-[#06080d] px-4 py-10 overflow-x-hidden">
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
                <div className="absolute -top-24 left-1/2 h-[340px] w-[680px] max-w-[100vw] -translate-x-1/2 rounded-full bg-cyan-500/10 blur-3xl" />
                <div className="absolute -bottom-24 right-0 h-[300px] w-[380px] max-w-[50vw] rounded-full bg-blue-500/15 blur-3xl" />
                <div className="absolute -bottom-24 left-0 h-[280px] w-[320px] max-w-[50vw] rounded-full bg-emerald-500/10 blur-3xl" />
            </div>

            <div className="relative z-10 w-full max-w-[1100px] md:rounded-3xl md:border md:border-white/10 md:bg-black/40 md:p-8 md:shadow-[0_30px_100px_rgba(0,0,0,0.55)] md:backdrop-blur-xl md:grid md:grid-cols-[1.1fr,1fr]">
                <section className="hidden rounded-2xl border border-white/10 bg-gradient-to-b from-[#0c1523] to-[#090d16] p-8 md:flex md:flex-col md:justify-between">
                    <div>
                        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-cyan-300/90">Nexora</p>
                        <h1 className="mt-4 text-4xl font-black leading-tight text-white">
                            Create your account,
                            <br />
                            <span className="bg-gradient-to-r from-cyan-300 via-sky-300 to-blue-400 bg-clip-text text-transparent">
                                launch your first creation today.
                            </span>
                        </h1>
                        <p className="mt-4 max-w-sm text-sm leading-relaxed text-slate-300">
                            Manage video, image, director workflows, and API access from one unified panel. Start building with Nexora now.
                        </p>
                    </div>

                    <div className="space-y-2 text-xs text-slate-400">
                        <p>Secure signup with Clerk</p>
                        <p>Already registered? <Link href="/sign-in" className="text-cyan-300 hover:text-cyan-200">Log in</Link></p>
                    </div>
                </section>

                <section className="flex items-center justify-center p-0 md:p-6">
                    <SignUp
                        routing="path"
                        path="/sign-up"
                        signInUrl="/sign-in"
                        appearance={clerkAuthCardAppearance}
                    />
                </section>
            </div>
        </main>
    );
}
