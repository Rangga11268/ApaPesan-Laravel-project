import { useEventBus } from "@/EventBus";
import { useEffect, useState } from "react";
import { v4 as crypto } from "uuid";

export default function Toast({}) {
    const [toasts, setToasts] = useState([]);
    const { on } = useEventBus();

    useEffect(() => {
        on("toast.show", (message) => {
            const uuid = crypto();
            setToasts((oldToast) => [...oldToast, { message, uuid }]);

            setTimeout(() => {
                setToasts((oldToast) =>
                    oldToast.filter((toast) => toast.uuid !== uuid)
                );
            }, 5000);
        });
    }, [on]);

    return (
        <div className="toast toast-top toast-center min-w-[280px] z-50">
            {toasts.map((toast) => (
                <div
                    key={toast.uuid}
                    className="bg-surface border border-border py-3 px-4 text-main rounded-xl shadow-lg animate-enter text-xs font-medium"
                >
                    <span>{toast.message}</span>
                </div>
            ))}
        </div>
    );
}
