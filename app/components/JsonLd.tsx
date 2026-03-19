export default function JsonLd() {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://getnexorai.com";

    const organizationSchema = {
        "@context": "https://schema.org",
        "@type": "Organization",
        name: "Nexora AI",
        url: baseUrl,
        logo: `${baseUrl}/icon.svg`,
        description:
            "AI-powered creative studio for generating stunning videos and images from simple text prompts.",
        sameAs: [
            "https://www.instagram.com/getnexorai",
            "https://rapidapi.com/berkantdogrusoz/api/nexora-ai-studio",
            "https://www.producthunt.com/products/nexora-ai-3",
        ],
    };

    const webAppSchema = {
        "@context": "https://schema.org",
        "@type": "WebApplication",
        name: "Nexora AI",
        url: baseUrl,
        applicationCategory: "MultimediaApplication",
        operatingSystem: "Web",
        offers: {
            "@type": "Offer",
            price: "0",
            priceCurrency: "USD",
            description: "Free tier with 100 credits",
        },
        description:
            "Create cinematic AI videos and stunning images with Nexora AI. Powered by DALL-E 3, Nano Banana 2, Seedance 2.0, Kling 3.0, Sora 2, and more.",
        featureList: [
            "AI Video Generation",
            "AI Image Generation",
            "10+ AI Models",
            "Text-to-Video",
            "Text-to-Image",
        ],
    };

    const websiteSchema = {
        "@context": "https://schema.org",
        "@type": "WebSite",
        name: "Nexora AI",
        url: baseUrl,
        potentialAction: {
            "@type": "SearchAction",
            target: `${baseUrl}/studio?q={search_term_string}`,
            "query-input": "required name=search_term_string",
        },
    };

    const siteNavigationSchema = {
        "@context": "https://schema.org",
        "@type": "SiteNavigationElement",
        name: [
            "Studio",
            "Pricing",
            "API Docs",
            "Templates",
            "Sign In",
            "Sign Up",
        ],
        url: [
            `${baseUrl}/studio`,
            `${baseUrl}/pricing`,
            `${baseUrl}/api-docs`,
            `${baseUrl}/templates`,
            `${baseUrl}/sign-in`,
            `${baseUrl}/sign-up`,
        ],
    };

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify(organizationSchema),
                }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify(webAppSchema),
                }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify(websiteSchema),
                }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify(siteNavigationSchema),
                }}
            />
        </>
    );
}
