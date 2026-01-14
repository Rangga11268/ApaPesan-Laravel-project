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
                m.id === message.id ? { ...m, ...message } : m
            );
        });
    };

    // Handle message read event
    const messageReadHandler = ({ message_ids, read_at }) => {
        setLocalMessages((prevMessages) => {
            return prevMessages.map((m) =>
                message_ids.includes(m.id) ? { ...m, read_at } : m
            );
        });
    };

    // Handle reaction event
    const messageReactionHandler = ({ message_id, reactions }) => {
        setLocalMessages((prevMessages) => {
            return prevMessages.map((m) =>
                m.id === message_id ? { ...m, reactions } : m
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
                    route("reaction.destroy", { message: messageId, emoji })
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
                                (prevMsg) => prevMsg.id === newMsg.id
                            )
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
                        !m.read_at && m.sender_id !== selectedConversation?.id
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
            { root: messagesCtrRef.current, threshold: 1.0 }
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

    // Render Empty State
    if (!selectedConversation) {
        return (
            <div className="flex flex-col gap-6 items-center justify-center h-full text-center p-8 opacity-60 animate-enter">
                <div className="w-32 h-32 rounded-3xl bg-gradient-to-tr from-primary-600/20 to-accent-600/20 flex items-center justify-center backdrop-blur-3xl shadow-[0_0_50px_rgba(124,58,237,0.2)]">
                    <ChatBubbleLeftRightIcon className="w-16 h-16 text-white/50" />
                </div>
                <div className="max-w-md space-y-2">
                    <h3 className="text-3xl font-display font-bold text-white drop-shadow-lg">
                        Welcome to ApaPesan
                    </h3>
                    <p className="text-gray-400 font-light leading-relaxed">
                        Select a conversation from the sidebar to start
                        chatting. <br />
                        Experience the new{" "}
                        <span className="text-primary-400 font-medium">
                            Midnight Aurora
                        </span>{" "}
                        interface.
                    </p>
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
                    <div className="flex flex-col items-center justify-center h-full opacity-30">
                        <p className="text-gray-400 text-sm">
                            No messages yet. Say hello!
                        </p>
                    </div>
                )}

                {localMessages.length > 0 && (
                    <div
                        className="h-4 flex items-center justify-center shrink-0"
                        ref={loadMoreIntersect}
                    >
                        <div className="loading loading-spinner loading-xs text-primary-500/50"></div>
                    </div>
                )}

                {localMessages.map((message) => (
                    <MessageItem
                        key={message.id}
                        message={message}
                        attachmentClick={onAttachmentClick}
                        onReply={handleReply}
                        onReact={handleReact}
                    />
                ))}

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
