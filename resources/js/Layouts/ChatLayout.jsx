import ConversationItem from "@/Components/App/ConversationItem";
import TextInput from "@/Components/TextInput";
import { useEventBus } from "@/EventBus";
import { PencilSquareIcon } from "@heroicons/react/24/outline";
import { usePage, Link } from "@inertiajs/react";
import React, { useEffect, useState, useMemo } from "react";
import Dropdown from "@/Components/Dropdown";
import {
    UserCircleIcon,
    Cog6ToothIcon,
    ArrowLeftOnRectangleIcon,
} from "@heroicons/react/24/outline";

const ChatLayout = ({ children }) => {
    const page = usePage();
    const conversations = page.props.conversation;
    const selectedConversation = page.props.selectedConversation;
    const user = page.props.auth.user;
    const [localConversations, setLocalConversations] = useState([]);
    const [onlineUsers, setOnlineUsers] = useState({});
    const [searchTerm, setSearchTerm] = useState("");
    const isUserOnline = (userId) => onlineUsers[userId];
    const { on } = useEventBus();

    const onSearch = (ev) => {
        setSearchTerm(ev.target.value.toLowerCase());
    };

    useEffect(() => {
        setLocalConversations(conversations);
    }, [conversations]);

    const sortedConversations = useMemo(() => {
        if (!Array.isArray(localConversations)) return [];
        const filtered = localConversations.filter((conv) =>
            conv.name.toLowerCase().includes(searchTerm)
        );
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
    }, [localConversations, searchTerm]);

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
                    newConvs[index] = {
                        ...newConvs[index],
                        last_message: message.message,
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
                        newConvs[index] = {
                            ...newConvs[index],
                            last_message: prevMessage
                                ? prevMessage.message
                                : null,
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
                console.log("Online channel joined. Users:", users);
                setOnlineUsers(
                    Object.fromEntries(users.map((u) => [u.id.toString(), u]))
                );
            })
            .joining((u) => {
                console.log("User joining:", u);
                setOnlineUsers((prev) => ({ ...prev, [u.id.toString()]: u }));
            })
            .leaving((u) =>
                setOnlineUsers((prev) => {
                    console.log("User leaving:", u);
                    const updated = { ...prev };
                    delete updated[u.id.toString()];
                    return updated;
                })
            );
        return () => window.Echo.leave("online");
    }, []);

    return (
        <div className="flex w-full h-full overflow-hidden">
            {/* Sidebar / Left Panel */}
            <div
                className={`
                glass-panel w-full sm:w-[320px] flex flex-col transition-all duration-500 ease-in-out z-20 border-r border-white/5
                ${selectedConversation ? "hidden sm:flex" : "flex"}
            `}
            >
                {/* Header Area */}
                <div className="p-6 pb-4">
                    <div className="flex items-center justify-between mb-6">
                        <h1 className="font-display font-bold text-3xl text-white tracking-tight drop-shadow-lg">
                            Obrolan
                        </h1>
                        <div
                            className="tooltip tooltip-bottom"
                            data-tip="Grup Baru"
                        >
                            <button className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-all group border border-white/5">
                                <PencilSquareIcon className="w-5 h-5 text-gray-400 group-hover:text-primary-400" />
                            </button>
                        </div>
                    </div>

                    <div className="relative group">
                        <TextInput
                            onKeyUp={onSearch}
                            placeholder="Cari..."
                            className="glass-input w-full pl-10 py-3 rounded-xl border-none bg-black/20 focus:bg-black/40"
                        />
                        <div className="absolute left-3 top-3.5 text-gray-500 group-focus-within:text-primary-400 transition-colors">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                                className="w-5 h-5"
                            >
                                <path
                                    fillRule="evenodd"
                                    d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z"
                                    clipRule="evenodd"
                                />
                            </svg>
                        </div>
                    </div>
                </div>

                {/* Conversation List */}
                <div className="flex-1 overflow-y-auto custom-scrollbar px-3 space-y-1 pb-4">
                    {sortedConversations &&
                        sortedConversations.map((conversation) => (
                            <ConversationItem
                                key={`${
                                    conversation.is_group ? "group_" : "user_"
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
                    {sortedConversations.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-20 text-gray-500 opacity-50">
                            <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4">
                                <PencilSquareIcon className="w-8 h-8" />
                            </div>
                            <p className="text-sm">Belum ada percakapan</p>
                        </div>
                    )}
                </div>

                {/* User Profile Footer (Replaces Navbar) */}
                <div className="p-4 border-t border-white/5 bg-[#05070a]/30">
                    <Dropdown>
                        <Dropdown.Trigger>
                            <button className="flex items-center w-full p-2 rounded-xl hover:bg-white/5 transition-colors gap-3 group">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary-600 to-accent-600 p-[2px] shadow-lg shadow-primary-500/20">
                                    <div className="w-full h-full rounded-full bg-[#05070a] flex items-center justify-center overflow-hidden">
                                        {/* Fallback avatar if no image usage, currently just initials */}
                                        <span className="font-display font-bold text-sm text-white">
                                            {user.name
                                                .substring(0, 2)
                                                .toUpperCase()}
                                        </span>
                                    </div>
                                </div>
                                <div className="text-left flex-1 min-w-0">
                                    <p className="text-sm font-bold text-white truncate group-hover:text-primary-300 transition-colors">
                                        {user.name}
                                    </p>
                                    <p className="text-xs text-emerald-400 truncate flex items-center gap-1">
                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                                        Online
                                    </p>
                                </div>
                                <div className="text-gray-500 group-hover:text-white transition-colors">
                                    <Cog6ToothIcon className="w-5 h-5" />
                                </div>
                            </button>
                        </Dropdown.Trigger>
                        <Dropdown.Content contentClasses="glass-panel text-white rounded-xl mb-2 w-56 bottom-full left-0 origin-bottom-left border border-white/10">
                            <Dropdown.Link
                                href={route("profile.edit")}
                                className="hover:bg-white/10 hover:text-primary-300 px-4 py-3 flex items-center gap-2 transition-colors"
                            >
                                <UserCircleIcon className="w-5 h-5" /> Profil
                            </Dropdown.Link>
                            <div className="h-px bg-white/10 my-1"></div>
                            <Dropdown.Link
                                href={route("logout")}
                                method="post"
                                as="button"
                                className="hover:bg-red-500/10 hover:text-red-400 px-4 py-3 flex items-center gap-2 w-full text-left transition-colors"
                            >
                                <ArrowLeftOnRectangleIcon className="w-5 h-5" />{" "}
                                Keluar
                            </Dropdown.Link>
                        </Dropdown.Content>
                    </Dropdown>
                </div>
            </div>

            {/* Main Chat Area */}
            <div
                className={`
                flex-1 flex flex-col h-full relative z-10 transition-all duration-300 bg-gradient-to-br from-transparent to-black/40
                ${
                    !selectedConversation
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
        </div>
    );
};

export default ChatLayout;
