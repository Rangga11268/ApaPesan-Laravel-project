import React, { useState, useEffect } from "react";
import Modal from "@/Components/Modal";
import TextInput from "@/Components/TextInput";
import axios from "axios";
import {
    MagnifyingGlassIcon,
    XMarkIcon,
    ChatBubbleLeftIcon,
} from "@heroicons/react/24/outline";
import { router } from "@inertiajs/react";

const SearchModal = ({ show, onClose }) => {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searched, setSearched] = useState(false);

    useEffect(() => {
        if (!show) {
            setQuery("");
            setResults([]);
            setSearched(false);
        }
    }, [show]);

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
        // Navigate to the conversation containing this message
        if (message.group_id) {
            router.visit(route("chat.group", message.group_id));
        } else {
            const otherUserId =
                message.sender_id === auth?.user?.id
                    ? message.receiver_id
                    : message.sender_id;
            router.visit(route("chat.user", otherUserId));
        }
        onClose();
    };

    const highlightMatch = (text, query) => {
        if (!text || !query) return text;
        const regex = new RegExp(`(${query})`, "gi");
        const parts = text.split(regex);
        return parts.map((part, i) =>
            regex.test(part) ? (
                <mark key={i} className="bg-primary-500/30 text-white">
                    {part}
                </mark>
            ) : (
                part
            )
        );
    };

    return (
        <Modal show={show} onClose={onClose} maxWidth="lg">
            <div className="p-6 bg-surface text-white min-h-[400px]">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-display font-bold">
                        Search Messages
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-1 hover:bg-white/10 rounded-full"
                    >
                        <XMarkIcon className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSearch} className="mb-6">
                    <div className="relative">
                        <MagnifyingGlassIcon className="absolute left-3 top-3 w-5 h-5 text-gray-500" />
                        <TextInput
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Search for messages..."
                            className="w-full pl-10 pr-20 bg-black/20 border-white/10"
                            autoFocus
                        />
                        <button
                            type="submit"
                            disabled={loading || query.trim().length < 2}
                            className="absolute right-2 top-1.5 px-3 py-1.5 bg-primary-500 hover:bg-primary-600 disabled:opacity-50 rounded-lg text-sm transition-colors"
                        >
                            {loading ? "Searching..." : "Search"}
                        </button>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                        Enter at least 2 characters
                    </p>
                </form>

                <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <div className="loading loading-spinner loading-md text-primary-500"></div>
                        </div>
                    ) : results.length > 0 ? (
                        <div className="space-y-2">
                            {results.map((message) => (
                                <button
                                    key={message.id}
                                    onClick={() => navigateToMessage(message)}
                                    className="w-full p-3 rounded-lg bg-black/20 hover:bg-white/5 text-left transition-colors group"
                                >
                                    <div className="flex items-start gap-3">
                                        <ChatBubbleLeftIcon className="w-5 h-5 text-gray-500 mt-0.5 shrink-0" />
                                        <div className="min-w-0 flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="text-sm font-medium text-primary-400">
                                                    {message.sender?.name}
                                                </span>
                                                <span className="text-xs text-gray-500">
                                                    {new Date(
                                                        message.created_at
                                                    ).toLocaleDateString()}
                                                </span>
                                            </div>
                                            <p className="text-sm text-gray-300 line-clamp-2">
                                                {highlightMatch(
                                                    message.message,
                                                    query
                                                )}
                                            </p>
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    ) : searched ? (
                        <div className="text-center py-12 text-gray-500">
                            <MagnifyingGlassIcon className="w-12 h-12 mx-auto mb-3 opacity-50" />
                            <p>No messages found for "{query}"</p>
                        </div>
                    ) : (
                        <div className="text-center py-12 text-gray-500">
                            <MagnifyingGlassIcon className="w-12 h-12 mx-auto mb-3 opacity-50" />
                            <p>Search through your chat history</p>
                        </div>
                    )}
                </div>
            </div>
        </Modal>
    );
};

export default SearchModal;
