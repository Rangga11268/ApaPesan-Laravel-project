import ApplicationLogo from "@/Components/ApplicationLogo";
import { useTheme } from "@/Contexts/ThemeContext";
import { Link } from "@inertiajs/react";

export default function GuestLayout({ children }) {
    const { theme, toggleTheme } = useTheme();

    return (
        <div className="min-h-screen flex bg-background text-main font-sans selection:bg-primary-500/20">
            {/* Left Panel - Branding & Purpose (Desktop) */}
            <div className="hidden lg:flex lg:w-1/2 bg-surface-elevated border-r border-border flex-col justify-between p-12 lg:p-16">
                <div>
                    <Link href="/" className="inline-flex items-center gap-3">
                        <ApplicationLogo className="w-10 h-10" />
                        <span className="text-2xl font-display font-bold text-main tracking-tight">
                            ApaPesan
                        </span>
                    </Link>
                </div>

                <div className="max-w-md my-auto py-12">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border bg-surface text-xs font-semibold text-primary-600 dark:text-primary-400 mb-6">
                        <span>Platform Komunikasi Terstruktur</span>
                    </div>

                    <h1 className="text-4xl font-display font-bold text-main leading-tight mb-4">
                        Percakapan tim yang jernih, andal, dan fokus.
                    </h1>
                    <p className="text-base text-muted leading-relaxed mb-10">
                        Dirancang dengan tata letak berdensitas optimal untuk mendukung pertukaran pesan cepat dan kolaborasi grup tanpa distraksi.
                    </p>

                    <div className="space-y-4">
                        <div className="flex items-start gap-4 p-4 rounded-xl border border-border bg-surface shadow-sm">
                            <div className="w-10 h-10 rounded-lg bg-primary-50 dark:bg-primary-950/50 text-primary-600 dark:text-primary-400 flex items-center justify-center shrink-0 border border-primary-200 dark:border-primary-800">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="font-semibold text-sm text-main">
                                    Pesan Instan Real-time
                                </h3>
                                <p className="text-xs text-muted mt-0.5">
                                    Pembaruan percakapan seketika dengan status pengiriman yang akurat.
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start gap-4 p-4 rounded-xl border border-border bg-surface shadow-sm">
                            <div className="w-10 h-10 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-200 dark:border-emerald-800">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="font-semibold text-sm text-main">
                                    Kolaborasi Percakapan Grup
                                </h3>
                                <p className="text-xs text-muted mt-0.5">
                                    Ruang diskusi terstruktur untuk koordinasi tim dan proyek.
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start gap-4 p-4 rounded-xl border border-border bg-surface shadow-sm">
                            <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 border border-blue-200 dark:border-blue-800">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="font-semibold text-sm text-main">
                                    Riwayat & Pencarian Terpadu
                                </h3>
                                <p className="text-xs text-muted mt-0.5">
                                    Pencarian cepat kata kunci dalam percakapan dan pengelolaan lampiran.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="text-xs text-muted">
                    <span>ApaPesan Communication Platform &copy; 2026</span>
                </div>
            </div>

            {/* Right Panel - Auth Card */}
            <div className="w-full lg:w-1/2 flex flex-col justify-center items-center px-6 py-12 relative bg-background">
                {/* Theme Toggle Button (44x44px min tap target) */}
                <div className="absolute top-6 right-6">
                    <button
                        onClick={toggleTheme}
                        type="button"
                        className="w-11 h-11 flex items-center justify-center rounded-xl border border-border bg-surface text-muted hover:text-main hover:border-border-active transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                        title={theme === "dark" ? "Ganti ke mode terang" : "Ganti ke mode gelap"}
                        aria-label="Toggle theme"
                    >
                        {theme === "dark" ? (
                            <svg className="w-5 h-5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                            </svg>
                        ) : (
                            <svg className="w-5 h-5 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                            </svg>
                        )}
                    </button>
                </div>

                {/* Mobile Logo */}
                <div className="lg:hidden mb-8 text-center">
                    <Link href="/" className="inline-flex flex-col items-center">
                        <ApplicationLogo className="w-12 h-12 mb-3" />
                        <h1 className="text-2xl font-display font-bold text-main">
                            ApaPesan
                        </h1>
                    </Link>
                </div>

                {/* Card Container */}
                <div className="w-full max-w-md">
                    <div className="bg-surface rounded-2xl shadow-sm p-8 border border-border">
                        {children}
                    </div>

                    {/* Footer */}
                    <p className="text-center text-xs text-muted mt-8">
                        &copy; 2026 ApaPesan. Hak cipta dilindungi.
                    </p>
                </div>
            </div>
        </div>
    );
}
