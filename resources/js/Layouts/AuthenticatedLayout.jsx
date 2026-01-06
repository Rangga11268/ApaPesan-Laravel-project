import { useState, useEffect } from "react";
import { usePage } from "@inertiajs/react";
import Toast from "@/Components/App/Toast";
import NewMessageNotification from "@/Components/App/NewMessageNotification";
import { useEventBus } from "@/EventBus";

export default function AuthenticatedLayout({ children }) {
    const page = usePage();
    const user = page.props.auth.user;
    const { emit } = useEventBus();
    const [showNewMessageNotification, setShowNewMessageNotification] =
        useState(false);
    const [newMessage, setNewMessage] = useState(null);

    const conversations = page.props.conversation || [];

    useEffect(() => {
        // Echo listeners for private user channel
        const handleNewMessage = (e) => {
            const message = e.message;
            emit("message.created", message);
            if (message.sender_id === user.id) return;
            setNewMessage(message);
            setShowNewMessageNotification(true);
            setTimeout(() => {
                setShowNewMessageNotification(false);
                setNewMessage(null);
            }, 5000);
        };

        const handleMessageDeleted = (e) => {
            emit("message.deleted", {
                message: e.message,
                prevMessage: e.prevMessage,
            });
        };

        window.Echo.private(`message.new.to.user.${user.id}`).listen(
            "SocketMessage",
            handleNewMessage
        );

        window.Echo.private(`message.deleted.user.${user.id}`).listen(
            "SocketMessageDeleted",
            handleMessageDeleted
        );

        // Listen for all groups the user belongs to
        conversations.forEach((conv) => {
            if (conv.is_group) {
                window.Echo.private(`message.group.${conv.id}`)
                    .listen("SocketMessage", handleNewMessage)
                    .listen("SocketMessageDeleted", handleMessageDeleted);
            }
        });

        return () => {
            window.Echo.leave(`message.new.to.user.${user.id}`);
            window.Echo.leave(`message.deleted.user.${user.id}`);
            conversations.forEach((conv) => {
                if (conv.is_group) {
                    window.Echo.leave(`message.group.${conv.id}`);
                }
            });
        };
    }, [user, emit, conversations]);

    return (
        <div className="h-screen w-screen flex flex-col bg-[#05070a] text-white overflow-hidden font-sans selection:bg-primary-500/30 relative">
            {/* Ambient Background Glows - Subtle & Static */}
            <div className="fixed top-[-20%] left-[-10%] w-[50%] h-[50%] bg-primary-900/10 rounded-full blur-[120px] pointer-events-none animate-pulse-soft" />
            <div
                className="fixed bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-emerald-900/10 rounded-full blur-[120px] pointer-events-none animate-pulse-soft"
                style={{ animationDelay: "1s" }}
            />

            {/* Main Content Area - Full Screen Flex */}
            <main className="flex-1 flex relative z-10 w-full h-full max-w-[1920px] mx-auto">
                {children}
            </main>

            <Toast />
            <NewMessageNotification
                show={showNewMessageNotification}
                message={newMessage}
                onClose={() => setShowNewMessageNotification(false)}
            />
        </div>
    );
}
