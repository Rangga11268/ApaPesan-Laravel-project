const UserAvatar = ({ user, online = null, profile = false }) => {
    console.log("UserAvatar online status:", online); 

    const onlineClass =
        online === true
            ? "after:absolute after:block after:w-2 after:h-2 after:bg-green-500 after:rounded-full after:right-1 after:bottom-1 after:border-2 after:border-slate-800"
            : online === false
            ? "after:absolute after:block after:w-2 after:h-2 after:bg-gray-500 after:rounded-full after:right-1 after:bottom-1 after:border-2 after:border-slate-800"
            : "";

    const sizeClass = profile ? "w-40 h-40" : "w-8 h-8";

    return (
        <div className="relative inline-block">
            {user.avatar_url ? (
                <div className={onlineClass}>
                    <img
                        src={user.avatar_url}
                        alt={user.name}
                        className={`rounded-full object-cover ${sizeClass}`}
                    />
                </div>
            ) : (
                <div className={onlineClass}>
                    <div
                        className={`flex items-center justify-center bg-gray-400 text-gray-800 rounded-full ${sizeClass}`}
                    >
                        <span className={profile ? "text-4xl" : "text-sm"}>
                            {user.name.substring(0, 1).toUpperCase()}
                        </span>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserAvatar;
