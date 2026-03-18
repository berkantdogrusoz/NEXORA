import "./globals.css";
import { Inter } from "next/font/google";
import localFont from "next/font/local";
import { ClerkProvider } from "@clerk/nextjs";
import { Metadata } from "next";
import Script from "next/script";
import JsonLd from "@/app/components/JsonLd";
import CookieConsent from "@/app/components/CookieConsent";
import { clerkAppearance } from "@/lib/clerk-appearance";

const GA_ID = "G-6Y87W7H5CY";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const displayFont = localFont({
  src: "../public/fonts/CharlestonDisplay.ttf",
  variable: "--font-display",
  display: "swap",
});

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://getnexorai.com";

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: "Nexora AI – Create Stunning Videos & Images with AI",
    template: "%s | Nexora AI",
  },
  description:
    "Generate cinematic AI videos and stunning images from simple text prompts. Powered by DALL-E 3, Nano Banana 2, Seedance 2.0, Kling 3.0, Sora 2, and 10+ AI models. Metinden video oluşturma, yapay zeka görsel üretici ve AI stüdyo.",
  keywords: [
    "AI video generator",
    "AI image generator",
    "text to video",
    "text to image",
    "yapay zeka video oluştur",
    "yapay zeka resim çizme",
    "metinden video yapma",
    "ücretsiz yapay zeka",
    "Seedance",
    "DALL-E 3",
    "Kling",
    "Sora",
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
  verification: {
    google: "wW0oJujFaeajEy-U1B3dxdH1LaVopY7sa7Ubm37VZNM",
  },
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
      appearance={clerkAppearance}
    >
      <html lang="en" className={`${inter.variable} ${displayFont.variable}`} suppressHydrationWarning>
        <head>
          {/* Google Analytics — consent mode default: denied */}
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
            strategy="afterInteractive"
          />
          <Script id="ga-init" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('consent', 'default', {
                analytics_storage: 'denied',
              });
              gtag('js', new Date());
              gtag('config', '${GA_ID}');
            `}
          </Script>
        </head>
        <body className="font-sans bg-black text-slate-100 antialiased min-h-screen selection:bg-cyan-500/30">
          <JsonLd />
          {children}
          <CookieConsent />
        </body>
      </html>
    </ClerkProvider>
  );
}
