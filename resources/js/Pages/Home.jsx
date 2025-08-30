// import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import ConversationHeader from "@/Components/App/ConversationHeader";
import MessageInput from "@/Components/App/MessageInput";
import MessageItem from "@/Components/App/MessageItem";
import { useEventBus } from "@/EventBus";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import ChatLayout from "@/Layouts/ChatLayout";
import { ChatBubbleLeftRightIcon } from "@heroicons/react/24/outline";
import { useEffect, useState, useRef } from "react";

function Home({ selectedConversation = null, messages = null }) {
    const [localMessages, setLocalMessages] = useState([]);
    const messagesCtrRef = useRef(null);
    const { on } = useEventBus();

    const messageCreated = (message) => {
        if (
            selectedConversation &&
            selectedConversation.is_group &&
            selectedConversation.id == message.group_id
        ) {
            setLocalMessages((prevMessages) => [...prevMessages, message]);
        }
        if (
            selectedConversation &&
            selectedConversation.is_user &&
            (selectedConversation.id == message.sender_id ||
                selectedConversation.id == message.receiver_id)
        ) {
            setLocalMessages((prevMessages) => [...prevMessages, message]);
        }
    };

    useEffect(() => {
        setTimeout(() => {
            if (messagesCtrRef.current) {
                messagesCtrRef.current.scrollTop =
                    messagesCtrRef.current.scrollHeight;
            }
        }, 10);

        const offCreated = on("message.created", messageCreated);

        return () => {
            offCreated();
        };
    }, [selectedConversation]);

    useEffect(() => {
        setLocalMessages(messages ? messages.data.reverse() : []);
    }, [messages]);

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
                                {localMessages.map((message) => (
                                    <MessageItem
                                        key={message.id}
                                        message={message}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                    <MessageInput conversation={selectedConversation} />
                </>
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
