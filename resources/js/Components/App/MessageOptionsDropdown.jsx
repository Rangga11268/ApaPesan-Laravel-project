import { useEventBus } from "@/EventBus";
import { useState, useCallback, useEffect, useRef } from "react";
import { EllipsisVerticalIcon, TrashIcon } from "@heroicons/react/24/outline";
import axios from "axios";

export default function MessageOptionsDropdown({ message }) {
    const { emit } = useEventBus();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    const onDeleteMessage = useCallback((e) => {
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
                alert("Failed to delete message. Please try again.");
            });
    }, [message, emit]);

    const toggleDropdown = useCallback((e) => {
        e.stopPropagation();
        setIsOpen(prev => !prev);
    }, []);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    return (
        <div className="absolute right-full text-gray-100 top-1/2 -translate-y-1/2 z-10">
            <div className="relative inline-block text-left" ref={dropdownRef}>
                <button
                    onClick={toggleDropdown}
                    className="flex justify-center items-center w-8 h-8 rounded-full hover:bg-gray-700 transition-colors"
                >
                    <EllipsisVerticalIcon className="h-5 w-5" />
                </button>
                
                {isOpen && (
                    <div className="absolute left-0 mt-2 w-48 rounded-md bg-gray-800 shadow-lg z-50 ring-1 ring-black ring-opacity-5">
                        <div className="px-1 py-1">
                            <button
                                onClick={onDeleteMessage}
                                className="group flex w-full items-center rounded-md px-2 py-2 text-sm text-gray-100 hover:bg-gray-700 transition-colors"
                            >
                                <TrashIcon className="w-4 h-4 mr-2" />
                                Delete
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
