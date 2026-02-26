import "./globals.css";
import { Inter } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { Metadata } from "next";
import JsonLd from "@/app/components/JsonLd";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://getnexorai.com";

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: "Nexora AI – Create Stunning Videos & Images with AI",
    template: "%s | Nexora AI",
  },
  description:
    "Generate cinematic AI videos and stunning images from simple text prompts. Powered by DALL-E 3, FLUX, Seedance 2.0, Runway Gen-4.5, and 10+ AI models. Free to start.",
  keywords: [
    "AI video generator",
    "AI image generator",
    "text to video",
    "text to image",
    "AI art generator",
    "video AI",
    "Seedance",
    "DALL-E 3",
    "FLUX",
    "Runway",
    "Nexora AI",
    "free AI video",
    "AI content creator",
    "cinematic video AI",
  ],
  authors: [{ name: "Nexora AI" }],
  creator: "Nexora AI",
  publisher: "Nexora AI",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: BASE_URL,
    siteName: "Nexora AI",
    title: "Nexora AI – Create Stunning Videos & Images with AI",
    description:
      "Generate cinematic AI videos and stunning images from simple text prompts. 10+ AI models. Free to start.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Nexora AI – Create Stunning Videos & Images with AI",
    description:
      "Generate cinematic AI videos and stunning images from simple text prompts. 10+ AI models. Free to start.",
  },
  alternates: {
    canonical: BASE_URL,
  },
  category: "Technology",
};

export const dynamic = "force-dynamic";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider
      publishableKey={
        process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || "pk_test_placeholder"
      }
      signInFallbackRedirectUrl="/dashboard"
      signUpFallbackRedirectUrl="/dashboard"
    >
      <html lang="en" className={inter.variable} suppressHydrationWarning>
        <body className="font-sans bg-black text-slate-100 antialiased min-h-screen selection:bg-violet-500/30">
          <JsonLd />
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}

