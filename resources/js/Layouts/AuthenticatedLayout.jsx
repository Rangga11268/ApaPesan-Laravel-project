import { useState, useEffect } from "react";
import { usePage, Link } from "@inertiajs/react";
import Toast from "@/Components/App/Toast";
import NewMessageNotification from "@/Components/App/NewMessageNotification";
import { useEventBus } from "@/EventBus";
import ApplicationLogo from "@/Components/ApplicationLogo";
import UserAvatar from "@/Components/App/UserAvatar";
import Dropdown from "@/Components/Dropdown";
import CreateGroupModal from "@/Components/App/CreateGroupModal";
import { useTheme } from "@/Contexts/ThemeContext";
import {
    ChatBubbleLeftRightIcon,
    StarIcon,
    AtSymbolIcon,
    BookmarkSquareIcon,
    UserGroupIcon,
    SunIcon,
    MoonIcon,
    Bars3Icon,
    XMarkIcon,
    ChevronLeftIcon,
    ChevronRightIcon,
    Cog6ToothIcon,
    UserCircleIcon,
    ArrowLeftOnRectangleIcon,
} from "@heroicons/react/24/outline";

export default function AuthenticatedLayout({ children }) {
    const page = usePage();
    const user = page.props.auth.user;
    const { emit } = useEventBus();
    const { theme, toggleTheme } = useTheme();

    const [isRailExpanded, setIsRailExpanded] = useState(false);
    const [showMobileDrawer, setShowMobileDrawer] = useState(false);
    const [showCreateGroupModal, setShowCreateGroupModal] = useState(false);

    const [showNewMessageNotification, setShowNewMessageNotification] =
        useState(false);
    const [newMessage, setNewMessage] = useState(null);

    const conversations = page.props.conversation || [];

    useEffect(() => {
        const handleNewMessage = (e) => {
            const message = e.message;
            emit("message.created", message);
            if (message.sender_id === user.id) return;
            setNewMessage(message);
            setShowNewMessageNotification(true);
            setTimeout(() => {
                setShowNewMessageNotification(false);
                setNewMessage(null);
            }, 5000);
        };

        const handleMessageDeleted = (e) => {
            emit("message.deleted", {
                message: e.message,
                prevMessage: e.prevMessage,
            });
        };

        window.Echo.private(`message.new.to.user.${user.id}`).listen(
            "SocketMessage",
            handleNewMessage
        );

        window.Echo.private(`message.deleted.user.${user.id}`).listen(
            "SocketMessageDeleted",
            handleMessageDeleted
        );

        conversations.forEach((conv) => {
            if (conv.is_group) {
                window.Echo.private(`message.group.${conv.id}`)
                    .listen("SocketMessage", handleNewMessage)
                    .listen("SocketMessageDeleted", handleMessageDeleted);
            }
        });

        return () => {
            window.Echo.leave(`message.new.to.user.${user.id}`);
            window.Echo.leave(`message.deleted.user.${user.id}`);
            conversations.forEach((conv) => {
                if (conv.is_group) {
                    window.Echo.leave(`message.group.${conv.id}`);
                }
            });
        };
    }, [user, emit, conversations]);

    return (
        <div className="h-screen w-screen flex flex-col sm:flex-row bg-background text-main overflow-hidden font-sans selection:bg-primary-500/20 relative">
            {/* Mobile Header (< 680px) */}
            <header className="sm:hidden flex items-center justify-between px-3 py-2 bg-surface border-b border-border shrink-0 z-30">
                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={() => setShowMobileDrawer(true)}
                        className="min-h-[44px] min-w-[44px] p-2 text-muted hover:text-main hover:bg-surface-elevated rounded-lg transition-colors flex items-center justify-center"
                        aria-label="Buka menu navigasi"
                    >
                        <Bars3Icon className="w-5 h-5" />
                    </button>
                    <Link href={route("dashboard")} className="flex items-center gap-2">
                        <ApplicationLogo className="w-7 h-7" />
                        <span className="font-display font-bold text-base text-main tracking-tight">
                            ApaPesan
                        </span>
                    </Link>
                </div>
                <div className="flex items-center gap-1">
                    <button
                        type="button"
                        onClick={toggleTheme}
                        className="min-h-[44px] min-w-[44px] p-2 text-muted hover:text-main hover:bg-surface-elevated rounded-lg transition-colors flex items-center justify-center"
                        title={theme === "dark" ? "Ganti ke Tema Terang" : "Ganti ke Tema Gelap"}
                        aria-label={theme === "dark" ? "Ganti ke Tema Terang" : "Ganti ke Tema Gelap"}
                    >
                        {theme === "dark" ? (
                            <SunIcon className="w-5 h-5 text-amber-400" />
                        ) : (
                            <MoonIcon className="w-5 h-5 text-slate-700" />
                        )}
                    </button>
                    <button
                        type="button"
                        onClick={() => setShowCreateGroupModal(true)}
                        className="min-h-[44px] min-w-[44px] p-2 text-primary hover:bg-surface-elevated rounded-lg transition-colors flex items-center justify-center"
                        title="Buat Grup Baru"
                        aria-label="Buat Grup Baru"
                    >
                        <UserGroupIcon className="w-5 h-5" />
                    </button>
                </div>
            </header>

            {/* Mobile Slide-Over Drawer */}
            {showMobileDrawer && (
                <div className="sm:hidden fixed inset-0 z-50 flex">
                    <div
                        className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
                        onClick={() => setShowMobileDrawer(false)}
                    />
                    <div className="relative flex flex-col w-[280px] max-w-[80vw] bg-surface border-r border-border h-full shadow-2xl p-4 justify-between z-10">
                        <div>
                            <div className="flex items-center justify-between pb-4 border-b border-border mb-4">
                                <Link
                                    href={route("dashboard")}
                                    className="flex items-center gap-2.5"
                                    onClick={() => setShowMobileDrawer(false)}
                                >
                                    <ApplicationLogo className="w-8 h-8" />
                                    <span className="font-display font-bold text-lg text-main">
                                        ApaPesan
                                    </span>
                                </Link>
                                <button
                                    type="button"
                                    onClick={() => setShowMobileDrawer(false)}
                                    className="min-h-[44px] min-w-[44px] p-2 text-muted hover:text-main rounded-lg flex items-center justify-center"
                                    aria-label="Tutup menu navigasi"
                                >
                                    <XMarkIcon className="w-5 h-5" />
                                </button>
                            </div>

                            <nav className="space-y-1">
                                <Link
                                    href={route("dashboard")}
                                    onClick={() => setShowMobileDrawer(false)}
                                    className={`min-h-[44px] flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium ${
                                        route().current("dashboard") || route().current("chat.user") || route().current("chat.group")
                                            ? "bg-primary/10 text-primary font-semibold"
                                            : "text-muted hover:text-main hover:bg-surface-elevated"
                                    }`}
                                >
                                    <ChatBubbleLeftRightIcon className="w-5 h-5" />
                                    <span>Percakapan</span>
                                </Link>
                                <Link
                                    href={route("starred.index")}
                                    onClick={() => setShowMobileDrawer(false)}
                                    className={`min-h-[44px] flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium ${
                                        route().current("starred.index")
                                            ? "bg-primary/10 text-primary font-semibold"
                                            : "text-muted hover:text-main hover:bg-surface-elevated"
                                    }`}
                                >
                                    <StarIcon className="w-5 h-5" />
                                    <span>Pesan Berbintang</span>
                                </Link>
                                <Link
                                    href={route("mentions.index")}
                                    onClick={() => setShowMobileDrawer(false)}
                                    className={`min-h-[44px] flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium ${
                                        route().current("mentions.index")
                                            ? "bg-primary/10 text-primary font-semibold"
                                            : "text-muted hover:text-main hover:bg-surface-elevated"
                                    }`}
                                >
                                    <AtSymbolIcon className="w-5 h-5" />
                                    <span>Sebutan</span>
                                </Link>
                                <Link
                                    href={route("pinned.index")}
                                    onClick={() => setShowMobileDrawer(false)}
                                    className={`min-h-[44px] flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium ${
                                        route().current("pinned.index")
                                            ? "bg-primary/10 text-primary font-semibold"
                                            : "text-muted hover:text-main hover:bg-surface-elevated"
                                    }`}
                                >
                                    <BookmarkSquareIcon className="w-5 h-5" />
                                    <span>Pesan Tersemat</span>
                                </Link>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowMobileDrawer(false);
                                        setShowCreateGroupModal(true);
                                    }}
                                    className="min-h-[44px] w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-primary hover:bg-surface-elevated"
                                >
                                    <UserGroupIcon className="w-5 h-5" />
                                    <span>Buat Grup Baru</span>
                                </button>
                            </nav>
                        </div>

                        <div className="pt-4 border-t border-border space-y-2">
                            <button
                                type="button"
                                onClick={toggleTheme}
                                className="min-h-[44px] w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted hover:text-main hover:bg-surface-elevated"
                            >
                                {theme === "dark" ? (
                                    <SunIcon className="w-5 h-5 text-amber-400" />
                                ) : (
                                    <MoonIcon className="w-5 h-5 text-slate-700" />
                                )}
                                <span>{theme === "dark" ? "Tema Terang" : "Tema Gelap"}</span>
                            </button>
                            <Link
                                href={route("profile.edit")}
                                onClick={() => setShowMobileDrawer(false)}
                                className="min-h-[44px] flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted hover:text-main hover:bg-surface-elevated"
                            >
                                <UserCircleIcon className="w-5 h-5" />
                                <span>Pengaturan Profil</span>
                            </Link>
                            <Link
                                href={route("logout")}
                                method="post"
                                as="button"
                                onClick={() => setShowMobileDrawer(false)}
                                className="min-h-[44px] w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-500/10 text-left"
                            >
                                <ArrowLeftOnRectangleIcon className="w-5 h-5" />
                                <span>Keluar</span>
                            </Link>
                        </div>
                    </div>
                </div>
            )}

            {/* Desktop MedTrackr Navigation Rail (>= 680px) */}
            <aside
                className={`hidden sm:flex flex-col justify-between shrink-0 bg-surface border-r border-border transition-all duration-200 z-30 select-none ${
                    isRailExpanded ? "w-[260px]" : "w-[72px]"
                }`}
            >
                {/* Rail Header */}
                <div className="p-3.5 flex items-center justify-between border-b border-border min-h-[64px]">
                    <Link
                        href={route("dashboard")}
                        className="flex items-center gap-3 overflow-hidden"
                        title="ApaPesan Dashboard"
                    >
                        <ApplicationLogo className="w-9 h-9 shrink-0" />
                        {isRailExpanded && (
                            <span className="font-display font-bold text-lg text-main tracking-tight whitespace-nowrap">
                                ApaPesan
                            </span>
                        )}
                    </Link>
                    <button
                        type="button"
                        onClick={() => setIsRailExpanded(!isRailExpanded)}
                        className="min-h-[40px] min-w-[40px] p-2 text-muted hover:text-main hover:bg-surface-elevated rounded-lg transition-colors flex items-center justify-center shrink-0"
                        title={isRailExpanded ? "Ciutkan Navigasi" : "Perluas Navigasi"}
                        aria-label={isRailExpanded ? "Ciutkan Navigasi" : "Perluas Navigasi"}
                    >
                        {isRailExpanded ? (
                            <ChevronLeftIcon className="w-5 h-5" />
                        ) : (
                            <ChevronRightIcon className="w-5 h-5" />
                        )}
                    </button>
                </div>

                {/* Rail Links */}
                <nav className="p-2 space-y-1 overflow-y-auto custom-scrollbar flex-1">
                    {/* Percakapan */}
                    <Link
                        href={route("dashboard")}
                        className={`min-h-[44px] w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                            route().current("dashboard") || route().current("chat.user") || route().current("chat.group")
                                ? "bg-primary/10 text-primary font-semibold"
                                : "text-muted hover:text-main hover:bg-surface-elevated"
                        } ${!isRailExpanded ? "justify-center" : ""}`}
                        title="Percakapan"
                    >
                        <ChatBubbleLeftRightIcon className="w-5 h-5 shrink-0" />
                        {isRailExpanded && <span className="flex-1 truncate">Percakapan</span>}
                        {conversations.length > 0 && (
                            <span
                                className={`px-2 py-0.5 text-xs rounded-full font-bold ${
                                    route().current("dashboard") || route().current("chat.user") || route().current("chat.group")
                                        ? "bg-primary text-white"
                                        : "bg-surface-elevated text-muted border border-border"
                                }`}
                            >
                                {conversations.length}
                            </span>
                        )}
                    </Link>

                    {/* Pesan Berbintang */}
                    <Link
                        href={route("starred.index")}
                        className={`min-h-[44px] w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                            route().current("starred.index")
                                ? "bg-primary/10 text-primary font-semibold"
                                : "text-muted hover:text-main hover:bg-surface-elevated"
                        } ${!isRailExpanded ? "justify-center" : ""}`}
                        title="Pesan Berbintang"
                    >
                        <StarIcon className="w-5 h-5 shrink-0" />
                        {isRailExpanded && <span className="flex-1 truncate">Pesan Berbintang</span>}
                    </Link>

                    {/* Sebutan */}
                    <Link
                        href={route("mentions.index")}
                        className={`min-h-[44px] w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                            route().current("mentions.index")
                                ? "bg-primary/10 text-primary font-semibold"
                                : "text-muted hover:text-main hover:bg-surface-elevated"
                        } ${!isRailExpanded ? "justify-center" : ""}`}
                        title="Sebutan"
                    >
                        <AtSymbolIcon className="w-5 h-5 shrink-0" />
                        {isRailExpanded && <span className="flex-1 truncate">Sebutan</span>}
                    </Link>

                    {/* Pesan Tersemat */}
                    <Link
                        href={route("pinned.index")}
                        className={`min-h-[44px] w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                            route().current("pinned.index")
                                ? "bg-primary/10 text-primary font-semibold"
                                : "text-muted hover:text-main hover:bg-surface-elevated"
                        } ${!isRailExpanded ? "justify-center" : ""}`}
                        title="Pesan Tersemat"
                    >
                        <BookmarkSquareIcon className="w-5 h-5 shrink-0" />
                        {isRailExpanded && <span className="flex-1 truncate">Pesan Tersemat</span>}
                    </Link>

                    {/* Grup Baru Action */}
                    <button
                        type="button"
                        onClick={() => setShowCreateGroupModal(true)}
                        className={`min-h-[44px] w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted hover:text-main hover:bg-surface-elevated transition-colors ${
                            !isRailExpanded ? "justify-center" : ""
                        }`}
                        title="Buat Grup Baru"
                        aria-label="Buat Grup Baru"
                    >
                        <UserGroupIcon className="w-5 h-5 shrink-0 text-primary" />
                        {isRailExpanded && <span className="flex-1 truncate">Grup Baru</span>}
                    </button>
                </nav>

                {/* Rail Footer (Theme Toggle & Profile) */}
                <div className="p-2 border-t border-border space-y-1 shrink-0">
                    {/* Theme Toggle */}
                    <button
                        type="button"
                        onClick={toggleTheme}
                        className={`min-h-[44px] w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-muted hover:text-main hover:bg-surface-elevated transition-colors ${
                            !isRailExpanded ? "justify-center" : ""
                        }`}
                        title={theme === "dark" ? "Ganti ke Tema Terang" : "Ganti ke Tema Gelap"}
                        aria-label={theme === "dark" ? "Ganti ke Tema Terang" : "Ganti ke Tema Gelap"}
                    >
                        {theme === "dark" ? (
                            <SunIcon className="w-5 h-5 text-amber-400 shrink-0" />
                        ) : (
                            <MoonIcon className="w-5 h-5 text-slate-700 shrink-0" />
                        )}
                        {isRailExpanded && (
                            <span className="flex-1 truncate">
                                {theme === "dark" ? "Tema Terang" : "Tema Gelap"}
                            </span>
                        )}
                    </button>

                    {/* User Profile Dropdown */}
                    <Dropdown>
                        <Dropdown.Trigger>
                            <button
                                type="button"
                                className={`min-h-[44px] w-full flex items-center gap-3 p-1.5 rounded-lg hover:bg-surface-elevated transition-colors text-left ${
                                    !isRailExpanded ? "justify-center" : ""
                                }`}
                                aria-label="Menu Pengguna"
                            >
                                <UserAvatar
                                    user={user}
                                    className="w-9 h-9 border border-border shrink-0"
                                />
                                {isRailExpanded && (
                                    <div className="min-w-0 flex-1">
                                        <p className="text-sm font-semibold text-main truncate leading-tight">
                                            {user.name}
                                        </p>
                                        <p className="text-xs text-muted truncate leading-tight mt-0.5">
                                            {user.email}
                                        </p>
                                    </div>
                                )}
                                {isRailExpanded && (
                                    <Cog6ToothIcon className="w-4 h-4 text-muted shrink-0" />
                                )}
                            </button>
                        </Dropdown.Trigger>
                        <Dropdown.Content
                            align={isRailExpanded ? "left" : "right"}
                            direction="up"
                            width="56"
                            contentClasses="bg-surface text-main border border-border rounded-xl shadow-lg p-1"
                        >
                            <Dropdown.Link
                                href={route("profile.edit")}
                                className="min-h-[40px] px-3 py-2 flex items-center gap-2.5 rounded-lg text-sm text-main hover:bg-surface-elevated transition-colors"
                            >
                                <UserCircleIcon className="w-4 h-4 text-muted" /> Profil & Akun
                            </Dropdown.Link>
                            <div className="h-px bg-border my-1"></div>
                            <Dropdown.Link
                                href={route("logout")}
                                method="post"
                                as="button"
                                className="min-h-[40px] px-3 py-2 flex items-center gap-2.5 rounded-lg text-sm text-red-600 dark:text-red-400 hover:bg-red-500/10 w-full text-left transition-colors"
                            >
                                <ArrowLeftOnRectangleIcon className="w-4 h-4" /> Keluar
                            </Dropdown.Link>
                        </Dropdown.Content>
                    </Dropdown>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 flex min-w-0 h-full overflow-hidden relative bg-background">
                {children}
            </main>

            <CreateGroupModal
                show={showCreateGroupModal}
                isOpen={showCreateGroupModal}
                onClose={() => setShowCreateGroupModal(false)}
            />

            <Toast />
            <NewMessageNotification
                show={showNewMessageNotification}
                message={newMessage}
                onClose={() => setShowNewMessageNotification(false)}
            />
        </div>
    );
}
