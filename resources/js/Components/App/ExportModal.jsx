import React from "react";
import Modal from "@/Components/Modal";
import SecondaryButton from "@/Components/SecondaryButton";
import { XMarkIcon, DocumentArrowDownIcon } from "@heroicons/react/24/outline";

const ExportModal = ({
    show,
    isOpen,
    onClose,
    conversation = null,
    conversationType,
    conversationId,
    conversationName,
}) => {
    const isVisible = Boolean(isOpen ?? show);
    const targetType = conversationType || (conversation?.is_group ? "group" : "user");
    const targetId = conversationId || conversation?.id;
    const targetName = conversationName || conversation?.name || "Percakapan";

    const handleExport = (format) => {
        if (!targetId || !targetType) return;
        const url =
            route("chat.export", {
                type: targetType,
                id: targetId,
            }) + `?format=${format}`;

        window.open(url, "_blank");
        onClose();
    };

    return (
        <Modal show={isVisible} onClose={onClose} maxWidth="sm">
            <div className="p-6 bg-surface text-main border border-border rounded-xl">
                <div className="flex items-center justify-between mb-6 pb-3 border-b border-border">
                    <div className="flex items-center gap-2">
                        <DocumentArrowDownIcon className="w-5 h-5 text-primary" />
                        <h2 className="text-lg font-display font-bold text-main">
                            Ekspor Percakapan
                        </h2>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="min-h-[44px] min-w-[44px] p-2 hover:bg-surface-elevated text-muted hover:text-main rounded-lg transition-colors flex items-center justify-center"
                        aria-label="Tutup dialog ekspor"
                    >
                        <XMarkIcon className="w-5 h-5" />
                    </button>
                </div>

                <div className="text-center mb-6">
                    <div className="w-12 h-12 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-3 text-primary">
                        <DocumentArrowDownIcon className="w-6 h-6" />
                    </div>
                    <p className="text-sm text-muted">
                        Unduh riwayat percakapan dengan{" "}
                        <strong className="text-main font-semibold">{targetName}</strong>
                    </p>
                </div>

                <div className="space-y-3">
                    <button
                        type="button"
                        onClick={() => handleExport("json")}
                        className="w-full p-4 rounded-lg bg-surface-elevated hover:bg-surface-elevated/80 border border-border transition-colors text-left group flex items-center gap-3.5 min-h-[56px]"
                    >
                        <div className="w-10 h-10 bg-primary/10 border border-primary/20 rounded-lg flex items-center justify-center shrink-0">
                            <span className="text-xs font-mono font-bold text-primary">
                                {"{ }"}
                            </span>
                        </div>
                        <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-sm text-main group-hover:text-primary transition-colors">
                                Format JSON
                            </h3>
                            <p className="text-xs text-muted">
                                Data terstruktur lengkap beserta metadata lampiran
                            </p>
                        </div>
                    </button>

                    <button
                        type="button"
                        onClick={() => handleExport("txt")}
                        className="w-full p-4 rounded-lg bg-surface-elevated hover:bg-surface-elevated/80 border border-border transition-colors text-left group flex items-center gap-3.5 min-h-[56px]"
                    >
                        <div className="w-10 h-10 bg-emerald-500/10 border border-emerald-500/20 rounded-lg flex items-center justify-center shrink-0">
                            <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">
                                TXT
                            </span>
                        </div>
                        <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-sm text-main group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                                Dokumen Teks (TXT)
                            </h3>
                            <p className="text-xs text-muted">
                                Format teks sederhana yang mudah dibaca dan dicetak
                            </p>
                        </div>
                    </button>
                </div>

                <div className="mt-6 flex justify-end">
                    <SecondaryButton type="button" onClick={onClose} className="min-h-[44px]">
                        Batal
                    </SecondaryButton>
                </div>
            </div>
        </Modal>
    );
};

export default ExportModal;
