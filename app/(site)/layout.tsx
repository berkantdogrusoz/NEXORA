import Navbar from "@/app/components/navbar";

export default function SiteLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-black text-white font-sans selection:bg-violet-500/30">
            <Navbar />
            <main>
                {children}
            </main>
        </div>
    );
}
