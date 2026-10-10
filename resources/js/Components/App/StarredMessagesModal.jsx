import React, { useState, useEffect, useMemo } from "react";
import Modal from "@/Components/Modal";
import axios from "axios";
import {
    StarIcon,
    XMarkIcon,
    MagnifyingGlassIcon,
    UserGroupIcon,
    ChatBubbleOvalLeftIcon,
} from "@heroicons/react/24/outline";
import { StarIcon as StarIconSolid } from "@heroicons/react/24/solid";
import { formatMessageDateLong } from "@/helpers";
import UserAvatar from "./UserAvatar";
import { router, usePage } from "@inertiajs/react";
import { useEventBus } from "@/EventBus";

export default function StarredMessagesModal({ show, onClose }) {
    const { auth } = usePage().props;
    const currentUserId = auth?.user?.id;
    const { emit } = useEventBus();

    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        if (!show) {
            setMessages([]);
            setSearchQuery("");
            return;
        }

        setLoading(true);
        axios
            .get(route("starred.index"))
            .then((res) => {
                const raw = res.data?.data;
                let list = [];
                if (Array.isArray(raw)) {
                    list = raw;
                } else if (raw && Array.isArray(raw.data)) {
                    list = raw.data;
                } else if (raw && typeof raw === "object") {
                    list = Object.values(raw);
                }
                setMessages(list);
            })
            .catch((err) => {
                console.error("Error fetching starred messages:", err);
                setMessages([]);
            })
            .finally(() => setLoading(false));
    }, [show]);

    const navigateToMessage = (message) => {
        onClose();
        if (message.group_id) {
            router.visit(route("chat.group", message.group_id));
        } else {
            const partnerId =
                message.sender_id === currentUserId
                    ? message.receiver_id
                    : message.sender_id;
            if (partnerId) {
                router.visit(route("chat.user", partnerId));
            }
        }
    };

    const handleUnstar = async (e, messageId) => {
        e.stopPropagation();
        try {
            await axios.delete(route("starred.destroy", messageId));
            setMessages((prev) => prev.filter((m) => m.id !== messageId));
            emit("message.starred", { messageId, isStarred: false });
        } catch (err) {
            console.error("Error unstarring message:", err);
        }
    };

    const filteredMessages = useMemo(() => {
        if (!searchQuery.trim()) return messages;
        const q = searchQuery.toLowerCase();
        return messages.filter((m) => {
            const textMatch = m.message?.toLowerCase().includes(q);
            const senderMatch = m.sender?.name?.toLowerCase().includes(q);
            const groupMatch = m.group?.name?.toLowerCase().includes(q);
            return textMatch || senderMatch || groupMatch;
        });
    }, [messages, searchQuery]);

    return (
        <Modal show={show} onClose={onClose} maxWidth="lg">
            <div className="p-4 sm:p-6 bg-surface text-main border border-border rounded-2xl shadow-xl flex flex-col max-h-[85vh]">
                {/* Header */}
                <div className="flex items-center justify-between pb-4 border-b border-border shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-amber-500/10 text-amber-500 rounded-xl">
                            <StarIconSolid className="w-5 h-5 fill-amber-500" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h2 className="text-lg font-display font-bold text-main">
                                    Pesan Berbintang
                                </h2>
                                {!loading && messages.length > 0 && (
                                    <span className="px-2 py-0.5 text-xs font-semibold bg-surface-elevated text-muted border border-border rounded-full">
                                        {messages.length}
                                    </span>
                                )}
                            </div>
                            <p className="text-xs text-muted">
                                Pesan yang Anda simpan sebagai penting
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="min-h-[44px] min-w-[44px] p-2 text-muted hover:text-main rounded-lg hover:bg-surface-elevated transition-colors flex items-center justify-center"
                        aria-label="Tutup jendela"
                    >
                        <XMarkIcon className="w-5 h-5" />
                    </button>
                </div>

                {/* Search Bar (if messages exist) */}
                {messages.length > 3 && (
                    <div className="pt-3 pb-1 shrink-0">
                        <div className="relative">
                            <MagnifyingGlassIcon className="w-4 h-4 text-muted absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Cari isi pesan atau pengirim..."
                                className="w-full pl-9 pr-3 py-2 text-xs bg-surface-elevated border border-border rounded-lg text-main placeholder-muted focus:outline-hidden focus:border-primary transition-colors"
                            />
                        </div>
                    </div>
                )}

                {/* List Container */}
                <div className="mt-3 flex-1 overflow-y-auto custom-scrollbar space-y-2.5 pr-1">
                    {loading ? (
                        <div className="py-12 text-center text-sm text-muted">
                            Memuat pesan berbintang...
                        </div>
                    ) : filteredMessages.length === 0 ? (
                        <div className="py-12 text-center text-sm text-muted px-4">
                            {searchQuery ? (
                                <>
                                    Tidak ada pesan berbintang yang cocok dengan "
                                    <span className="font-semibold text-main">{searchQuery}</span>
                                    "
                                </>
                            ) : (
                                <>
                                    Belum ada pesan yang dibintangi.
                                    <p className="text-xs text-muted/80 mt-1">
                                        Arahkan kursor ke pesan di percakapan dan klik menu opsi untuk memberi bintang.
                                    </p>
                                </>
                            )}
                        </div>
                    ) : (
                        filteredMessages.map((msg) => (
                            <div
                                key={msg.id}
                                onClick={() => navigateToMessage(msg)}
                                className="p-3.5 rounded-xl border border-border bg-surface-elevated/40 hover:bg-surface-elevated transition-colors cursor-pointer group flex items-start gap-3 relative"
                            >
                                <UserAvatar
                                    user={msg.sender}
                                    className="w-9 h-9 border border-border shrink-0 mt-0.5"
                                />
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between gap-2 mb-1.5">
                                        <div className="flex items-center gap-2 truncate">
                                            <span className="text-xs font-semibold text-main truncate">
                                                {msg.sender?.name || "Pengguna"}
                                            </span>
                                            {msg.group ? (
                                                <span className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded bg-surface border border-border text-muted">
                                                    <UserGroupIcon className="w-3 h-3" />
                                                    {msg.group.name}
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded bg-surface border border-border text-muted">
                                                    <ChatBubbleOvalLeftIcon className="w-3 h-3" />
                                                    Pribadi
                                                </span>
                                            )}
                                        </div>

                                        <div className="flex items-center gap-2 shrink-0">
                                            <span className="text-[10px] text-muted font-mono">
                                                {formatMessageDateLong(msg.created_at)}
                                            </span>
                                            <button
                                                type="button"
                                                onClick={(e) => handleUnstar(e, msg.id)}
                                                className="min-h-[36px] min-w-[36px] p-1.5 text-amber-500 hover:text-muted rounded-md hover:bg-surface transition-colors flex items-center justify-center"
                                                title="Hapus Bintang"
                                                aria-label="Hapus Bintang"
                                            >
                                                <StarIconSolid className="w-4 h-4 fill-amber-500" />
                                            </button>
                                        </div>
                                    </div>
                                    <p className="text-sm text-main/90 break-words line-clamp-3 leading-relaxed">
                                        {msg.message ||
                                            (msg.attachments?.length
                                                ? "Lampiran berkas"
                                                : "")}
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
