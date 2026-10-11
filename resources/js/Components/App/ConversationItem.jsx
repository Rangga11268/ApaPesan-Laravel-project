import { Link, usePage } from "@inertiajs/react";
import UserAvatar from "./UserAvatar";
import GroupAvatar from "./GroupAvatar";
import UserOptionsDropdown from "./UserOptionsDropdown";
import { formatMessageDateShort } from "@/helpers";

const ConversationItem = ({
    conversation,
    selectedConversation = null,
    online = null,
}) => {
    const page = usePage();
    const currentUser = page.props.auth.user;

    const isSelected =
        selectedConversation &&
        selectedConversation.id == conversation.id &&
        selectedConversation.is_group === conversation.is_group;

    const activeClasses = isSelected
        ? "bg-surface-elevated text-main shadow-xs ring-1 ring-border-active/40 before:absolute before:left-0 before:top-2 before:bottom-2 before:w-1 before:bg-primary-500 before:rounded-r-full"
        : "hover:bg-surface-elevated/60 text-muted hover:text-main";

    return (
        <Link
            href={
                conversation.is_group
                    ? route("chat.group", conversation)
                    : route("chat.user", conversation)
            }
            preserveState
            className={
                "relative conversation-item flex items-center gap-3 px-3 py-2.5 transition-all duration-150 rounded-xl group mb-1 cursor-pointer overflow-hidden " +
                activeClasses +
                (conversation.is_user &&
                currentUser?.is_admin &&
                conversation.blocked_at
                    ? " opacity-50 grayscale"
                    : "")
            }
        >
            <div className="relative shrink-0">
                {conversation.is_user && (
                    <UserAvatar
                        user={conversation}
                        online={online}
                        className="w-11 h-11 rounded-full border border-border"
                    />
                )}
                {conversation.is_group && <GroupAvatar />}
            </div>

            <div className="flex-1 min-w-0 overflow-hidden">
                <div className="flex justify-between items-center mb-0.5">
                    <h3
                        className={`font-semibold text-sm truncate ${
                            isSelected ? "text-main" : "text-main/90 group-hover:text-main"
                        }`}
                    >
                        {conversation.name}
                    </h3>
                    {conversation.last_message_date && (
                        <span className="text-[11px] text-muted whitespace-nowrap ml-2">
                            {formatMessageDateShort(
                                conversation.last_message_date
                            )}
                        </span>
                    )}
                </div>

                <div className="flex justify-between items-center gap-2">
                    <p
                        className={`text-xs truncate ${
                            isSelected
                                ? "text-muted"
                                : "text-muted group-hover:text-main/80"
                        }`}
                    >
                        {conversation.last_message ? (
                            conversation.last_message
                        ) : (
                            <span className="italic opacity-60">
                                Mulai percakapan
                            </span>
                        )}
                    </p>

                    {/* Unread badge if available */}
                    {Boolean(conversation.unread_count && conversation.unread_count > 0) && (
                        <span className="px-2 py-0.5 text-[11px] font-bold bg-primary text-white rounded-full shrink-0">
                            {conversation.unread_count}
                        </span>
                    )}

                    {/* Admin Options for Users */}
                    {Boolean(currentUser?.is_admin && conversation.is_user) && (
                        <div
                            onClick={(e) => e.preventDefault()}
                            className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                        >
                            <UserOptionsDropdown conversation={conversation} />
                        </div>
                    )}
                </div>
            </div>
        </Link>
    );
};

export default ConversationItem;
