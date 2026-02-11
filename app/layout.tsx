import "./globals.css";

export const metadata = {
  title: "Nexora AI",
  description: "Turn your idea into a sellable product in minutes.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-white text-gray-900">{children}</body>
    </html>
  );
}
