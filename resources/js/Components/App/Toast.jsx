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
        <div className="toast toast-top toast-center min-w-[280px]">
            {toasts.map((toast) => (
                <div
                    key={toast.uuid}
                    className="glass-panel bg-[#0f1218]/90 border border-white/10 py-3 px-4 text-white rounded-xl shadow-2xl backdrop-blur-xl animate-enter"
                >
                    <span>{toast.message}</span>
                </div>
            ))}
        </div>
    );
}
