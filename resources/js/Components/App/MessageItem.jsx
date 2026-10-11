import { useState, useEffect } from "react";
import { usePage } from "@inertiajs/react";
import ReactMarkdown from "react-markdown";
import UserAvatar from "./UserAvatar";
import { formatMessageDateLong } from "@/helpers";
import MessageAttachments from "./MessageAttachments";
import MessageOptionsDropdown from "./MessageOptionsDropdown";
import ReadReceipt from "./ReadReceipt";
import ReactionDisplay from "./ReactionDisplay";
import { QuotedMessage } from "./ReplyPreview";
import { StarIcon as StarIconSolid } from "@heroicons/react/24/solid";
import { useEventBus } from "@/EventBus";

const MessageItem = ({ message, attachmentClick, onReply, onReact }) => {
    const currentUser = usePage().props.auth.user;
    const isCurrentUser = message.sender_id === currentUser.id;
    const { on } = useEventBus();

    const [isStarred, setIsStarred] = useState(message.is_starred || false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    useEffect(() => {
        setIsStarred(message.is_starred || false);
    }, [message.is_starred]);

    useEffect(() => {
        if (!on) return;
        const unsub = on(
            "message.starred",
            ({ messageId, isStarred: starredState }) => {
                if (messageId === message.id) {
                    setIsStarred(starredState);
                }
            }
        );
        return unsub;
    }, [message.id, on]);

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
                    className={`w-9 h-9 border ${
                        isCurrentUser
                            ? "border-primary/30"
                            : "border-border"
                    }`}
                />
            </div>

            <div className="chat-header text-xs text-muted mb-1 flex items-center gap-1.5">
                {!isCurrentUser && (
                    <span className="font-semibold text-main mr-1">
                        {message.sender?.name}
                    </span>
                )}
                <time className="text-[11px] text-muted font-normal">
                    {formatMessageDateLong(message.created_at)}
                </time>
                {message.edited_at && (
                    <span className="text-[10px] text-muted italic">
                        (diedit)
                    </span>
                )}
                {isStarred && (
                    <span
                        className="inline-flex items-center text-amber-500 ml-0.5"
                        title="Pesan Berbintang"
                    >
                        <StarIconSolid className="w-3.5 h-3.5 fill-amber-500" />
                    </span>
                )}
            </div>

            <div
                className={`
                chat-bubble relative shadow-xs border overflow-visible min-w-[76px]
                ${
                    isCurrentUser
                        ? "bg-primary text-white border-primary/30 rounded-2xl rounded-tr-xs"
                        : "bg-surface-elevated text-main border-border rounded-2xl rounded-tl-xs"
                }
            `}
            >
                {/* Options dropdown & quick actions toolbar - floats neatly on bubble border */}
                <div
                    className={`absolute top-0 -translate-y-1/2 right-2 z-20 transition-opacity duration-150 ${
                        isMenuOpen
                            ? "opacity-100 pointer-events-auto"
                            : "opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 focus-within:opacity-100"
                    }`}
                >
                    <MessageOptionsDropdown
                        message={message}
                        onReply={onReply}
                        isOwn={isCurrentUser}
                        onOpenChange={setIsMenuOpen}
                    />
                </div>

                {/* Quoted/Reply message */}
                {message.reply_to && (
                    <QuotedMessage replyTo={message.reply_to} />
                )}

                <div
                    className={`chat-message ${
                        isCurrentUser ? "text-white" : "text-main"
                    }`}
                >
                    <div
                        className={`chat-message-content text-sm leading-relaxed ${
                            isCurrentUser
                                ? "prose prose-p:my-1 prose-p:text-white prose-a:text-white prose-a:underline"
                                : "prose prose-p:my-1 prose-p:text-main prose-a:text-primary prose-a:underline"
                        }`}
                    >
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
