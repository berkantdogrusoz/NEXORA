import "./globals.css";
import { Inter } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata = {
  title: "Nexora AI — Build, Run & Scale AI Agents",
  description:
    "Autonomous AI agents for Instagram & Google Ads marketing. Generate campaigns, content, and ads in one workflow.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en" className={inter.variable}>
        <body className="font-sans bg-[#fafafa] text-[#0f172a] antialiased">
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
