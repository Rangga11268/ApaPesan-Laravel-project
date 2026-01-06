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
    // Active State (Midnight Aurora Highlight)
    const isSelected =
        selectedConversation &&
        selectedConversation.id == conversation.id &&
        selectedConversation.is_group === conversation.is_group;

    let classes = "";
    if (isSelected) {
        classes =
            " bg-white/10 border-l-4 border-l-primary-500 shadow-[0_0_20px_rgba(124,58,237,0.1)]";
    } else {
        classes = " hover:bg-white/5 border-l-4 border-transparent";
    }

    return (
        <Link
            href={
                conversation.is_group
                    ? route("chat.group", conversation)
                    : route("chat.user", conversation)
            }
            preserveState
            className={
                "conversation-item flex items-center gap-3 p-3 text-gray-300 transition-all duration-300 rounded-lg group mb-1 cursor-pointer " +
                classes +
                (conversation.is_user &&
                currentUser.is_admin &&
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
                        className="w-12 h-12 rounded-full border border-white/10 shadow-sm"
                    />
                )}
                {conversation.is_group && <GroupAvatar />}

                {online && (
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full border-2 border-[#05070a] shadow-[0_0_8px_rgba(16,185,129,0.8)]"></div>
                )}
            </div>

            <div className="flex-1 min-w-0 overflow-hidden">
                <div className="flex justify-between items-center mb-0.5">
                    <h3
                        className={`font-semibold text-sm truncate ${
                            isSelected
                                ? "text-white"
                                : "text-gray-200 group-hover:text-white"
                        }`}
                    >
                        {conversation.name}
                    </h3>
                    {conversation.last_message_date && (
                        <span className="text-[10px] text-gray-500 font-medium whitespace-nowrap">
                            {formatMessageDateShort(
                                conversation.last_message_date
                            )}
                        </span>
                    )}
                </div>

                <div className="flex justify-between items-end">
                    <p
                        className={`text-xs truncate max-w-[160px] ${
                            isSelected
                                ? "text-gray-300"
                                : "text-gray-500 group-hover:text-gray-400"
                        }`}
                    >
                        {conversation.last_message ? (
                            conversation.last_message
                        ) : (
                            <span className="italic opacity-50">
                                Started a chat
                            </span>
                        )}
                    </p>

                    {/* Admin Options for Users */}
                    {!!currentUser.is_admin && conversation.is_user && (
                        <div
                            onClick={(e) => e.preventDefault()}
                            className="opacity-0 group-hover:opacity-100 transition-opacity"
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
