import ConversationItem from "@/Components/App/ConversationItem";
import TextInput from "@/Components/TextInput";
import { PencilSquareIcon } from "@heroicons/react/24/outline";
import { usePage } from "@inertiajs/react";
import { useEffect, useState } from "react";

const ChatLayout = ({ children }) => {
    const page = usePage();
    const conversation = page.props.conversation;
    const selectedConversation = page.props.selectedConversation;
    const [localConversation, setLocalConversation] = useState([]); 
    const [sortedConversation, setSortedConversation] = useState([]);
    const [onlineUsers, setOnlineUsers] = useState({});
    const isUserOnline = (userId) => onlineUsers[userId];

    console.log("conversation", conversation);
    console.log("selectedConversation", selectedConversation);

    const onSearch = (ev) => {
        const search = ev.target.value.toLowerCase();
        setLocalConversation(
            conversation.filter((conversation) => {
                return conversation.name.toLowerCase().includes(search);
            })
        );
    };

    useEffect(() => {
        if (!Array.isArray(localConversation)) return;

        setSortedConversation(
            [...localConversation].sort((a, b) => {
                if (a.blocked_at && b.blocked_at) {
                    return a.blocked_at > b.blocked_at ? 1 : -1;
                } else if (a.blocked_at) {
                    return 1;
                } else if (b.blocked_at) {
                    return -1;
                }
                if (a.last_message_date && b.last_message_date) {
                    return b.last_message_date.localeCompare(
                        a.last_message_date
                    );
                } else if (a.last_message_date) {
                    return -1;
                } else if (b.last_message_date) {
                    return 1;
                } else {
                    return 0;
                }
            })
        );
    }, [localConversation]);

    useEffect(() => {
        setLocalConversation(conversation);
    }, [conversation]);

    useEffect(() => {
        if (!window.Echo) {
            console.error("Echo is not initialized");
            return;
        }

        console.log("Connecting to presence channel...");

        const channel = window.Echo.join("online");
        channel
            .here((users) => {
                console.log("Users currently online:", users);
                const onlineUsersObj = Object.fromEntries(
                    users.map((user) => [user.id.toString(), user])
                );
                setOnlineUsers(onlineUsersObj);
            })
            .joining((user) => {
                console.log("User joined:", user);
                setOnlineUsers((prev) => ({
                    ...prev,
                    [user.id.toString()]: user,
                }));
            })
            .leaving((user) => {
                console.log("User left:", user);
                setOnlineUsers((prev) => {
                    const updated = { ...prev };
                    delete updated[user.id.toString()];
                    return updated;
                });
            })
            .error((error) => {
                console.error("Echo connection error:", error);
            });

        return () => {
            console.log("Leaving presence channel...");
            window.Echo.leave("online");
        };
    }, []);

    return (
        <>
            <div className="flex-1 w-full flex overflow-hidden">
                <div
                    className={`transition-all w-full sm:w-[220px] md:w-[300px]  bg-slate-800 flex flex-col overflow-hidden
                ${selectedConversation ? "-ml-[100%] sm:ml-0" : ""} `}
                >
                    {/* Title */}
                    <div className="flex items-center justify-between py-2 px-3 text-xl font-medium">
                        My Conversations
                        <div
                            className="tooltip tooltip-left"
                            data-tip="Create new group"
                        >
                            <button className="text-gray-400 hover:text-gray-200">
                                <PencilSquareIcon className="w-4 h-4 inline-block ml-2" />
                            </button>
                        </div>
                    </div>
                    {/* search input */}
                    <div className="p-3">
                        <TextInput
                            onKeyUp={onSearch}
                            placeholder="Filter users and groups"
                            className="w-full"
                        />
                    </div>
                    {/* Conversation */}
                    <div className="flex-1 overflow-auto">
                        {sortedConversation &&
                            sortedConversation.map((conversation) => (
                                <ConversationItem
                                    key={`${
                                        conversation.is_group
                                            ? "group_"
                                            : "user_"
                                    }${conversation.id}`}
                                    conversation={conversation}
                                    online={
                                        conversation.is_user
                                            ? !!isUserOnline(conversation.id)
                                            : null
                                    }
                                    selectedConversation={selectedConversation}
                                />
                            ))}
                    </div>
                </div>
                <div className="flex-1 flex flex-col overflow-hidden">
                    {children}
                </div>
            </div>
        </>
    );
};

export default ChatLayout;
