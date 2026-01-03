import { useEventBus } from "@/EventBus";
import { useState, useCallback, useEffect, useRef } from "react";
import { EllipsisVerticalIcon, TrashIcon } from "@heroicons/react/24/outline";
import axios from "axios";

export default function MessageOptionsDropdown({ message }) {
    const { emit } = useEventBus();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    const onDeleteMessage = useCallback(
        (e) => {
            e.stopPropagation();
            console.log("Delete message", message.id);

            // Debug the route generation
            const url = route("message.destroy", message.id);
            console.log("Delete URL:", url);

            axios
                .delete(url)
                .then((res) => {
                    console.log("Message deleted successfully", res.data);
                    emit("message.deleted", {
                        message: res.data.deleted_message, // Use the deleted message from response
                        prevMessage: res.data.message,
                    });
                    setIsOpen(false); // Close the dropdown after deletion
                })
                .catch((err) => {
                    console.error("Error deleting message:", err);
                    console.error("Request URL:", err.config?.url);
                    console.error("Request method:", err.config?.method);
                    // Show error to user
                    alert("Gagal menghapus pesan. Silakan coba lagi.");
                });
        },
        [message, emit]
    );

    const toggleDropdown = useCallback((e) => {
        e.stopPropagation();
        setIsOpen((prev) => !prev);
    }, []);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target)
            ) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isOpen]);

    return (
        <div className="relative inline-block text-left" ref={dropdownRef}>
            <button
                onClick={toggleDropdown}
                className="flex justify-center items-center w-6 h-6 rounded-full hover:bg-black/20 text-white/70 hover:text-white transition-all"
            >
                <EllipsisVerticalIcon className="h-4 w-4" />
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-1 w-32 rounded-xl bg-[#0f1218]/95 backdrop-blur-xl border border-white/10 shadow-lg shadow-black/50 z-50 overflow-hidden origin-top-right ring-1 ring-white/5">
                    <div className="p-1">
                        <button
                            onClick={onDeleteMessage}
                            className="group flex w-full items-center gap-2 rounded-lg px-2 py-2 text-xs font-medium text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors"
                        >
                            <TrashIcon className="w-4 h-4" />
                            Hapus Pesan
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
