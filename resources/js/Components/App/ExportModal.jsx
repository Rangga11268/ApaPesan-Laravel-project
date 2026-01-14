import React from "react";
import Modal from "@/Components/Modal";
import SecondaryButton from "@/Components/SecondaryButton";
import { XMarkIcon, DocumentArrowDownIcon } from "@heroicons/react/24/outline";

const ExportModal = ({
    show,
    onClose,
    conversationType,
    conversationId,
    conversationName,
}) => {
    const handleExport = (format) => {
        const url =
            route("chat.export", {
                type: conversationType,
                id: conversationId,
            }) + `?format=${format}`;

        window.open(url, "_blank");
        onClose();
    };

    return (
        <Modal show={show} onClose={onClose} maxWidth="sm">
            <div className="p-6 bg-surface text-white">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-display font-bold">
                        Export Chat
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-1 hover:bg-white/10 rounded-full"
                    >
                        <XMarkIcon className="w-5 h-5" />
                    </button>
                </div>

                <div className="text-center mb-6">
                    <DocumentArrowDownIcon className="w-12 h-12 mx-auto mb-3 text-primary-400" />
                    <p className="text-gray-300">
                        Export your chat history with{" "}
                        <strong>{conversationName}</strong>
                    </p>
                </div>

                <div className="space-y-3">
                    <button
                        onClick={() => handleExport("json")}
                        className="w-full p-4 rounded-lg bg-black/20 hover:bg-white/5 border border-white/10 transition-colors text-left group"
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-primary-500/20 rounded-lg flex items-center justify-center">
                                <span className="text-sm font-mono text-primary-400">
                                    {"{}"}
                                </span>
                            </div>
                            <div>
                                <h3 className="font-medium group-hover:text-primary-300 transition-colors">
                                    JSON Format
                                </h3>
                                <p className="text-xs text-gray-500">
                                    Machine-readable format with all metadata
                                </p>
                            </div>
                        </div>
                    </button>

                    <button
                        onClick={() => handleExport("txt")}
                        className="w-full p-4 rounded-lg bg-black/20 hover:bg-white/5 border border-white/10 transition-colors text-left group"
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-secondary-500/20 rounded-lg flex items-center justify-center">
                                <span className="text-sm font-mono text-secondary-400">
                                    TXT
                                </span>
                            </div>
                            <div>
                                <h3 className="font-medium group-hover:text-secondary-300 transition-colors">
                                    Plain Text
                                </h3>
                                <p className="text-xs text-gray-500">
                                    Simple readable format for printing
                                </p>
                            </div>
                        </div>
                    </button>
                </div>

                <div className="mt-6 flex justify-end">
                    <SecondaryButton onClick={onClose}>Cancel</SecondaryButton>
                </div>
            </div>
        </Modal>
    );
};

export default ExportModal;
