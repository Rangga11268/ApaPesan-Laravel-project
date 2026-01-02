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
    const { on } = useEventBus();

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
                    // Filter out any messages that are already in the list to prevent duplicates
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

        setLocalMessages(messages ? messages.data.reverse() : []);
        setNoMoreMessages(false);

        return () => {
            offCreated();
            offDeleted();
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
                className="flex-1 overflow-y-auto p-5 space-y-2 custom-scrollbar scroll-smooth"
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
                    />
                ))}
            </div>

            <MessageInput conversation={selectedConversation} />

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
