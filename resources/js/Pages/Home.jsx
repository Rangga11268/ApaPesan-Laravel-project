import ChatLayout from "@/Layouts/ChatLayout";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { useEffect, useState, useRef, useCallback } from "react";
import { ChatBubbleLeftRightIcon } from "@heroicons/react/24/outline";
import ConversationHeader from "@/Components/App/ConversationHeader";
import MessageItem from "@/Components/App/MessageItem";
import MessageInput from "@/Components/App/MessageInput";
import { useEventBus } from "@/EventBus";
import axios from "axios";
import AttachmentPreviewModal from "@/Components/App/AttachmentPreviewModal";
import TypingIndicator from "@/Components/App/TypingIndicator";

function Home({
    selectedConversation = null,
    messages = null,
    onlineUsers = {},
}) {
    const [localMessages, setLocalMessages] = useState([]);
    const [noMoreMessages, setNoMoreMessages] = useState(false);
    const [scrollFromBottom, setScrollFromBottom] = useState(0);
    const messagesCtrRef = useRef(null);
    const loadMoreIntersect = useRef(null);
    const [showAttachmentPreview, setShowAttachmentPreview] = useState(false);
    const [previewAttachment, setPreviewAttachment] = useState({});
    const { on, emit } = useEventBus();

    // New states for enhanced features
    const [typingUser, setTypingUser] = useState(null);
    const [replyTo, setReplyTo] = useState(null);
    const [editingMessage, setEditingMessage] = useState(null);
    const typingTimeoutRef = useRef(null);

    const isOnline =
        selectedConversation &&
        selectedConversation.is_user &&
        !!onlineUsers[selectedConversation.id];

    const messageCreated = (message) => {
        if (selectedConversation) {
            let isCurrentConversation = false;

            if (
                selectedConversation.is_group &&
                selectedConversation.id == message.group_id
            ) {
                isCurrentConversation = true;
            } else if (selectedConversation.is_user) {
                if (
                    message.receiver_id == selectedConversation.id ||
                    message.sender_id == selectedConversation.id
                ) {
                    isCurrentConversation = true;
                }
            }

            if (isCurrentConversation) {
                setLocalMessages((prevMessages) => {
                    if (prevMessages.some((m) => m.id === message.id)) {
                        return prevMessages;
                    }
                    return [...prevMessages, message];
                });

                // Auto scroll to bottom smoothly
                setTimeout(() => {
                    if (messagesCtrRef.current) {
                        messagesCtrRef.current.scrollTo({
                            top: messagesCtrRef.current.scrollHeight,
                            behavior: "smooth",
                        });
                    }
                }, 100);

                // Auto-mark as read if message is from other user
                if (message.sender_id !== selectedConversation.id) {
                    markMessagesAsRead([message.id]);
                }
            }
        }
    };

    const messageDeleted = ({ message }) => {
        if (
            selectedConversation &&
            ((selectedConversation.is_group &&
                selectedConversation.id == message.group_id) ||
                (selectedConversation.is_user &&
                    (selectedConversation.id == message.sender_id ||
                        selectedConversation.id == message.receiver_id)))
        ) {
            setLocalMessages((prevMessages) => {
                return prevMessages.filter((m) => m.id !== message.id);
            });
        }
    };

    // Handle message edited event
    const messageEdited = ({ message }) => {
        setLocalMessages((prevMessages) => {
            return prevMessages.map((m) =>
                m.id === message.id ? { ...m, ...message } : m,
            );
        });
    };

    // Handle message read event
    const messageReadHandler = ({ message_ids, read_at }) => {
        setLocalMessages((prevMessages) => {
            return prevMessages.map((m) =>
                message_ids.includes(m.id) ? { ...m, read_at } : m,
            );
        });
    };

    // Handle reaction event
    const messageReactionHandler = ({ message_id, reactions }) => {
        setLocalMessages((prevMessages) => {
            return prevMessages.map((m) =>
                m.id === message_id ? { ...m, reactions } : m,
            );
        });
    };

    // Handle typing indicator
    const handleTyping = ({ user }) => {
        if (user.id !== selectedConversation?.id) return;

        setTypingUser(user.name);

        // Clear previous timeout
        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }

        // Hide typing indicator after 3 seconds
        typingTimeoutRef.current = setTimeout(() => {
            setTypingUser(null);
        }, 3000);
    };

    // Mark messages as read
    const markMessagesAsRead = useCallback(async (messageIds) => {
        if (!messageIds.length) return;
        try {
            await axios.post(route("message.read"), {
                message_ids: messageIds,
            });
        } catch (err) {
            console.error("Failed to mark as read:", err);
        }
    }, []);

    // Handle reply action
    const handleReply = useCallback((replyData) => {
        setReplyTo(replyData);
        setEditingMessage(null);
    }, []);

    // Handle cancel reply
    const handleCancelReply = useCallback(() => {
        setReplyTo(null);
    }, []);

    // Handle edit message from event
    const handleEditMessage = useCallback((message) => {
        setEditingMessage(message);
        setReplyTo(null);
    }, []);

    // Handle cancel edit
    const handleCancelEdit = useCallback(() => {
        setEditingMessage(null);
    }, []);

    // Handle reaction click (toggle)
    const handleReact = useCallback(async (messageId, emoji) => {
        try {
            await axios.post(route("reaction.store", messageId), { emoji });
        } catch (err) {
            if (err.response?.status === 409) {
                await axios.delete(
                    route("reaction.destroy", { message: messageId, emoji }),
                );
            }
        }
    }, []);

    const loadMoreMessages = useCallback(() => {
        if (noMoreMessages) return;

        const firstMessage = localMessages[0];
        if (!firstMessage) return;

        axios
            .get(route("message.loadOlder", firstMessage.id))
            .then(({ data }) => {
                if (data.data.length === 0) {
                    setNoMoreMessages(true);
                    return;
                }
                const scrollHeight = messagesCtrRef.current.scrollHeight;
                const scrollTop = messagesCtrRef.current.scrollTop;
                const clientHeight = messagesCtrRef.current.clientHeight;
                const tmpScrollFromBottom =
                    scrollHeight - scrollTop - clientHeight;

                setScrollFromBottom(tmpScrollFromBottom);
                setLocalMessages((prevMessages) => {
                    const newMessages = data.data.reverse();
                    const uniqueNewMessages = newMessages.filter(
                        (newMsg) =>
                            !prevMessages.some(
                                (prevMsg) => prevMsg.id === newMsg.id,
                            ),
                    );
                    return [...uniqueNewMessages, ...prevMessages];
                });
            });
    }, [localMessages, noMoreMessages]);

    const onAttachmentClick = (attachments, ind) => {
        setPreviewAttachment({
            attachments,
            ind,
        });
        setShowAttachmentPreview(true);
    };

    useEffect(() => {
        setTimeout(() => {
            if (messagesCtrRef.current) {
                messagesCtrRef.current.scrollTop =
                    messagesCtrRef.current.scrollHeight;
            }
        }, 10);

        const offCreated = on("message.created", messageCreated);
        const offDeleted = on("message.deleted", messageDeleted);
        const offEdited = on("message.edited", messageEdited);
        const offRead = on("message.read", messageReadHandler);
        const offReacted = on("message.reacted", messageReactionHandler);
        const offTyping = on("user.typing", handleTyping);
        const offEdit = on("message.edit", handleEditMessage);

        setLocalMessages(messages ? messages.data.reverse() : []);
        setNoMoreMessages(false);
        setReplyTo(null);
        setEditingMessage(null);
        setTypingUser(null);

        // Mark visible messages as read on load
        if (messages?.data?.length) {
            const unreadIds = messages.data
                .filter(
                    (m) =>
                        !m.read_at && m.sender_id !== selectedConversation?.id,
                )
                .map((m) => m.id);
            if (unreadIds.length) {
                markMessagesAsRead(unreadIds);
            }
        }

        return () => {
            offCreated();
            offDeleted();
            offEdited();
            offRead();
            offReacted();
            offTyping();
            offEdit();
            if (typingTimeoutRef.current) {
                clearTimeout(typingTimeoutRef.current);
            }
        };
    }, [selectedConversation]);

    useEffect(() => {
        if (messagesCtrRef.current && scrollFromBottom !== null) {
            messagesCtrRef.current.scrollTop =
                messagesCtrRef.current.scrollHeight -
                messagesCtrRef.current.clientHeight -
                scrollFromBottom;
        }
    }, [localMessages]);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting) {
                    loadMoreMessages();
                }
            },
            { root: messagesCtrRef.current, threshold: 1.0 },
        );

        if (loadMoreIntersect.current) {
            setTimeout(() => {
                observer.observe(loadMoreIntersect.current);
            }, 500);
        }

        return () => {
            observer.disconnect();
        };
    }, [localMessages]);

    // Format helper for structured date dividers
    const formatMessageDate = (dateString) => {
        if (!dateString) return "";
        const date = new Date(dateString);
        const today = new Date();
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);

        if (date.toDateString() === today.toDateString()) {
            return "Hari ini";
        }
        if (date.toDateString() === yesterday.toDateString()) {
            return "Kemarin";
        }
        return date.toLocaleDateString("id-ID", {
            day: "numeric",
            month: "short",
            year: date.getFullYear() !== today.getFullYear() ? "numeric" : undefined,
        });
    };

    const isDifferentDay = (d1, d2) => {
        if (!d1 || !d2) return true;
        const date1 = new Date(d1);
        const date2 = new Date(d2);
        return date1.toDateString() !== date2.toDateString();
    };

    // Render Empty State
    if (!selectedConversation) {
        return (
            <div className="flex flex-col gap-6 items-center justify-center h-full text-center p-8 bg-background">
                <div className="w-20 h-20 rounded-2xl bg-surface-elevated border border-border flex items-center justify-center shadow-xs">
                    <ChatBubbleLeftRightIcon className="w-10 h-10 text-primary" />
                </div>

                <div className="max-w-md space-y-2">
                    <h3 className="text-2xl font-bold font-display text-main tracking-tight">
                        Selamat Datang di ApaPesan
                    </h3>
                    <p className="text-muted text-sm leading-relaxed">
                        Pilih percakapan dari panel obrolan di sebelah kiri untuk mulai berkirim pesan.
                    </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4 w-full max-w-xl">
                    <div className="bg-surface rounded-xl p-4 border border-border text-left shadow-xs">
                        <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center mb-2.5">
                            <svg
                                className="w-4 h-4 text-primary"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M13 10V3L4 14h7v7l9-11h-7z"
                                />
                            </svg>
                        </div>
                        <h4 className="font-semibold text-main text-sm mb-1">
                            Real-time
                        </h4>
                        <p className="text-xs text-muted">
                            Pesan terkirim instan
                        </p>
                    </div>

                    <div className="bg-surface rounded-xl p-4 border border-border text-left shadow-xs">
                        <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center mb-2.5">
                            <svg
                                className="w-4 h-4 text-primary"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
                                />
                            </svg>
                        </div>
                        <h4 className="font-semibold text-main text-sm mb-1">
                            Group Chat
                        </h4>
                        <p className="text-xs text-muted">
                            Kolaborasi tim mudah
                        </p>
                    </div>

                    <div className="bg-surface rounded-xl p-4 border border-border text-left shadow-xs">
                        <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center mb-2.5">
                            <svg
                                className="w-4 h-4 text-primary"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                                />
                            </svg>
                        </div>
                        <h4 className="font-semibold text-main text-sm mb-1">
                            Terstruktur
                        </h4>
                        <p className="text-xs text-muted">
                            Platform komunikasi terpadu
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <>
            <ConversationHeader
                selectedConversation={selectedConversation}
                isOnline={isOnline}
            />

            <div
                ref={messagesCtrRef}
                className="flex-1 overflow-y-auto sm:p-5 p-3 space-y-2 custom-scrollbar scroll-smooth"
            >
                {localMessages.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-full p-4">
                        <div className="bg-surface-elevated rounded-2xl p-8 border border-border text-center max-w-sm shadow-xs">
                            <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                                <ChatBubbleLeftRightIcon className="w-7 h-7 text-primary" />
                            </div>
                            <p className="text-main font-semibold mb-1">
                                Belum ada pesan
                            </p>
                            <p className="text-muted text-sm">
                                Kirim pesan pertama untuk memulai obrolan.
                            </p>
                        </div>
                    </div>
                )}

                {localMessages.length > 0 && (
                    <div
                        className="h-6 flex items-center justify-center shrink-0 py-2"
                        ref={loadMoreIntersect}
                    >
                        <div className="loading loading-spinner loading-xs text-primary"></div>
                    </div>
                )}

                {localMessages.map((message, index) => {
                    const prevMessage = index > 0 ? localMessages[index - 1] : null;
                    const showDateDivider =
                        !prevMessage ||
                        isDifferentDay(prevMessage.created_at, message.created_at);

                    return (
                        <div key={message.id} className="space-y-2">
                            {showDateDivider && (
                                <div className="flex items-center justify-center my-3">
                                    <span className="px-3 py-1 text-xs font-medium rounded-full bg-surface-elevated border border-border text-muted shadow-xs">
                                        {formatMessageDate(message.created_at)}
                                    </span>
                                </div>
                            )}
                            <MessageItem
                                message={message}
                                attachmentClick={onAttachmentClick}
                                onReply={handleReply}
                                onReact={handleReact}
                            />
                        </div>
                    );
                })}

                {/* Typing Indicator */}
                {typingUser && <TypingIndicator userName={typingUser} />}
            </div>

            <MessageInput
                conversation={selectedConversation}
                replyTo={replyTo}
                onCancelReply={handleCancelReply}
                editingMessage={editingMessage}
                onCancelEdit={handleCancelEdit}
            />

            {previewAttachment.attachments && (
                <AttachmentPreviewModal
                    attachments={previewAttachment.attachments}
                    index={previewAttachment.ind}
                    show={showAttachmentPreview}
                    onClose={() => setShowAttachmentPreview(false)}
                />
            )}
        </>
    );
}

Home.layout = (page) => (
    <AuthenticatedLayout>
        <ChatLayout children={page} />
    </AuthenticatedLayout>
);

export default Home;
