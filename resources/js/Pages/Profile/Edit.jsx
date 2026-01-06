import ChatLayout from "@/Layouts/ChatLayout";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import DeleteUserForm from "./Partials/DeleteUserForm";
import UpdatePasswordForm from "./Partials/UpdatePasswordForm";
import UpdateProfileInformationForm from "./Partials/UpdateProfileInformationForm";
import { Head } from "@inertiajs/react";
import { useState } from "react";
import {
    UserCircleIcon,
    ShieldCheckIcon,
    ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";

function Edit({ mustVerifyEmail, status }) {
    const [activeTab, setActiveTab] = useState("general");

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
            <Head title="Settings" />

            {/* Settings Sidebar - Responsive */}
            <div className="w-full sm:w-64 flex flex-row sm:flex-col border-b sm:border-b-0 sm:border-r border-white/5 bg-[#05070a]/30 p-2 sm:p-4 gap-1 sm:space-y-2 overflow-x-auto sm:overflow-x-visible custom-scrollbar">
                <h2 className="hidden sm:block text-xl font-display font-bold text-white mb-6 px-4">
                    Settings
                </h2>

                <button
                    onClick={() => setActiveTab("general")}
                    className={`flex items-center gap-3 px-4 py-2 sm:py-3 rounded-xl transition-all whitespace-nowrap ${
                        activeTab === "general"
                            ? "bg-primary-600/20 text-primary-300 border border-primary-500/30 shadow-[0_0_15px_rgba(124,58,237,0.1)]"
                            : "text-gray-400 hover:bg-white/5 hover:text-gray-200"
                    }`}
                >
                    <UserCircleIcon className="w-5 h-5 flex-shrink-0" />
                    <span className="font-medium text-sm sm:text-base">
                        General
                    </span>
                </button>

                <button
                    onClick={() => setActiveTab("security")}
                    className={`flex items-center gap-3 px-4 py-2 sm:py-3 rounded-xl transition-all whitespace-nowrap ${
                        activeTab === "security"
                            ? "bg-emerald-600/20 text-emerald-300 border border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.1)]"
                            : "text-gray-400 hover:bg-white/5 hover:text-gray-200"
                    }`}
                >
                    <ShieldCheckIcon className="w-5 h-5 flex-shrink-0" />
                    <span className="font-medium text-sm sm:text-base">
                        Security
                    </span>
                </button>

                <div className="sm:pt-4 sm:mt-auto flex sm:block items-center">
                    <div className="hidden sm:block h-px bg-white/5 mb-4"></div>
                    <button
                        onClick={() => setActiveTab("danger")}
                        className={`flex items-center gap-3 px-4 py-2 sm:py-3 rounded-xl w-full transition-all whitespace-nowrap ${
                            activeTab === "danger"
                                ? "bg-red-600/20 text-red-400 border border-red-500/30 shadow-[0_0_15px_rgba(239,68,68,0.1)]"
                                : "text-gray-400 hover:bg-red-500/10 hover:text-red-400"
                        }`}
                    >
                        <ExclamationTriangleIcon className="w-5 h-5 flex-shrink-0" />
                        <span className="font-medium text-sm sm:text-base">
                            Danger Zone
                        </span>
                    </button>
                </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-8 bg-black/20">
                <div className="max-w-4xl mx-auto glass-panel p-8 rounded-2xl relative overflow-hidden">
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
