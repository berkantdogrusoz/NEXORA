import Sidebar from "@/app/components/sidebar";

export default function AppLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex min-h-screen bg-black text-white font-sans">
            <Sidebar />
            <div className="flex-1 ml-64 relative z-0">
                {children}
            </div>
        </div>
    );
}
