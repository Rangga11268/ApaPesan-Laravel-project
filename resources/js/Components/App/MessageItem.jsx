import { usePage } from "@inertiajs/react";
import ReactMarkdown from "react-markdown";
import UserAvatar from "./UserAvatar";
import { formatMessageDateLong } from "@/helpers";
import MessageAttachments from "./MessageAttachments";
import MessageOptionsDropdown from "./MessageOptionsDropdown";
import ReadReceipt from "./ReadReceipt";
import ReactionDisplay from "./ReactionDisplay";
import { QuotedMessage } from "./ReplyPreview";

const MessageItem = ({ message, attachmentClick, onReply, onReact }) => {
    const currentUser = usePage().props.auth.user;
    const isCurrentUser = message.sender_id === currentUser.id;

    const handleReactionClick = (messageId, emoji) => {
        if (onReact) {
            onReact(messageId, emoji);
        }
    };

    return (
        <div
            className={`chat message-appear group ${
                isCurrentUser ? "chat-end" : "chat-start"
            }`}
        >
            <div className="chat-image avatar">
                <UserAvatar
                    user={message.sender}
                    className={`w-10 h-10 border shadow-lg ${
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
                {message.edited_at && (
                    <span className="text-[10px] text-gray-500 italic">
                        (edited)
                    </span>
                )}
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
                {/* Options dropdown - visible on hover */}
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <MessageOptionsDropdown
                        message={message}
                        onReply={onReply}
                        isOwn={isCurrentUser}
                    />
                </div>

                {/* Quoted/Reply message */}
                {message.reply_to && (
                    <QuotedMessage replyTo={message.reply_to} />
                )}

                <div
                    className={`chat-message ${
                        isCurrentUser ? "text-white/90 pr-6" : "text-gray-200"
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

                {/* Reactions display */}
                {message.reactions &&
                    Object.keys(message.reactions).length > 0 && (
                        <ReactionDisplay
                            reactions={message.reactions}
                            onReactionClick={handleReactionClick}
                            messageId={message.id}
                        />
                    )}
            </div>

            {/* Read Receipt / Status indicator */}
            {isCurrentUser && (
                <div className="chat-footer mt-1 flex items-center gap-1">
                    <ReadReceipt
                        isSent={true}
                        isRead={!!message.read_at}
                        isOwn={true}
                    />
                </div>
            )}
        </div>
    );
};

export default MessageItem;
