import React, { useState, useEffect } from "react";
import Modal from "@/Components/Modal";
import axios from "axios";
import { AtSymbolIcon, XMarkIcon, CheckIcon } from "@heroicons/react/24/outline";
import { formatMessageDateLong } from "@/helpers";
import UserAvatar from "./UserAvatar";
import { router } from "@inertiajs/react";

export default function MentionsModal({ show, onClose }) {
    const [mentions, setMentions] = useState([]);
    const [loading, setLoading] = useState(false);

    const fetchMentions = () => {
        setLoading(true);
        axios
            .get(route("mentions.index"))
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
                setMentions(list);
            })
            .catch((err) => console.error("Error fetching mentions:", err))
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        if (!show) {
            setMentions([]);
            return;
        }
        fetchMentions();
    }, [show]);

    const navigateToMention = async (mention) => {
        try {
            if (!mention.is_read) {
                await axios.post(route("mentions.read"), {
                    mention_ids: [mention.id],
                });
            }
        } catch (err) {
            console.error("Error marking mention as read:", err);
        }

        onClose();
        const msg = mention.message;
        if (msg?.group_id) {
            router.visit(route("chat.group", msg.group_id));
        } else if (msg?.sender_id) {
            router.visit(route("chat.user", msg.sender_id));
        }
    };

    const handleMarkAllRead = async () => {
        try {
            await axios.post(route("mentions.read-all"));
            setMentions((prev) => prev.map((m) => ({ ...m, is_read: true })));
        } catch (err) {
            console.error("Error marking all mentions read:", err);
        }
    };

    return (
        <Modal show={show} onClose={onClose} maxWidth="lg">
            <div className="p-4 sm:p-6 bg-surface text-main border border-border rounded-2xl">
                <div className="flex items-center justify-between pb-4 border-b border-border">
                    <div className="flex items-center gap-2.5">
                        <div className="p-2 bg-primary/10 text-primary rounded-lg">
                            <AtSymbolIcon className="w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="text-lg font-display font-bold text-main">
                                Sebutan Anda (@)
                            </h2>
                            <p className="text-xs text-muted">
                                Pesan dari percakapan yang menyebut nama Anda
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        {mentions.some((m) => !m.is_read) && (
                            <button
                                type="button"
                                onClick={handleMarkAllRead}
                                className="text-xs text-primary hover:underline font-medium"
                            >
                                Tandai Semua Dibaca
                            </button>
                        )}
                        <button
                            onClick={onClose}
                            className="p-1.5 text-muted hover:text-main rounded-lg hover:bg-surface-elevated transition-colors"
                        >
                            <XMarkIcon className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                <div className="mt-4 max-h-[60vh] overflow-y-auto custom-scrollbar space-y-2.5 pr-1">
                    {loading ? (
                        <div className="py-8 text-center text-sm text-muted">
                            Memuat sebutan...
                        </div>
                    ) : mentions.length === 0 ? (
                        <div className="py-12 text-center text-sm text-muted">
                            Belum ada pesan yang menyebut Anda.
                        </div>
                    ) : (
                        mentions.map((mention) => (
                            <div
                                key={mention.id}
                                onClick={() => navigateToMention(mention)}
                                className={`p-3 rounded-xl border transition-colors cursor-pointer group flex items-start gap-3 ${
                                    !mention.is_read
                                        ? "bg-primary/5 border-primary/30"
                                        : "bg-surface-elevated/40 border-border hover:bg-surface-elevated"
                                }`}
                            >
                                <UserAvatar
                                    user={mention.mentioned_by}
                                    className="w-9 h-9 border border-border shrink-0 mt-0.5"
                                />
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between gap-2 mb-1">
                                        <span className="text-xs font-semibold text-main truncate">
                                            {mention.mentioned_by?.name || "Pengguna"}
                                        </span>
                                        <span className="text-[10px] text-muted">
                                            {formatMessageDateLong(mention.created_at)}
                                        </span>
                                    </div>
                                    <p className="text-sm text-main/90 break-words line-clamp-3">
                                        {mention.message?.message || "Sent an attachment"}
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
