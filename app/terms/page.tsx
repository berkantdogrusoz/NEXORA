import Navbar from "@/app/components/navbar";

export default function TermsPage() {
    return (
        <main className="min-h-screen bg-slate-50">
            <Navbar />
            <div className="max-w-3xl mx-auto px-6 py-20">
                <h1 className="text-3xl font-bold mb-8 text-slate-900">Terms and Conditions</h1>
                <p className="text-slate-600 mb-4">Last updated: {new Date().toLocaleDateString()}</p>

                <section className="mb-8">
                    <h2 className="text-xl font-semibold mb-4 text-slate-800">1. Introduction</h2>
                    <p className="text-slate-600 leading-relaxed">
                        Welcome to Nexora. These Terms and Conditions govern your use of our website and services.
                        By accessing or using our service, you agree to be bound by these terms.
                    </p>
                </section>

                <section className="mb-8">
                    <h2 className="text-xl font-semibold mb-4 text-slate-800">2. Use of Service</h2>
                    <div className="text-slate-600 leading-relaxed">
                        Nexora provides AI-powered marketing tools and Instagram automation. You agree to use our service:
                        <ul className="list-disc pl-6 mt-2 space-y-1">
                            <li>In compliance with all applicable laws.</li>
                            <li>In compliance with Instagram's Terms of Use and Community Guidelines.</li>
                            <li>Not for spamming, harassment, or distributing illegal content.</li>
                        </ul>
                    </div>
                </section>

                <section className="mb-8">
                    <h2 className="text-xl font-semibold mb-4 text-slate-800">3. Subscriptions and Payments</h2>
                    <p className="text-slate-600 leading-relaxed">
                        Some features of Nexora are paid. Payments are processed securely via our merchant of record, Lemon Squeezy.
                        You may cancel your subscription at any time. Refunds are handled according to our Refund Policy.
                    </p>
                </section>

                <section className="mb-8">
                    <h2 className="text-xl font-semibold mb-4 text-slate-800">4. Instagram API Usage</h2>
                    <p className="text-slate-600 leading-relaxed">
                        Nexora uses the official Instagram Graph API. We do not sell likes, followers, or engagement.
                        We are not affiliated with Meta Platforms, Inc.
                    </p>
                </section>

                <section className="mb-8">
                    <h2 className="text-xl font-semibold mb-4 text-slate-800">5. Limitation of Liability</h2>
                    <p className="text-slate-600 leading-relaxed">
                        Nexora is provided "as is". We are not liable for any damages arising from your use of the service,
                        including but not limited to loss of data or account suspension by third-party platforms.
                    </p>
                </section>

                <section className="mb-8">
                    <h2 className="text-xl font-semibold mb-4 text-slate-800">6. Contact</h2>
                    <p className="text-slate-600 leading-relaxed">
                        For any questions regarding these terms, please contact us at support@getnexorai.com.
                    </p>
                </section>
            </div>
        </main>
    );
}
