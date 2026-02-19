import "./globals.css";
import { Inter } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import AnimatedShaderBackground from "./components/ui/animated-shader-background";
import { Sidebar } from "@/components/sidebar";
import { Metadata } from "next";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Nexora AI",
  description: "Build, Run & Scale AI Agents",
};

export const dynamic = 'force-dynamic';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || "pk_test_placeholder"}>
      <html lang="en" className={inter.variable} suppressHydrationWarning>
        <body className="font-sans bg-black text-slate-100 antialiased min-h-screen relative selection:bg-violet-500/30">
          <div className="h-full relative flex">
            {/* Sidebar - Hidden on mobile for now, or use a responsive logic later */}
            <div className="hidden md:flex md:w-72 md:flex-col md:fixed md:inset-y-0 z-[80] bg-gray-900 border-r border-white/10">
              <Sidebar />
            </div>

            {/* Main Content */}
            <main className="flex-1 md:pl-72 relative min-h-screen">
              <AnimatedShaderBackground />
              <div className="relative z-10 h-full">
                {children}
              </div>
            </main>
          </div>
        </body>
      </html>
    </ClerkProvider>
  );
}
