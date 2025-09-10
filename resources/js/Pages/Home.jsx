// import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import AttachmentPreviewModal from "@/Components/App/AttachmentPreview";
import ConversationHeader from "@/Components/App/ConversationHeader";
import { isPreviewable } from "@/helpers";
import MessageInput from "@/Components/App/MessageInput";
import MessageItem from "@/Components/App/MessageItem";
import { useEventBus } from "@/EventBus";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import ChatLayout from "@/Layouts/ChatLayout";
import { ChatBubbleLeftRightIcon } from "@heroicons/react/24/outline";
import axios from "axios";
import {
    useEffect,
    useState,
    useRef,
    useCallback,
    useMemo,
    useLayoutEffect,
} from "react";

function Home({ selectedConversation = null, messages = null }) {
    const [localMessages, setLocalMessages] = useState([]);
    const [noMoreMessages, setNoMoreMessages] = useState(false);
    const [loadingOlder, setLoadingOlder] = useState(false);
    const [scrollFromBottom, setScrollFromBottom] = useState(0);
    const loadMoreIntersect = useRef(null);
    const messagesCtrRef = useRef(null);
    const [showAttachmentPreview, setShowAttachmentPreview] = useState(false);
    const [previewAttachment, setPreviewAttachment] = useState({});
    const { on } = useEventBus();

    const messageCreated = useCallback(
        (message) => {
            if (
                selectedConversation &&
                ((selectedConversation.is_group &&
                    selectedConversation.id == message.group_id) ||
                    (selectedConversation.is_user &&
                        (selectedConversation.id == message.sender_id ||
                            selectedConversation.id == message.receiver_id)))
            ) {
                const container = messagesCtrRef.current;
                const atBottom = container
                    ? container.scrollHeight -
                          container.scrollTop -
                          container.clientHeight <
                      50
                    : true;

                setLocalMessages((prevMessages) => {
                    // Check if message already exists
                    if (prevMessages.some((m) => m.id === message.id)) {
                        return prevMessages;
                    }
                    // Add the new message and ensure it's sorted properly
                    const newMessages = [...prevMessages, message];
                    return newMessages.sort((a, b) => 
                        new Date(a.created_at) - new Date(b.created_at)
                    );
                });

                if (atBottom) {
                    setScrollFromBottom(0);
                }
            }
        },
        [selectedConversation]
    );

    const MessageDeleted = useCallback(
        ({ message, prevMessage }) => {
            console.log("Received message.deleted event", { message, prevMessage, selectedConversation });
            if (
                selectedConversation &&
                ((selectedConversation.is_group &&
                    selectedConversation.id == message.group_id) ||
                    (selectedConversation.is_user &&
                        (selectedConversation.id == message.sender_id ||
                            selectedConversation.id == message.receiver_id)))
            ) {
                console.log("Processing message deletion for current conversation");
                setLocalMessages((prevMessages) => {
                    // Check if the message actually exists in the current list
                    const messageExists = prevMessages.some((m) => m.id === message.id);
                    console.log("Message exists in current list:", messageExists);
                    if (!messageExists) {
                        return prevMessages; // No change needed
                    }
                    const newMessages = prevMessages.filter((m) => m.id !== message.id);
                    console.log("Messages after deletion:", newMessages);
                    return newMessages;
                });
            } else {
                console.log("Message not in current conversation, ignoring");
            }
        },
        [selectedConversation]
    );

    const loadMoreMessages = useCallback(() => {
        if (noMoreMessages || loadingOlder) {
            return;
        }
        setLoadingOlder(true);

        const firstMessage = localMessages[0];
        if (!firstMessage) {
            setLoadingOlder(false);
            return;
        }
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
                setScrollFromBottom(scrollHeight - scrollTop - clientHeight);
                setLocalMessages((prevMessages) => {
                    // Filter out any duplicates
                    const newMessages = data.data.filter(
                        newMsg => !prevMessages.some(existingMsg => existingMsg.id === newMsg.id)
                    );
                    return [...newMessages.reverse(), ...prevMessages];
                });
            })
            .finally(() => {
                setLoadingOlder(false);
            });
    }, [localMessages, noMoreMessages, loadingOlder]);

    useEffect(() => {
        // Only set up event listeners if we have a selected conversation
        if (!selectedConversation) return;

        // Clean up any existing listeners first
        let offCreated, offDeleted;
        
        const setupListeners = () => {
            offCreated = on("message.created", messageCreated);
            offDeleted = on("message.deleted", MessageDeleted);
        };

        // Set up the listeners
        setupListeners();

        setTimeout(() => {
            if (messagesCtrRef.current) {
                messagesCtrRef.current.scrollTop =
                    messagesCtrRef.current.scrollHeight;
            }
        }, 10);

        setScrollFromBottom(0);
        setNoMoreMessages(false);

        return () => {
            if (offCreated) offCreated();
            if (offDeleted) offDeleted();
        };
    }, [selectedConversation, on, messageCreated, MessageDeleted]);

    const processedMessages = useMemo(() => {
        if (!messages) return [];
        
        // Ensure messages are unique and sorted
        const uniqueMessages = messages.data
            .filter((message, index, self) => 
                index === self.findIndex(m => m.id === message.id)
            )
            .sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
        
        return uniqueMessages;
    }, [messages]);

    useEffect(() => {
        setLocalMessages(processedMessages);
    }, [processedMessages]);

    useEffect(() => {
        if (noMoreMessages) {
            return;
        }

        const observer = new IntersectionObserver(
            (entries) =>
                entries.forEach(
                    (entry) => entry.isIntersecting && loadMoreMessages()
                ),
            {
                rootMargin: "0px 0px 250px 0px",
            }
        );
        if (loadMoreIntersect.current) {
            setTimeout(() => {
                observer.observe(loadMoreIntersect.current);
            }, 100);
        }

        return () => {
            observer.disconnect();
        };
    }, [localMessages, noMoreMessages, loadMoreMessages]);

    const onAttachmentClick = (attachments, ind) => {
        const clickedAttachment = attachments[ind];
        if (!isPreviewable(clickedAttachment)) {
            return;
        }

        setPreviewAttachment({
            attachments,
            ind,
        });
        setShowAttachmentPreview(true);
    };

    return (
        <>
            {!messages && (
                <div className="flex flex-col gap-8 justify-center items-center text-center h-full opacity-35">
                    <div className="text-2xl md:text-4xl p-16 text-slate-200">
                        Please select conversation to see messages
                    </div>
                    <ChatBubbleLeftRightIcon className="h-32 w-32 inline-block" />
                </div>
            )}
            {messages && (
                <>
                    <ConversationHeader
                        selectedConversation={selectedConversation}
                    />
                    <div
                        ref={messagesCtrRef}
                        className="flex-1 overflow-y-auto p-5"
                    >
                        {localMessages.length === 0 && (
                            <div className="flex justify-center items-center h-full">
                                <div className="text-lg text-slate-200 ">
                                    No messages found.
                                </div>
                            </div>
                        )}
                        {localMessages.length > 0 && (
                            <div className="flex-1 flex flex-col">
                                <div ref={loadMoreIntersect}></div>
                                {localMessages.map((message) => (
                                    <MessageItem
                                        key={message.id}
                                        message={message}
                                        attachmentClick={onAttachmentClick}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                    <MessageInput conversation={selectedConversation} />
                </>
            )}

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

Home.layout = (page) => {
    return (
        <AuthenticatedLayout user={page.props.auth.user}>
            <ChatLayout children={page} />
        </AuthenticatedLayout>
    );
};

export default Home;
