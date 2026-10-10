import React, { useState, useEffect } from "react";
import Modal from "@/Components/Modal";
import TextInput from "@/Components/TextInput";
import axios from "axios";
import {
    MagnifyingGlassIcon,
    XMarkIcon,
    ChatBubbleLeftIcon,
} from "@heroicons/react/24/outline";
import { router, usePage } from "@inertiajs/react";

const SearchModal = ({ show, isOpen, onClose, conversation = null, currentUser = null }) => {
    const isVisible = Boolean(isOpen ?? show);
    const { auth } = usePage().props;
    const currentUserId = currentUser?.id || auth?.user?.id;

    const [query, setQuery] = useState("");
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searched, setSearched] = useState(false);

    useEffect(() => {
        if (!isVisible) {
            setQuery("");
            setResults([]);
            setSearched(false);
        }
    }, [isVisible]);

    const handleSearch = async (e) => {
        e?.preventDefault();
        if (query.trim().length < 2) return;

        setLoading(true);
        setSearched(true);

        try {
            const response = await axios.get(route("message.search"), {
                params: { query: query.trim() },
            });

            if (response.data.success) {
                setResults(response.data.data);
            }
        } catch (err) {
            console.error("Search failed:", err);
        } finally {
            setLoading(false);
        }
    };

    const navigateToMessage = (message) => {
        if (message.group_id) {
            router.visit(route("chat.group", message.group_id));
        } else {
            const otherUserId =
                message.sender_id === currentUserId
                    ? message.receiver_id
                    : message.sender_id;
            router.visit(route("chat.user", otherUserId));
        }
        onClose();
    };

    const highlightMatch = (text, queryText) => {
        if (!text || !queryText) return text;
        const regex = new RegExp(`(${queryText})`, "gi");
        const parts = text.split(regex);
        return parts.map((part, i) =>
            regex.test(part) ? (
                <mark key={i} className="bg-primary/20 text-main font-semibold px-0.5 rounded">
                    {part}
                </mark>
            ) : (
                part
            )
        );
    };

    return (
        <Modal show={isVisible} onClose={onClose} maxWidth="lg">
            <div className="p-6 bg-surface text-main border border-border rounded-xl min-h-[400px]">
                <div className="flex items-center justify-between mb-6 pb-3 border-b border-border">
                    <div className="flex items-center gap-2">
                        <MagnifyingGlassIcon className="w-5 h-5 text-primary" />
                        <h2 className="text-lg font-display font-bold text-main">
                            Cari Pesan
                        </h2>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="min-h-[44px] min-w-[44px] p-2 hover:bg-surface-elevated text-muted hover:text-main rounded-lg transition-colors flex items-center justify-center"
                        aria-label="Tutup dialog pencarian"
                    >
                        <XMarkIcon className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSearch} className="mb-6">
                    <div className="relative flex items-center">
                        <MagnifyingGlassIcon className="absolute left-3.5 w-5 h-5 text-muted pointer-events-none" />
                        <TextInput
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Ketik kata kunci pesan..."
                            className="w-full pl-11 pr-28 py-2.5 bg-surface-elevated border-border text-main placeholder-muted rounded-lg text-sm focus:border-border-active focus:ring-1 focus:ring-border-active"
                            autoFocus
                        />
                        <button
                            type="submit"
                            disabled={loading || query.trim().length < 2}
                            className="absolute right-1.5 px-4 min-h-[38px] bg-primary hover:bg-primary-600 disabled:opacity-40 text-white rounded-md text-sm font-medium transition-colors flex items-center justify-center"
                        >
                            {loading ? "Mencari..." : "Cari"}
                        </button>
                    </div>
                    <p className="text-xs text-muted mt-1.5 ml-1">
                        Ketik minimal 2 karakter untuk memulai pencarian
                    </p>
                </form>

                <div className="max-h-[380px] overflow-y-auto custom-scrollbar space-y-2">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-16 gap-3">
                            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                            <span className="text-xs text-muted">Sedang mencari pesan...</span>
                        </div>
                    ) : results.length > 0 ? (
                        <div className="space-y-2">
                            {results.map((message) => (
                                <button
                                    key={message.id}
                                    type="button"
                                    onClick={() => navigateToMessage(message)}
                                    className="w-full p-3.5 rounded-lg bg-surface-elevated/70 hover:bg-surface-elevated border border-border text-left transition-colors group flex items-start gap-3"
                                >
                                    <ChatBubbleLeftIcon className="w-5 h-5 text-muted group-hover:text-primary mt-0.5 shrink-0 transition-colors" />
                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-center justify-between gap-2 mb-1">
                                            <span className="text-sm font-semibold text-main truncate">
                                                {message.sender?.name || "Pengguna"}
                                            </span>
                                            <span className="text-xs text-muted whitespace-nowrap">
                                                {new Date(message.created_at).toLocaleDateString("id-ID", {
                                                    day: "numeric",
                                                    month: "short",
                                                    year: "numeric",
                                                })}
                                            </span>
                                        </div>
                                        <p className="text-sm text-muted group-hover:text-main line-clamp-2 transition-colors">
                                            {highlightMatch(message.message, query)}
                                        </p>
                                    </div>
                                </button>
                            ))}
                        </div>
                    ) : searched ? (
                        <div className="text-center py-16 text-muted">
                            <div className="w-12 h-12 rounded-full bg-surface-elevated border border-border flex items-center justify-center mx-auto mb-3 text-muted">
                                <MagnifyingGlassIcon className="w-6 h-6" />
                            </div>
                            <p className="font-medium text-main text-sm">Tidak ada pesan ditemukan</p>
                            <p className="text-xs text-muted mt-1">Coba kata kunci lain untuk "{query}"</p>
                        </div>
                    ) : (
                        <div className="text-center py-16 text-muted">
                            <div className="w-12 h-12 rounded-full bg-surface-elevated border border-border flex items-center justify-center mx-auto mb-3 text-muted">
                                <MagnifyingGlassIcon className="w-6 h-6" />
                            </div>
                            <p className="font-medium text-main text-sm">Cari riwayat percakapan</p>
                            <p className="text-xs text-muted mt-1">Temukan pesan, dokumen, atau informasi penting</p>
                        </div>
                    )}
                </div>
            </div>
        </Modal>
    );
};

export default SearchModal;
