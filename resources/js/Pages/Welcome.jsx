import { Link, Head } from "@inertiajs/react";
import { ArrowRightIcon } from "@heroicons/react/24/outline";
import ApplicationLogo from "@/Components/ApplicationLogo";

export default function Welcome({ auth, laravelVersion, phpVersion }) {
    return (
        <>
            <Head title="Welcome" />
            <div className="bg-[#05070a] text-white min-h-screen selection:bg-primary-500/30 overflow-hidden font-sans relative">
                {/* Background Effects */}
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
                    <div className="absolute top-[-10%] left-[20%] w-[600px] h-[600px] bg-primary-900/20 rounded-full blur-[120px] mix-blend-screen animate-pulse-soft"></div>
                    <div
                        className="absolute bottom-[-10%] right-[10%] w-[500px] h-[500px] bg-accent-900/10 rounded-full blur-[100px] mix-blend-screen animate-pulse-soft"
                        style={{ animationDelay: "2s" }}
                    ></div>
                </div>

                <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 sm:px-6 lg:px-8">
                    {/* Hero Brand */}
                    <div className="mb-12 animate-enter">
                        <ApplicationLogo className="w-24 h-24 sm:w-32 sm:h-32 text-white fill-current drop-shadow-[0_0_30px_rgba(124,58,237,0.6)]" />
                    </div>

                    <div
                        className="text-center max-w-3xl space-y-8 animate-enter"
                        style={{ animationDelay: "0.1s" }}
                    >
                        <h1 className="font-display font-bold text-5xl sm:text-7xl tracking-tight leading-tight">
                            Connect beyond <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 via-accent-400 to-indigo-400 text-glow">
                                boundaries.
                            </span>
                        </h1>

                        <p className="text-gray-400 text-lg sm:text-xl font-light leading-relaxed max-w-2xl mx-auto">
                            Experience the next generation of conversation.
                            Fast, secure, and beautiful. Ready for the Midnight
                            Aurora.
                        </p>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-10">
                            {auth.user ? (
                                <Link
                                    href={route("dashboard")}
                                    className="group relative px-8 py-4 bg-white text-black font-bold rounded-full hover:bg-gray-100 transition-all shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:shadow-[0_0_30px_rgba(255,255,255,0.5)] flex items-center gap-2"
                                >
                                    Go to Dashboard
                                    <ArrowRightIcon className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </Link>
                            ) : (
                                <>
                                    <Link
                                        href={route("login")}
                                        className="group relative px-8 py-4 bg-primary-600 hover:bg-primary-500 text-white font-bold rounded-full transition-all shadow-[0_10px_30px_rgba(124,58,237,0.3)] hover:shadow-[0_20px_40px_rgba(124,58,237,0.5)] flex items-center gap-2"
                                    >
                                        Log in
                                        <ArrowRightIcon className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                    </Link>

                                    <Link
                                        href={route("register")}
                                        className="px-8 py-4 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-full transition-all font-medium backdrop-blur-sm"
                                    >
                                        Sign up
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                <footer className="absolute bottom-6 w-full text-center text-gray-600 text-sm font-light">
                    ApaPesan &copy; 2024. Laravel v{laravelVersion} (PHP v
                    {phpVersion})
                </footer>
            </div>
        </>
    );
}
