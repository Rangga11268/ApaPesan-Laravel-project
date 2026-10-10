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
        <div className="flex flex-col sm:flex-row h-full w-full overflow-hidden bg-background text-main">
            <Head title="Pengaturan" />

            {/* Settings Sidebar - Responsive */}
            <div className="w-full sm:w-72 flex flex-col border-b sm:border-b-0 sm:border-r border-border bg-surface shrink-0">
                {/* Mobile Back Button */}
                <div className="sm:hidden p-4 border-b border-border">
                    <Link
                        href={route("dashboard")}
                        className="flex items-center gap-2 text-muted hover:text-main transition-colors"
                    >
                        <ArrowLeftIcon className="w-5 h-5" />
                        <span>Kembali</span>
                    </Link>
                </div>

                {/* User Profile Card */}
                <div className="p-4 sm:p-6 border-b border-border">
                    <div className="flex flex-row sm:flex-col items-center gap-4 sm:text-center">
                        <UserAvatar
                            user={user}
                            className="w-16 h-16 sm:w-20 sm:h-20 border-2 border-border shadow-md"
                        />
                        <div className="sm:mt-2">
                            <h3 className="font-display font-bold text-main text-lg tracking-tight">
                                {user.name}
                            </h3>
                            <p className="text-sm text-muted">
                                {user.email}
                            </p>
                            <span className="inline-block mt-2 px-3 py-0.5 text-xs font-semibold bg-surface-elevated text-primary rounded-full border border-border">
                                {user.is_admin ? "Administrator" : "Member"}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Menu Items */}
                <div className="flex flex-row sm:flex-col p-2 sm:p-4 gap-1.5 sm:space-y-1.5 overflow-x-auto sm:overflow-x-visible custom-scrollbar">
                    <h2 className="hidden sm:block text-xs font-bold text-muted uppercase tracking-wider mb-2 px-3">
                        Pengaturan
                    </h2>

                    <button
                        onClick={() => setActiveTab("general")}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors whitespace-nowrap text-sm font-medium ${
                            activeTab === "general"
                                ? "bg-primary text-white font-semibold"
                                : "text-muted hover:bg-surface-elevated hover:text-main"
                        }`}
                    >
                        <UserCircleIcon className="w-5 h-5 flex-shrink-0" />
                        <span>Profil</span>
                    </button>

                    <button
                        onClick={() => setActiveTab("security")}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors whitespace-nowrap text-sm font-medium ${
                            activeTab === "security"
                                ? "bg-primary text-white font-semibold"
                                : "text-muted hover:bg-surface-elevated hover:text-main"
                        }`}
                    >
                        <ShieldCheckIcon className="w-5 h-5 flex-shrink-0" />
                        <span>Keamanan</span>
                    </button>
                </div>

                {/* Danger Zone - Separate Section */}
                <div className="mt-auto p-2 sm:p-4 border-t border-border">
                    <button
                        onClick={() => setActiveTab("danger")}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-xl w-full transition-colors whitespace-nowrap text-sm font-medium ${
                            activeTab === "danger"
                                ? "bg-red-600 text-white font-semibold"
                                : "text-red-500 hover:bg-red-500/10 hover:text-red-600"
                        }`}
                    >
                        <ExclamationTriangleIcon className="w-5 h-5 flex-shrink-0" />
                        <span>Zona Bahaya</span>
                    </button>
                </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-4 sm:p-8 bg-background">
                <div className="max-w-2xl mx-auto bg-surface border border-border p-6 sm:p-8 rounded-2xl shadow-sm">
                    {renderContent()}
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
