import ChatLayout from "@/Layouts/ChatLayout";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import DeleteUserForm from "./Partials/DeleteUserForm";
import UpdatePasswordForm from "./Partials/UpdatePasswordForm";
import UpdateProfileInformationForm from "./Partials/UpdateProfileInformationForm";
import { Head, usePage, Link } from "@inertiajs/react";
import { useState } from "react";
import {
    UserCircleIcon,
    ShieldCheckIcon,
    ExclamationTriangleIcon,
    ArrowLeftIcon,
} from "@heroicons/react/24/outline";
import UserAvatar from "@/Components/App/UserAvatar";

function Edit({ mustVerifyEmail, status }) {
    const [activeTab, setActiveTab] = useState("general");
    const user = usePage().props.auth.user;

    const renderContent = () => {
        switch (activeTab) {
            case "general":
                return (
                    <UpdateProfileInformationForm
                        mustVerifyEmail={mustVerifyEmail}
                        status={status}
                        className="max-w-xl"
                    />
                );
            case "security":
                return <UpdatePasswordForm className="max-w-xl" />;
            case "danger":
                return <DeleteUserForm className="max-w-xl" />;
            default:
                return null;
        }
    };

    return (
        <div className="flex flex-col sm:flex-row h-full w-full overflow-hidden">
            <Head title="Pengaturan" />

            {/* Settings Sidebar - Responsive */}
            <div className="w-full sm:w-72 flex flex-col border-b sm:border-b-0 sm:border-r border-white/5 bg-[#05070a]/30">
                {/* Mobile Back Button */}
                <div className="sm:hidden p-4 border-b border-white/5">
                    <Link
                        href={route("dashboard")}
                        className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
                    >
                        <ArrowLeftIcon className="w-5 h-5" />
                        <span>Kembali</span>
                    </Link>
                </div>

                {/* User Profile Card */}
                <div className="p-4 sm:p-6 border-b border-white/5">
                    <div className="flex flex-row sm:flex-col items-center gap-4 sm:text-center">
                        <div className="relative">
                            <div className="absolute inset-0 bg-gradient-to-r from-primary-500 to-accent-500 rounded-full blur-xl opacity-30"></div>
                            <UserAvatar
                                user={user}
                                className="relative w-16 h-16 sm:w-24 sm:h-24 border-2 border-primary-500/50 shadow-xl"
                            />
                        </div>
                        <div className="sm:mt-2">
                            <h3 className="font-display font-bold text-white text-lg">
                                {user.name}
                            </h3>
                            <p className="text-sm text-gray-400">
                                {user.email}
                            </p>
                            <span className="inline-block mt-2 px-3 py-1 text-xs font-medium bg-emerald-500/20 text-emerald-400 rounded-full border border-emerald-500/30">
                                {user.is_admin ? "Administrator" : "Member"}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Menu Items */}
                <div className="flex flex-row sm:flex-col p-2 sm:p-4 gap-1 sm:space-y-2 overflow-x-auto sm:overflow-x-visible custom-scrollbar">
                    <h2 className="hidden sm:block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 px-4">
                        Pengaturan
                    </h2>

                    <button
                        onClick={() => setActiveTab("general")}
                        className={`flex items-center gap-3 px-4 py-2.5 sm:py-3 rounded-xl transition-all whitespace-nowrap ${
                            activeTab === "general"
                                ? "bg-primary-600/20 text-primary-300 border border-primary-500/30 shadow-[0_0_15px_rgba(124,58,237,0.1)]"
                                : "text-gray-400 hover:bg-white/5 hover:text-gray-200"
                        }`}
                    >
                        <UserCircleIcon className="w-5 h-5 flex-shrink-0" />
                        <span className="font-medium text-sm">Profil</span>
                    </button>

                    <button
                        onClick={() => setActiveTab("security")}
                        className={`flex items-center gap-3 px-4 py-2.5 sm:py-3 rounded-xl transition-all whitespace-nowrap ${
                            activeTab === "security"
                                ? "bg-emerald-600/20 text-emerald-300 border border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.1)]"
                                : "text-gray-400 hover:bg-white/5 hover:text-gray-200"
                        }`}
                    >
                        <ShieldCheckIcon className="w-5 h-5 flex-shrink-0" />
                        <span className="font-medium text-sm">Keamanan</span>
                    </button>
                </div>

                {/* Danger Zone - Separate Section */}
                <div className="mt-auto p-2 sm:p-4 border-t border-white/5">
                    <button
                        onClick={() => setActiveTab("danger")}
                        className={`flex items-center gap-3 px-4 py-2.5 sm:py-3 rounded-xl w-full transition-all whitespace-nowrap ${
                            activeTab === "danger"
                                ? "bg-red-600/20 text-red-400 border border-red-500/30 shadow-[0_0_15px_rgba(239,68,68,0.1)]"
                                : "text-gray-400 hover:bg-red-500/10 hover:text-red-400"
                        }`}
                    >
                        <ExclamationTriangleIcon className="w-5 h-5 flex-shrink-0" />
                        <span className="font-medium text-sm">Zona Bahaya</span>
                    </button>
                </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-4 sm:p-8 bg-black/20">
                <div className="max-w-3xl mx-auto glass-panel p-6 sm:p-8 rounded-2xl relative overflow-hidden">
                    {/* Background decoration */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>

                    <div className="relative z-10 animate-fade-in-up">
                        {renderContent()}
                    </div>
                </div>
            </div>
        </div>
    );
}

Edit.layout = (page) => (
    <AuthenticatedLayout>
        <ChatLayout children={page} />
    </AuthenticatedLayout>
);

export default Edit;
