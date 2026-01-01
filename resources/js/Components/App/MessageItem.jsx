import { usePage } from "@inertiajs/react";
import ReactMarkdown from "react-markdown";
import UserAvatar from "./UserAvatar";
import { formatMessageDateLong } from "@/helpers";
import MessageAttachments from "./MessageAttachments";
import MessageOptionsDropdown from "./MessageOptionsDropdown";

const MessageItem = ({ message, attachmentClick }) => {
    const currentUser = usePage().props.auth.user;
    const isCurrentUser = message.sender_id === currentUser.id;

    return (
        <div
            className={`chat message-appear group ${
                isCurrentUser ? "chat-end" : "chat-start"
            }`}
        >
            <div className="chat-image avatar">
                <UserAvatar
                    user={message.sender}
                    profileClassName={`w-10 h-10 border shadow-lg ${
                        isCurrentUser
                            ? "border-primary-500/50"
                            : "border-white/10"
                    }`}
                />
            </div>

            <div className="chat-header text-xs text-gray-400 mb-1 flex items-center gap-2">
                {!isCurrentUser && (
                    <span className="font-bold text-gray-300">
                        {message.sender.name}
                    </span>
                )}
                <time className="opacity-50 text-[10px]">
                    {formatMessageDateLong(message.created_at)}
                </time>
            </div>

            <div
                className={`
                chat-bubble relative shadow-xl backdrop-blur-md border 
                ${
                    isCurrentUser
                        ? "bubble-user text-white border-primary-500/20"
                        : "bubble-guest text-gray-100 border-white/5"
                }
            `}
            >
                {isCurrentUser && (
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <MessageOptionsDropdown message={message} />
                    </div>
                )}

                <div
                    className={`chat-message ${
                        isCurrentUser ? "text-white/90" : "text-gray-200"
                    }`}
                >
                    <div className="chat-message-content prose prose-invert max-w-none prose-p:my-1 prose-pre:bg-black/30 prose-pre:border-white/10 text-sm leading-relaxed">
                        <ReactMarkdown>{message.message}</ReactMarkdown>
                    </div>
                    <MessageAttachments
                        attachments={message.attachments}
                        attachmentClick={attachmentClick}
                    />
                </div>
            </div>

            {/* Read Receipt / Status indicator could go here */}
            {isCurrentUser && (
                <div className="chat-footer opacity-50 text-[10px] mt-1 text-primary-300">
                    Sent
                </div>
            )}
        </div>
    );
};

export default MessageItem;
