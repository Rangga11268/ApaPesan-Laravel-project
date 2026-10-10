import React, { useState, useEffect } from "react";
import Modal from "@/Components/Modal";
import axios from "axios";
import { StarIcon, XMarkIcon, ArrowTopRightOnSquareIcon } from "@heroicons/react/24/outline";
import { formatMessageDateLong } from "@/helpers";
import UserAvatar from "./UserAvatar";
import { router } from "@inertiajs/react";

export default function StarredMessagesModal({ show, onClose }) {
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!show) {
            setMessages([]);
            return;
        }

        setLoading(true);
        axios
            .get(route("starred.index"))
            .then((res) => {
                if (res.data?.success && res.data?.data) {
                    setMessages(res.data.data);
                }
            })
            .catch((err) => console.error("Error fetching starred messages:", err))
            .finally(() => setLoading(false));
    }, [show]);

    const navigateToMessage = (message) => {
        onClose();
        if (message.group_id) {
            router.visit(route("chat.group", message.group_id));
        } else if (message.sender_id) {
            router.visit(route("chat.user", message.sender_id));
        }
    };

    const handleUnstar = async (e, messageId) => {
        e.stopPropagation();
        try {
            await axios.delete(route("starred.destroy", messageId));
            setMessages((prev) => prev.filter((m) => m.id !== messageId));
        } catch (err) {
            console.error("Error unstarring message:", err);
        }
    };

    return (
        <Modal show={show} onClose={onClose} maxWidth="lg">
            <div className="p-4 sm:p-6 bg-surface text-main border border-border rounded-2xl">
                <div className="flex items-center justify-between pb-4 border-b border-border">
                    <div className="flex items-center gap-2.5">
                        <div className="p-2 bg-amber-500/10 text-amber-500 rounded-lg">
                            <StarIcon className="w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="text-lg font-display font-bold text-main">
                                Pesan Berbintang
                            </h2>
                            <p className="text-xs text-muted">
                                Kumpulan pesan penting yang Anda tandai bintang
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1.5 text-muted hover:text-main rounded-lg hover:bg-surface-elevated transition-colors"
                    >
                        <XMarkIcon className="w-5 h-5" />
                    </button>
                </div>

                <div className="mt-4 max-h-[60vh] overflow-y-auto custom-scrollbar space-y-2.5 pr-1">
                    {loading ? (
                        <div className="py-8 text-center text-sm text-muted">
                            Memuat pesan berbintang...
                        </div>
                    ) : messages.length === 0 ? (
                        <div className="py-12 text-center text-sm text-muted">
                            Belum ada pesan yang dibintangi.
                        </div>
                    ) : (
                        messages.map((msg) => (
                            <div
                                key={msg.id}
                                onClick={() => navigateToMessage(msg)}
                                className="p-3 rounded-xl border border-border bg-surface-elevated/40 hover:bg-surface-elevated transition-colors cursor-pointer group flex items-start gap-3"
                            >
                                <UserAvatar
                                    user={msg.sender}
                                    className="w-9 h-9 border border-border shrink-0 mt-0.5"
                                />
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between gap-2 mb-1">
                                        <span className="text-xs font-semibold text-main truncate">
                                            {msg.sender?.name || "Pengguna"}
                                        </span>
                                        <div className="flex items-center gap-2">
                                            <span className="text-[10px] text-muted">
                                                {formatMessageDateLong(msg.created_at)}
                                            </span>
                                            <button
                                                type="button"
                                                onClick={(e) => handleUnstar(e, msg.id)}
                                                className="text-amber-500 hover:text-muted transition-colors"
                                                title="Hapus Bintang"
                                            >
                                                <StarIcon className="w-4 h-4 fill-amber-500" />
                                            </button>
                                        </div>
                                    </div>
                                    <p className="text-sm text-main/90 break-words line-clamp-3">
                                        {msg.message || (msg.attachments?.length ? "Sent an attachment" : "")}
                                    </p>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </Modal>
    );
}
