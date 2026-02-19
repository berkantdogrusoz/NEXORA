import "./globals.css";
import { Inter } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import AnimatedShaderBackground from "./components/ui/animated-shader-background";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata = {
  title: "Nexora AI — Build, Run & Scale AI Agents",
  description:
    "Autonomous AI agents for Instagram & Google Ads marketing. Generate campaigns, content, and ads in one workflow.",
};

export const dynamic = 'force-dynamic';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || "pk_test_placeholder_for_build"}>
      <html lang="en" className={inter.variable}>
        <body className="font-sans bg-black text-slate-100 antialiased min-h-screen relative selection:bg-violet-500/30">
          <AnimatedShaderBackground />
          <div className="relative z-10">
            {children}
          </div>
        </body>
      </html>
    </ClerkProvider>
  );
}
