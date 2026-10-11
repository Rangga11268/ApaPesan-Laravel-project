import { useEventBus } from "@/EventBus";
import { useEffect, useState, useCallback } from "react";
import { v4 as crypto } from "uuid";
import UserAvatar from "./UserAvatar";
import { Link } from "@inertiajs/react";
import { XMarkIcon } from "@heroicons/react/24/outline";

/**
 * Toast notification for incoming messages from users/groups outside the current active chat room.
 */
export default function NewMessageNotification() {
    const [toasts, setToasts] = useState([]);
    const { on } = useEventBus();

    const removeToast = useCallback((uuid) => {
        setToasts((prev) => prev.filter((t) => t.uuid !== uuid));
    }, []);

    useEffect(() => {
        if (!on) return;

        const unsubscribe = on(
            "newMessageNotification",
            ({ message, user, group_id, id }) => {
                const uuid = crypto();
                setToasts((prev) => [
                    ...prev,
                    { message, uuid, user, group_id, id },
                ]);

                // Auto dismiss after 5 seconds
                setTimeout(() => {
                    removeToast(uuid);
                }, 5000);
            }
        );

        return unsubscribe;
    }, [on, removeToast]);

    if (!toasts.length) return null;

    return (
        <div
            className="fixed top-4 right-4 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none px-3 sm:px-0"
            role="region"
            aria-label="Notifikasi Pesan Baru"
        >
            {toasts.map((toast) => (
                <div
                    key={toast.uuid}
                    role="status"
                    aria-live="polite"
                    className="pointer-events-auto bg-surface border border-border rounded-xl p-3 shadow-lg flex items-center justify-between gap-3 text-main animate-enter transition-all duration-200 hover:shadow-xl"
                >
                    <Link
                        href={
                            toast.group_id
                                ? route("chat.group", toast.group_id)
                                : route("chat.user", toast.user?.id)
                        }
                        onClick={() => removeToast(toast.uuid)}
                        className="flex items-center gap-3 flex-1 min-w-0 group"
                    >
                        <UserAvatar
                            user={toast.user}
                            className="w-10 h-10 shrink-0 border border-border"
                        />
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-1">
                                <span className="font-semibold text-xs text-main truncate group-hover:text-primary transition-colors">
                                    {toast.user?.name || "Pesan Baru"}
                                </span>
                                {toast.group_id && (
                                    <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-primary/10 text-primary font-medium shrink-0">
                                        Grup
                                    </span>
                                )}
                            </div>
                            <p className="text-xs text-muted truncate mt-0.5">
                                {toast.message}
                            </p>
                        </div>
                    </Link>

                    <button
                        type="button"
                        onClick={(e) => {
                            e.stopPropagation();
                            removeToast(toast.uuid);
                        }}
                        className="min-h-[28px] min-w-[28px] p-1 text-muted hover:text-main hover:bg-surface-elevated rounded-lg transition-colors flex items-center justify-center shrink-0"
                        title="Tutup notifikasi"
                        aria-label="Tutup notifikasi"
                    >
                        <XMarkIcon className="w-4 h-4" />
                    </button>
                </div>
            ))}
        </div>
    );
}
