import { useState, Fragment, useCallback, useEffect } from "react";
import {
    PaperClipIcon,
    PhotoIcon,
    FaceSmileIcon,
    HandThumbUpIcon,
    PaperAirplaneIcon,
    XCircleIcon,
    PencilSquareIcon,
} from "@heroicons/react/24/outline";
import NewMessageInput from "./NewMessageInput";
import CustomAudioPlayer from "../CustomAudioPlayer";
import AttachmentPreview from "./AttachmentPreview";
import ReplyPreview from "./ReplyPreview";
import { isAudio, isImage } from "@/helpers";
import axios from "axios";
import { Popover, Transition } from "@headlessui/react";
import EmojiPicker from "emoji-picker-react";
import AudioRecorder from "./AudioRecorder";
import { useEventBus } from "@/EventBus";
import { useTheme } from "@/Contexts/ThemeContext";

const MessageInput = ({
    conversation = null,
    replyTo = null,
    onCancelReply = null,
    editingMessage = null,
    onCancelEdit = null,
}) => {
    const { theme } = useTheme();
    const [newMessage, setNewMessage] = useState("");
    const [inputErrorMessage, setInputErrorMessage] = useState("");
    const [messageSending, setMessageSending] = useState(false);
    const [chosenFiles, setChosenFiles] = useState([]);
    const [uploadProgress, setUploadProgress] = useState(0);
    const { emit } = useEventBus();

    // Effect to populate input when editing
    useEffect(() => {
        if (editingMessage) {
            setNewMessage(editingMessage.message || "");
        } else {
            setNewMessage("");
        }
    }, [editingMessage]);

    // Handle typing indicator
    const handleTyping = useCallback(() => {
        if (conversation) {
            axios
                .post(route("typing.store"), {
                    receiver_id: conversation.is_user ? conversation.id : null,
                    group_id: conversation.is_group ? conversation.id : null,
                })
                .catch(() => {});
        }
    }, [conversation]);

    // Debounce typing event
    useEffect(() => {
        if (newMessage && !editingMessage) {
            const timeoutId = setTimeout(handleTyping, 2000); // Send typing every 2s while typing
            return () => clearTimeout(timeoutId);
        }
    }, [newMessage, handleTyping, editingMessage]);

    const onFileChange = useCallback((ev) => {
        const files = ev.target.files;

        const updatedFiles = [...files].map((file) => {
            return {
                file: file,
                url: URL.createObjectURL(file),
            };
        });
        ev.target.value = null;
        setChosenFiles((prevFiles) => {
            return [...prevFiles, ...updatedFiles];
        });
    }, []);

    const onSendClick = useCallback(() => {
        if (messageSending) {
            return;
        }

        if (editingMessage) {
            handleUpdateMessage();
            return;
        }

        if (newMessage.trim() === "" && chosenFiles.length === 0) {
            setInputErrorMessage("Type something or select a file");
            setTimeout(() => setInputErrorMessage(""), 3000);
            return;
        }
        const formData = new FormData();
        const clientId =
            typeof crypto !== "undefined" && crypto.randomUUID
                ? crypto.randomUUID()
                : "c_" + Date.now() + "_" + Math.random().toString(36).slice(2, 9);
        formData.append("client_id", clientId);
        chosenFiles.forEach((file) => {
            formData.append("attachments[]", file.file);
        });
        formData.append("message", newMessage);

        if (conversation.is_user) {
            formData.append("receiver_id", conversation.id);
        } else if (conversation.is_group) {
            formData.append("group_id", conversation.id);
        }

        if (replyTo) {
            formData.append("reply_to_id", replyTo.id);
        }

        setMessageSending(true);
        axios
            .post(route("message.store"), formData, {
                onUploadProgress: (progressEvent) => {
                    const percentCompleted = Math.round(
                        (progressEvent.loaded * 100) / progressEvent.total
                    );
                    setUploadProgress(percentCompleted);
                },
            })
            .then((response) => {
                setMessageSending(false);
                setNewMessage("");
                setChosenFiles([]);
                setUploadProgress(0);
                if (onCancelReply) onCancelReply();
                emit("message.created", response.data);
            })
            .catch((error) => {
                setMessageSending(false);
                setUploadProgress(0);
                console.error(error);
            });
    }, [
        newMessage,
        chosenFiles,
        conversation,
        messageSending,
        emit,
        replyTo,
        editingMessage,
    ]);

    const handleUpdateMessage = () => {
        if (!newMessage.trim()) return;
        setMessageSending(true);

        axios
            .patch(route("message.update", editingMessage.id), {
                message: newMessage,
            })
            .then((response) => {
                setMessageSending(false);
                setNewMessage("");
                if (onCancelEdit) onCancelEdit();
                emit("message.edited", response.data); // Emit edit event
            })
            .catch((err) => {
                console.error(err);
                setMessageSending(false);
            });
    };

    const onLikeClick = useCallback(() => {
        if (messageSending) return;
        const formData = new FormData();
        formData.append("message", "👍");
        if (conversation.is_user) {
            formData.append("receiver_id", conversation.id);
        } else if (conversation.is_group) {
            formData.append("group_id", conversation.id);
        }
        axios.post(route("message.store"), formData).then((response) => {
            emit("message.created", response.data);
        });
    }, [conversation, messageSending, emit]);

    const recordedAudioReady = (file, url) => {
        setChosenFiles((prevFiles) => [...prevFiles, { file, url }]);
    };

    return (
        <div className="sm:px-5 px-2 sm:pb-4 pb-3 pt-2 shrink-0 overflow-x-hidden">
            {/* Grounded Message Input Container */}
            <div
                className={`
                bg-surface border border-border rounded-xl shadow-xs transition-colors overflow-hidden
                ${chosenFiles.length > 0 || replyTo ? "p-3" : "p-2"}
            `}
            >
                {/* Reply Preview */}
                {replyTo && (
                    <ReplyPreview
                        replyTo={replyTo}
                        onCancel={() => {
                            if (onCancelReply) onCancelReply();
                        }}
                    />
                )}

                {/* Edit Mode Indicator */}
                {editingMessage && (
                    <div className="flex items-center justify-between px-3 py-1.5 bg-primary/10 border border-primary/20 rounded-lg mb-2 text-primary">
                        <div className="flex items-center gap-2">
                            <PencilSquareIcon className="w-4 h-4" />
                            <span className="text-xs font-semibold">
                                Mengedit pesan
                            </span>
                        </div>
                        <button
                            type="button"
                            onClick={onCancelEdit}
                            className="min-h-[36px] min-w-[36px] flex items-center justify-center text-muted hover:text-main rounded-md transition-colors"
                            aria-label="Batalkan pengeditan"
                        >
                            <XCircleIcon className="w-5 h-5" />
                        </button>
                    </div>
                )}

                {/* Attachments Preview Area */}
                {(chosenFiles.length > 0 ||
                    uploadProgress > 0 ||
                    inputErrorMessage) && (
                    <div className="mb-2 px-1 border-b border-border pb-2">
                        {!!uploadProgress && (
                            <div className="w-full bg-surface-elevated rounded-full h-1 mb-2 overflow-hidden">
                                <div
                                    className="bg-primary h-1 rounded-full transition-all duration-300"
                                    style={{ width: `${uploadProgress}%` }}
                                ></div>
                            </div>
                        )}
                        {inputErrorMessage && (
                            <p className="text-xs text-red-500 mb-2 font-medium bg-red-500/10 px-2.5 py-1 rounded-md inline-block border border-red-500/20">
                                {inputErrorMessage}
                            </p>
                        )}
                        <div className="flex flex-wrap gap-2 max-h-[120px] overflow-y-auto custom-scrollbar">
                            {chosenFiles.map((file) => (
                                <div
                                    key={file.file.name}
                                    className={`relative group flex justify-between items-center p-2 rounded-lg bg-surface-elevated border border-border ${
                                        !isImage(file.file) ? "w-[240px]" : ""
                                    }`}
                                >
                                    {isImage(file.file) && (
                                        <img
                                            src={file.url}
                                            alt=""
                                            className="w-16 h-16 object-cover rounded-md"
                                        />
                                    )}
                                    {isAudio(file.file) && (
                                        <CustomAudioPlayer
                                            file={file}
                                            showVolume={false}
                                        />
                                    )}
                                    {!isAudio(file.file) &&
                                        !isImage(file.file) && (
                                            <AttachmentPreview file={file} />
                                        )}

                                    <button
                                        type="button"
                                        onClick={() =>
                                            setChosenFiles(
                                                chosenFiles.filter(
                                                    (f) =>
                                                        f.file.name !==
                                                        file.file.name
                                                )
                                            )
                                        }
                                        className="absolute -right-2 -top-2 w-6 h-6 rounded-full bg-red-600 text-white flex items-center justify-center hover:bg-red-700 shadow-sm transition-all"
                                        aria-label="Hapus lampiran"
                                    >
                                        <XCircleIcon className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Input Controls */}
                <div className="flex items-end gap-1 sm:gap-1.5">
                    {/* Left Actions (File/Audio) */}
                    <div className="flex items-center shrink-0">
                        <label
                            className="min-h-[44px] min-w-[44px] p-2 text-muted hover:text-main hover:bg-surface-elevated rounded-lg transition-colors flex items-center justify-center relative cursor-pointer"
                            title="Lampirkan Dokumen"
                            aria-label="Lampirkan Dokumen"
                        >
                            <PaperClipIcon className="w-5 h-5" />
                            <input
                                type="file"
                                multiple
                                onChange={onFileChange}
                                className="absolute inset-0 z-20 opacity-0 cursor-pointer disabled:cursor-not-allowed"
                                disabled={Boolean(editingMessage)}
                            />
                        </label>
                        <label
                            className="min-h-[44px] min-w-[44px] p-2 text-muted hover:text-main hover:bg-surface-elevated rounded-lg transition-colors flex items-center justify-center relative cursor-pointer"
                            title="Kirim Foto"
                            aria-label="Kirim Foto"
                        >
                            <PhotoIcon className="w-5 h-5" />
                            <input
                                type="file"
                                multiple
                                accept="image/*"
                                onChange={onFileChange}
                                className="absolute inset-0 z-20 opacity-0 cursor-pointer disabled:cursor-not-allowed"
                                disabled={Boolean(editingMessage)}
                            />
                        </label>
                        {!editingMessage && (
                            <AudioRecorder fileReady={recordedAudioReady} />
                        )}
                    </div>

                    {/* Text Input Container */}
                    <div className="flex-1 min-w-0 relative bg-surface-elevated rounded-lg border border-border focus-within:border-border-active focus-within:ring-1 focus-within:ring-border-active transition-colors min-h-[44px] flex items-center px-1">
                        <NewMessageInput
                            value={newMessage}
                            onSend={onSendClick}
                            onChange={(ev) => {
                                setNewMessage(ev.target.value);
                                handleTyping();
                            }}
                            className="bg-transparent border-none text-main placeholder-muted focus:ring-0 w-full py-2.5 px-3 min-h-[40px] max-h-[140px] text-sm sm:text-base outline-none"
                        />
                    </div>

                    {/* Right Actions (Emoji/Like/Send) */}
                    <div className="flex items-center shrink-0">
                        <Popover className="relative">
                            <Popover.Button
                                type="button"
                                className="min-h-[44px] min-w-[44px] p-2 text-muted hover:text-main hover:bg-surface-elevated rounded-lg transition-colors flex items-center justify-center"
                                aria-label="Buka pemilih emoji"
                            >
                                <FaceSmileIcon className="w-5 h-5" />
                            </Popover.Button>
                            <Popover.Panel className="absolute bottom-full right-0 z-50 mb-3 max-w-[calc(100vw-32px)] sm:max-w-none shadow-xl rounded-xl overflow-hidden border border-border bg-surface origin-bottom-right">
                                <EmojiPicker
                                    theme={theme === "dark" ? "dark" : "light"}
                                    onEmojiClick={(ev) =>
                                        setNewMessage(newMessage + ev.emoji)
                                    }
                                />
                            </Popover.Panel>
                        </Popover>

                        {newMessage.trim() ||
                        chosenFiles.length > 0 ||
                        editingMessage ? (
                            <button
                                type="button"
                                onClick={onSendClick}
                                disabled={messageSending}
                                className="min-h-[44px] min-w-[44px] px-3.5 bg-primary hover:bg-primary-600 disabled:opacity-50 text-white rounded-lg flex items-center justify-center font-medium shadow-xs transition-colors"
                                aria-label="Kirim Pesan"
                            >
                                <PaperAirplaneIcon className="w-5 h-5 -rotate-45" />
                            </button>
                        ) : (
                            <button
                                type="button"
                                onClick={onLikeClick}
                                className="min-h-[44px] min-w-[44px] p-2 text-muted hover:text-primary hover:bg-surface-elevated rounded-lg transition-colors flex items-center justify-center"
                                aria-label="Kirim jempol"
                            >
                                <HandThumbUpIcon className="w-5 h-5 text-primary" />
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MessageInput;
