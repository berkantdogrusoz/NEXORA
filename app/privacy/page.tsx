import Navbar from "@/app/components/navbar";

export default function PrivacyPage() {
    return (
        <main className="min-h-screen bg-slate-50">
            <Navbar />
            <div className="max-w-3xl mx-auto px-6 py-20">
                <h1 className="text-3xl font-bold mb-8 text-slate-900">Privacy Policy</h1>
                <p className="text-slate-600 mb-4">Last updated: {new Date().toLocaleDateString()}</p>

                <section className="mb-8">
                    <h2 className="text-xl font-semibold mb-4 text-slate-800">1. Introduction</h2>
                    <p className="text-slate-600 leading-relaxed">
                        Nexora ("we", "our", or "us") respects your privacy and is committed to protecting your personal data.
                        This privacy policy will inform you as to how we look after your personal data when you visit our website
                        and tell you about your privacy rights and how the law protects you.
                    </p>
                </section>

                <section className="mb-8">
                    <h2 className="text-xl font-semibold mb-4 text-slate-800">2. Data We Collect</h2>
                    <p className="text-slate-600 leading-relaxed mb-4">
                        We may collect, use, store and transfer different kinds of personal data about you which we have grouped together follows:
                    </p>
                    <ul className="list-disc pl-6 space-y-2 text-slate-600">
                        <li><strong>Identity Data:</strong> includes first name, last name, username or similar identifier.</li>
                        <li><strong>Contact Data:</strong> includes email address.</li>
                        <li><strong>Technical Data:</strong> includes internet protocol (IP) address, your login data, browser type and version.</li>
                        <li><strong>Usage Data:</strong> includes information about how you use our website, products and services.</li>
                        <li><strong>Instagram Data:</strong> includes your Instagram username, profile picture, and access tokens required to post content on your behalf. We do not store your Instagram password.</li>
                    </ul>
                </section>

                <section className="mb-8">
                    <h2 className="text-xl font-semibold mb-4 text-slate-800">3. How We Use Your Data</h2>
                    <p className="text-slate-600 leading-relaxed">
                        We will only use your personal data when the law allows us to. Most commonly, we will use your personal data in the following circumstances:
                    </p>
                    <ul className="list-disc pl-6 space-y-2 mt-4 text-slate-600">
                        <li>To provide the service you requested (e.g., auto-posting to Instagram).</li>
                        <li>To manage your account and subscription.</li>
                        <li>To improve our website and services.</li>
                    </ul>
                </section>

                <section className="mb-8">
                    <h2 className="text-xl font-semibold mb-4 text-slate-800">4. Data Security</h2>
                    <p className="text-slate-600 leading-relaxed">
                        We have put in place appropriate security measures to prevent your personal data from being accidentally lost, used or accessed in an unauthorized way, altered or disclosed.
                    </p>
                </section>

                <section className="mb-8">
                    <h2 className="text-xl font-semibold mb-4 text-slate-800">5. Contact Us</h2>
                    <p className="text-slate-600 leading-relaxed">
                        If you have any questions about this privacy policy or our privacy practices, please contact us at support@getnexorai.com.
                    </p>
                </section>
            </div>
        </main>
    );
}
