import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://getnexorai.com";

    return {
        rules: [
            {
                userAgent: "*",
                allow: "/",
                disallow: ["/api/", "/dashboard", "/studio", "/generate", "/assistant", "/subscription"],
            },
        ],
        sitemap: `${baseUrl}/sitemap.xml`,
    };
}
