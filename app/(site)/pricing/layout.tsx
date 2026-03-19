import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Pricing – Plans & Credits",
    description: "Nexora AI pricing plans starting free. Standard $19/mo, Nexora $49/mo, Pro $99/mo. Generate AI videos and images with top-tier models.",
};

export default function PricingLayout({ children }: { children: React.ReactNode }) {
    return children;
}
