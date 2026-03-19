import { Metadata } from "next";

export const metadata: Metadata = {
    title: "API Documentation – Developer API",
    description: "Nexora AI REST API for developers. Generate images and videos programmatically. Supports DALL-E 3, Sora 2, Kling 3.0, Google Veo 3, and more.",
};

export default function ApiDocsLayout({ children }: { children: React.ReactNode }) {
    return children;
}
