import React, { useState } from "react";
import { Link } from "@inertiajs/react";
import {
    ArrowLeftIcon,
    MagnifyingGlassIcon,
    ArrowDownTrayIcon,
} from "@heroicons/react/24/outline";
import UserAvatar from "./UserAvatar";
import GroupAvatar from "./GroupAvatar";
import SearchModal from "./SearchModal";
import ExportModal from "./ExportModal";

const ConversationHeader = ({ selectedConversation, isOnline = false }) => {
    const [showSearchModal, setShowSearchModal] = useState(false);
    const [showExportModal, setShowExportModal] = useState(false);

    if (!selectedConversation) {
        return null;
    }

    return (
        <>
            <div className="px-3 py-2.5 sm:px-5 sm:py-3.5 flex justify-between items-center bg-surface border-b border-border sticky top-0 z-40 shadow-xs shrink-0">
                <div className="flex items-center gap-3 min-w-0">
                    <Link
                        href={route("dashboard")}
                        className="min-h-[44px] min-w-[44px] inline-flex sm:hidden items-center justify-center text-muted hover:text-main hover:bg-surface-elevated rounded-lg transition-colors"
                        aria-label="Kembali ke daftar percakapan"
                    >
                        <ArrowLeftIcon className="w-5 h-5" />
                    </Link>

                    <div className="relative shrink-0">
                        {selectedConversation.is_user && (
                            <UserAvatar
                                user={selectedConversation}
                                className="w-10 h-10 border border-border"
                            />
                        )}
                        {selectedConversation.is_group && <GroupAvatar />}
                    </div>

                    <div className="min-w-0 flex-1">
                        <h3 className="font-display font-bold text-base text-main truncate tracking-tight">
                            {selectedConversation.name}
                        </h3>
                        <div className="flex items-center gap-2">
                            {selectedConversation.is_group && (
                                <p className="text-xs text-muted font-medium">
                                    {selectedConversation.users ? selectedConversation.users.length : 0} anggota
                                </p>
                            )}
                            {selectedConversation.is_user && isOnline && (
                                <p className="text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 font-medium">
                                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                                    Online
                                </p>
                            )}
                            {selectedConversation.is_user && !isOnline && (
                                <p className="text-xs text-muted font-normal">
                                    Offline
                                </p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Action Buttons: Search & Export */}
                <div className="flex items-center gap-1 shrink-0">
                    <button
                        type="button"
                        onClick={() => setShowSearchModal(true)}
                        className="min-h-[44px] min-w-[44px] p-2 text-muted hover:text-main hover:bg-surface-elevated rounded-lg transition-colors flex items-center justify-center border border-transparent hover:border-border"
                        title="Cari pesan dalam percakapan"
                        aria-label="Cari pesan dalam percakapan"
                    >
                        <MagnifyingGlassIcon className="w-5 h-5" />
                    </button>

                    <button
                        type="button"
                        onClick={() => setShowExportModal(true)}
                        className="min-h-[44px] min-w-[44px] p-2 text-muted hover:text-main hover:bg-surface-elevated rounded-lg transition-colors flex items-center justify-center border border-transparent hover:border-border"
                        title="Ekspor riwayat percakapan"
                        aria-label="Ekspor riwayat percakapan"
                    >
                        <ArrowDownTrayIcon className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Modals wired to header triggers */}
            <SearchModal
                show={showSearchModal}
                isOpen={showSearchModal}
                onClose={() => setShowSearchModal(false)}
                conversation={selectedConversation}
            />

            <ExportModal
                show={showExportModal}
                isOpen={showExportModal}
                onClose={() => setShowExportModal(false)}
                conversation={selectedConversation}
            />
        </>
    );
};

export default ConversationHeader;
