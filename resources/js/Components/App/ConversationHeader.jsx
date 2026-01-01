import { Link, usePage } from "@inertiajs/react";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import UserAvatar from "./UserAvatar";
import GroupAvatar from "./GroupAvatar";

const ConversationHeader = ({ selectedConversation }) => {
    return (
        <>
            {selectedConversation && (
                <div className="p-4 flex justify-between items-center glass-light border-b border-white/5 backdrop-blur-xl sticky top-0 z-40 shadow-sm shrink-0">
                    <div className="flex items-center gap-4">
                        <Link
                            href={route("dashboard")}
                            className="inline-block sm:hidden text-gray-400 hover:text-white hover:bg-white/10 p-2 rounded-full transition-all"
                        >
                            <ArrowLeftIcon className="w-6 h-6" />
                        </Link>

                        <div className="relative group cursor-pointer">
                            {/* Glow Effect behind Avatar */}
                            <div className="absolute -inset-1 bg-gradient-to-r from-primary-500 to-accent-500 rounded-full opacity-0 group-hover:opacity-40 blur transition duration-500"></div>
                            <div className="relative">
                                {selectedConversation.is_user && (
                                    <UserAvatar
                                        user={selectedConversation}
                                        profileClassName="w-12 h-12 border-2 border-white/10"
                                    />
                                )}
                                {selectedConversation.is_group && (
                                    <GroupAvatar />
                                )}
                            </div>
                        </div>

                        <div>
                            <h3 className="font-display font-bold text-lg text-white tracking-wide drop-shadow-sm">
                                {selectedConversation.name}
                            </h3>
                            <div className="flex items-center gap-2">
                                {selectedConversation.is_group && (
                                    <p className="text-xs text-primary-300 font-medium">
                                        {selectedConversation.users.length}{" "}
                                        members
                                    </p>
                                )}
                                {selectedConversation.is_user && (
                                    <p className="text-xs text-emerald-400 flex items-center gap-1.5 font-medium tracking-wide bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                                        Online
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default ConversationHeader;
