import ConversationItem from "@/Components/App/ConversationItem";
import TextInput from "@/Components/TextInput";
import CreateGroupModal from "@/Components/App/CreateGroupModal";
import { useEventBus } from "@/EventBus";
import {
    PencilSquareIcon,
    MagnifyingGlassIcon,
    XMarkIcon,
    ChatBubbleLeftRightIcon,
    UserGroupIcon,
} from "@heroicons/react/24/outline";
import { usePage, Link } from "@inertiajs/react";
import React, { useEffect, useState, useMemo } from "react";

const ChatLayout = ({ children }) => {
    const page = usePage();
    const conversations = page.props.conversation;
    const selectedConversation = page.props.selectedConversation;
    const user = page.props.auth.user;
    const [localConversations, setLocalConversations] = useState([]);
    const [onlineUsers, setOnlineUsers] = useState({});
    const [searchTerm, setSearchTerm] = useState("");
    const [activeFilter, setActiveFilter] = useState("all"); // 'all', 'direct', 'group'
    const [showCreateGroupModal, setShowCreateGroupModal] = useState(false);
    const isUserOnline = (userId) => onlineUsers[userId];
    const { on } = useEventBus();

    const onSearch = (ev) => {
        setSearchTerm(ev.target.value.toLowerCase());
    };

    useEffect(() => {
        setLocalConversations(conversations || []);
    }, [conversations]);

    const sortedConversations = useMemo(() => {
        if (!Array.isArray(localConversations)) return [];
        let filtered = localConversations.filter((conv) =>
            conv.name.toLowerCase().includes(searchTerm)
        );

        if (activeFilter === "direct") {
            filtered = filtered.filter((c) => c.is_user);
        } else if (activeFilter === "group") {
            filtered = filtered.filter((c) => c.is_group);
        }

        return [...filtered].sort((a, b) => {
            if (a.blocked_at && b.blocked_at) {
                return a.blocked_at > b.blocked_at ? 1 : -1;
            }
            if (a.blocked_at) return 1;
            if (b.blocked_at) return -1;
            if (a.last_message_date && b.last_message_date) {
                return b.last_message_date.localeCompare(a.last_message_date);
            }
            if (a.last_message_date) return -1;
            if (b.last_message_date) return 1;
            return 0;
        });
    }, [localConversations, searchTerm, activeFilter]);

    useEffect(() => {
        const offMessageCreated = on("message.created", (message) => {
            setLocalConversations((prev) => {
                const index = prev.findIndex(
                    (c) =>
                        (message.group_id &&
                            c.is_group &&
                            c.id == message.group_id) ||
                        (!message.group_id &&
                            c.is_user &&
                            (c.id == message.sender_id ||
                                c.id == message.receiver_id))
                );
                if (index > -1) {
                    const newConvs = [...prev];
                    let newMessageText = message.message;
                    if (
                        !newMessageText &&
                        message.attachments &&
                        message.attachments.length > 0
                    ) {
                        newMessageText = "Sent an attachment";
                    }
                    newConvs[index] = {
                        ...newConvs[index],
                        last_message: newMessageText,
                        last_message_date: message.created_at,
                    };
                    return newConvs;
                }
                return prev;
            });
        });

        const offMessageDeleted = on(
            "message.deleted",
            ({ message, prevMessage }) => {
                setLocalConversations((prev) => {
                    const index = prev.findIndex(
                        (c) =>
                            (message.group_id &&
                                c.is_group &&
                                c.id == message.group_id) ||
                            (!message.group_id &&
                                c.is_user &&
                                (c.id == message.sender_id ||
                                    c.id == message.receiver_id))
                    );
                    if (index > -1) {
                        const newConvs = [...prev];
                        let newMessageText = null;

                        if (prevMessage) {
                            if (prevMessage.message) {
                                newMessageText = prevMessage.message;
                            } else if (
                                prevMessage.attachments &&
                                prevMessage.attachments.length > 0
                            ) {
                                newMessageText = "Sent an attachment";
                            }
                        }

                        newConvs[index] = {
                            ...newConvs[index],
                            last_message: newMessageText,
                            last_message_date: prevMessage
                                ? prevMessage.created_at
                                : null,
                        };
                        return newConvs;
                    }
                    return prev;
                });
            }
        );

        return () => {
            offMessageCreated();
            offMessageDeleted();
        };
    }, [on]);

    useEffect(() => {
        if (!window.Echo) return;
        const channel = window.Echo.join("online");
        channel
            .here((users) => {
                setOnlineUsers(
                    Object.fromEntries(users.map((u) => [u.id.toString(), u]))
                );
            })
            .joining((u) => {
                setOnlineUsers((prev) => ({ ...prev, [u.id.toString()]: u }));
            })
            .leaving((u) =>
                setOnlineUsers((prev) => {
                    const updated = { ...prev };
                    delete updated[u.id.toString()];
                    return updated;
                })
            );
        return () => window.Echo.leave("online");
    }, []);

    return (
        <div className="flex w-full h-full overflow-hidden">
            {/* Dedicated Conversation List Pane (320-360px) */}
            <div
                className={`
                w-full sm:w-[320px] md:w-[340px] lg:w-[360px] shrink-0 flex flex-col bg-surface border-r border-border h-full transition-all duration-200 z-20 overflow-hidden
                ${
                    selectedConversation || route().current("profile.edit")
                        ? "hidden sm:flex"
                        : "flex"
                }
            `}
            >
                {/* Header Area */}
                <div className="p-3.5 sm:p-4 border-b border-border space-y-3 shrink-0">
                    <div className="flex items-center justify-between">
                        <h1 className="font-display font-bold text-xl sm:text-2xl text-main tracking-tight">
                            Percakapan
                        </h1>
                        <button
                            type="button"
                            onClick={() => setShowCreateGroupModal(true)}
                            className="min-h-[44px] min-w-[44px] p-2 text-primary hover:text-primary-600 hover:bg-surface-elevated rounded-lg transition-colors flex items-center justify-center border border-border"
                            title="Buat Grup Baru"
                            aria-label="Buat Grup Baru"
                        >
                            <PencilSquareIcon className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Search Input with Clear Button */}
                    <div className="relative flex items-center">
                        <MagnifyingGlassIcon className="absolute left-3 w-4 h-4 text-muted pointer-events-none" />
                        <TextInput
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value.toLowerCase())}
                            placeholder="Cari percakapan..."
                            className="w-full pl-9 pr-8 py-2 bg-surface-elevated border-border text-main placeholder-muted rounded-lg text-sm focus:border-border-active focus:ring-1 focus:ring-border-active"
                        />
                        {searchTerm && (
                            <button
                                type="button"
                                onClick={() => setSearchTerm("")}
                                className="absolute right-2 p-1 text-muted hover:text-main rounded-md"
                                aria-label="Hapus kata kunci pencarian"
                            >
                                <XMarkIcon className="w-4 h-4" />
                            </button>
                        )}
                    </div>

                    {/* Filter Chips */}
                    <div className="flex items-center gap-1.5 pt-0.5">
                        <button
                            type="button"
                            onClick={() => setActiveFilter("all")}
                            className={`min-h-[36px] px-3 py-1 rounded-md text-xs font-semibold transition-colors ${
                                activeFilter === "all"
                                    ? "bg-primary text-white"
                                    : "bg-surface-elevated text-muted hover:text-main border border-border"
                            }`}
                        >
                            Semua
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveFilter("direct")}
                            className={`min-h-[36px] px-3 py-1 rounded-md text-xs font-semibold transition-colors ${
                                activeFilter === "direct"
                                    ? "bg-primary text-white"
                                    : "bg-surface-elevated text-muted hover:text-main border border-border"
                            }`}
                        >
                            Pribadi
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveFilter("group")}
                            className={`min-h-[36px] px-3 py-1 rounded-md text-xs font-semibold transition-colors ${
                                activeFilter === "group"
                                    ? "bg-primary text-white"
                                    : "bg-surface-elevated text-muted hover:text-main border border-border"
                            }`}
                        >
                            Grup
                        </button>
                    </div>
                </div>

                {/* Conversation List */}
                <div className="flex-1 overflow-y-auto custom-scrollbar px-2 py-2 space-y-0.5">
                    {sortedConversations &&
                        sortedConversations.map((conversation) => (
                            <ConversationItem
                                key={`${
                                    conversation.is_group ? "group_" : "user_"
                                }${conversation.id}`}
                                conversation={conversation}
                                online={
                                    conversation.is_user
                                        ? Boolean(isUserOnline(conversation.id))
                                        : null
                                }
                                selectedConversation={selectedConversation}
                            />
                        ))}
                    {sortedConversations.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
                            <div className="w-12 h-12 bg-surface-elevated border border-border rounded-full flex items-center justify-center mb-3 text-muted">
                                <ChatBubbleLeftRightIcon className="w-6 h-6" />
                            </div>
                            <p className="text-main font-semibold text-sm mb-1">
                                {searchTerm ? "Tidak ada percakapan ditemukan" : "Belum ada percakapan"}
                            </p>
                            <p className="text-xs text-muted max-w-[200px]">
                                {searchTerm
                                    ? `Tidak ada hasil yang cocok dengan "${searchTerm}"`
                                    : "Mulai obrolan baru dengan kontak Anda"}
                            </p>
                            {!searchTerm && (
                                <button
                                    type="button"
                                    onClick={() => setShowCreateGroupModal(true)}
                                    className="mt-4 min-h-[40px] px-3.5 py-1.5 text-xs font-semibold bg-primary hover:bg-primary-600 text-white rounded-lg transition-colors flex items-center gap-1.5"
                                >
                                    <UserGroupIcon className="w-4 h-4" />
                                    <span>Buat Grup Baru</span>
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Main Chat Area */}
            <div
                className={`
                flex-1 flex flex-col h-full min-w-0 bg-background relative z-10 transition-colors
                ${
                    !selectedConversation && !route().current("profile.edit")
                        ? "hidden sm:flex items-center justify-center"
                        : "flex"
                }
            `}
            >
                {/* Pass onlineUsers prop to children (Home component) */}
                {children &&
                    React.cloneElement(children, {
                        onlineUsers: onlineUsers,
                    })}
            </div>

            {/* Modal for Group Creation */}
            <CreateGroupModal
                show={showCreateGroupModal}
                isOpen={showCreateGroupModal}
                onClose={() => setShowCreateGroupModal(false)}
            />
        </div>
    );
};

export default ChatLayout;
