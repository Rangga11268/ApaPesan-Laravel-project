const UserAvatar = ({
    user,
    online = null,
    profile = false,
    className = "",
}) => {
    const onlineClass =
        online === true
            ? `after:absolute after:block ${
                  profile
                      ? "after:w-6 after:h-6 after:border-4"
                      : "after:w-2.5 after:h-2.5 after:border-2"
              } after:bg-emerald-500 after:rounded-full after:right-0.5 after:bottom-0.5 after:border-surface`
            : online === false
              ? `after:absolute after:block ${
                    profile
                        ? "after:w-6 after:h-6 after:border-4"
                        : "after:w-2.5 after:h-2.5 after:border-2"
                } after:bg-muted/40 after:rounded-full after:right-0.5 after:bottom-0.5 after:border-surface`
              : "";

    const defaultSize = profile ? "w-40 h-40" : "w-10 h-10";
    const finalClass = className || defaultSize;

    if (!user) {
        return null;
    }

    return (
        <div className={`relative inline-block rounded-full shrink-0 ${finalClass}`}>
            {user.avatar_url ? (
                <div className={`w-full h-full ${onlineClass}`}>
                    <img
                        src={user.avatar_url}
                        alt={user.name || "User"}
                        className="rounded-full object-cover w-full h-full block"
                    />
                </div>
            ) : (
                <div className={`w-full h-full ${onlineClass}`}>
                    <div className="flex items-center justify-center bg-surface-elevated text-main border border-border rounded-full w-full h-full font-semibold">
                        <span className={profile ? "text-4xl" : "text-sm"}>
                            {user.name ? user.name.substring(0, 1).toUpperCase() : "?"}
                        </span>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserAvatar;
