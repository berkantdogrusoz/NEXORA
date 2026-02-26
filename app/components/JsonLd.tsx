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
        sameAs: [],
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
            "Create cinematic AI videos and stunning images with Nexora AI. Powered by DALL-E 3, FLUX, Seedance 2.0, Runway, and more.",
        featureList: [
            "AI Video Generation",
            "AI Image Generation",
            "10+ AI Models",
            "Text-to-Video",
            "Text-to-Image",
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
        </>
    );
}
