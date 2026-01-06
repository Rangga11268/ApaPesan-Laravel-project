import { useState, Fragment, useCallback } from "react";
import {
    PaperClipIcon,
    PhotoIcon,
    FaceSmileIcon,
    HandThumbUpIcon,
    PaperAirplaneIcon,
    XCircleIcon,
} from "@heroicons/react/24/outline";
import NewMessageInput from "./NewMessageInput";
import CustomAudioPlayer from "../CustomAudioPlayer";
import AttachmentPreview from "./AttachmentPreview";
import { isAudio, isImage } from "@/helpers";
import axios from "axios";
import { Popover, Transition } from "@headlessui/react";
import EmojiPicker from "emoji-picker-react";
import AudioRecorder from "./AudioRecorder";

import { useEventBus } from "@/EventBus";

const MessageInput = ({ conversation = null }) => {
    const [newMessage, setNewMessage] = useState("");
    const [inputErrorMessage, setInputErrorMessage] = useState("");
    const [messageSending, setMessageSending] = useState(false);
    const [chosenFiles, setChosenFiles] = useState([]);
    const [uploadProgress, setUploadProgress] = useState(0);
    const { emit } = useEventBus();

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
        if (newMessage.trim() === "" && chosenFiles.length === 0) {
            setInputErrorMessage("Type something or select a file");
            setTimeout(() => setInputErrorMessage(""), 3000);
            return;
        }
        const formData = new FormData();
        chosenFiles.forEach((file) => {
            formData.append("attachments[]", file.file);
        });
        formData.append("message", newMessage);
        if (conversation.is_user) {
            formData.append("receiver_id", conversation.id);
        } else if (conversation.is_group) {
            formData.append("group_id", conversation.id);
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
                // Emit event to update UI immediately
                emit("message.created", response.data);
            })
            .catch((error) => {
                setMessageSending(false);
                setUploadProgress(0);
                console.error(error);
            });
    }, [newMessage, chosenFiles, conversation, messageSending, emit]);

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
        <div className="sm:px-5 px-2 sm:pb-6 pb-4 pt-2 shrink-0">
            {/* Floating Glass Capsule */}
            <div
                className={`
                glass-light border border-white/10 rounded-2xl shadow-2xl backdrop-blur-2xl transition-all duration-300
                ${chosenFiles.length > 0 ? "p-4" : "p-2"}
            `}
            >
                {/* Attachments Preview Area */}
                {(chosenFiles.length > 0 ||
                    uploadProgress > 0 ||
                    inputErrorMessage) && (
                    <div className="mb-3 px-2 border-b border-white/5 pb-3">
                        {!!uploadProgress && (
                            <div className="w-full bg-gray-700/50 rounded-full h-1 mb-2 overflow-hidden">
                                <div
                                    className="bg-primary-500 h-1 rounded-full transition-all duration-300"
                                    style={{ width: `${uploadProgress}%` }}
                                ></div>
                            </div>
                        )}
                        {inputErrorMessage && (
                            <p className="text-xs text-red-400 mb-2 font-medium bg-red-500/10 px-2 py-1 rounded inline-block border border-red-500/20">
                                {inputErrorMessage}
                            </p>
                        )}
                        <div className="flex flex-wrap gap-3 max-h-[120px] overflow-y-auto custom-scrollbar">
                            {chosenFiles.map((file) => (
                                <div
                                    key={file.file.name}
                                    className={`relative group flex justify-between items-center p-2 rounded-xl bg-black/20 border border-white/5 ${
                                        !isImage(file.file) ? "w-[240px]" : ""
                                    }`}
                                >
                                    {isImage(file.file) && (
                                        <img
                                            src={file.url}
                                            alt=""
                                            className="w-16 h-16 object-cover rounded-lg"
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
                                        onClick={() =>
                                            setChosenFiles(
                                                chosenFiles.filter(
                                                    (f) =>
                                                        f.file.name !==
                                                        file.file.name
                                                )
                                            )
                                        }
                                        className="absolute -right-2 -top-2 w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600 shadow-md transition-all opacity-0 group-hover:opacity-100 scale-90 group-hover:scale-100"
                                    >
                                        <XCircleIcon className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Input Controls */}
                <div className="flex items-end gap-1">
                    {/* Left Actions (File/Audio) */}
                    <div className="flex items-center gap-0 pb-0.5">
                        <button
                            className="p-1 sm:p-2 text-primary-300 hover:text-white hover:bg-white/10 rounded-full transition-all relative group tooltip sm:tooltip-top"
                            data-tip="Attach File"
                        >
                            <PaperClipIcon className="sm:w-6 sm:h-6 w-[18px] h-[18px]" />
                            <input
                                type="file"
                                multiple
                                onChange={onFileChange}
                                className="absolute inset-0 z-20 opacity-0 cursor-pointer"
                            />
                        </button>
                        <button
                            className="p-1 sm:p-2 text-primary-300 hover:text-white hover:bg-white/10 rounded-full transition-all relative group tooltip sm:tooltip-top"
                            data-tip="Send Image"
                        >
                            <PhotoIcon className="sm:w-6 sm:h-6 w-[18px] h-[18px]" />
                            <input
                                type="file"
                                multiple
                                accept="image/*"
                                onChange={onFileChange}
                                className="absolute inset-0 z-20 opacity-0 cursor-pointer"
                            />
                        </button>
                        <AudioRecorder fileReady={recordedAudioReady} />
                    </div>

                    {/* Text Input */}
                    <div className="flex-1 relative bg-black/30 rounded-2xl border border-white/10 focus-within:border-primary-500/50 focus-within:ring-1 focus-within:ring-primary-500/20 transition-all">
                        <NewMessageInput
                            value={newMessage}
                            onSend={onSendClick}
                            onChange={(ev) => setNewMessage(ev.target.value)}
                            className="bg-transparent border-none text-gray-100 placeholder-gray-500 focus:ring-0 w-full sm:py-3 py-2 sm:px-4 px-2.5 min-h-[40px] max-h-[140px] text-sm sm:text-base"
                        />
                    </div>

                    {/* Right Actions (Emoji/Like/Send) */}
                    <div className="flex items-center gap-0 pb-0.5">
                        <Popover className="relative">
                            <Popover.Button className="p-1 sm:p-2 text-primary-300 hover:text-white hover:bg-white/10 rounded-full transition-all">
                                <FaceSmileIcon className="sm:w-6 sm:h-6 w-[18px] h-[18px]" />
                            </Popover.Button>
                            <Popover.Panel className="absolute bottom-full right-0 z-50 mb-4 origin-bottom-right">
                                <div className="shadow-2xl rounded-2xl overflow-hidden border border-white/5">
                                    <EmojiPicker
                                        theme="dark"
                                        onEmojiClick={(ev) =>
                                            setNewMessage(newMessage + ev.emoji)
                                        }
                                    />
                                </div>
                            </Popover.Panel>
                        </Popover>

                        {newMessage.trim() || chosenFiles.length > 0 ? (
                            <button
                                onClick={onSendClick}
                                disabled={messageSending}
                                className="btn btn-circle sm:w-12 sm:h-12 w-10 h-10 min-h-0 border-none bg-gradient-to-r from-primary-600 to-accent-600 hover:from-primary-500 hover:to-accent-500 text-white shadow-[0_0_15px_rgba(124,58,237,0.4)] hover:shadow-[0_0_25px_rgba(124,58,237,0.6)] transition-all transform hover:scale-105"
                            >
                                <PaperAirplaneIcon className="sm:w-6 sm:h-6 w-5 h-5 -rotate-45" />
                            </button>
                        ) : (
                            <button
                                onClick={onLikeClick}
                                className="p-1 sm:p-2 text-primary-300 hover:text-white hover:bg-white/10 rounded-full transition-all hover:scale-110 active:scale-95"
                            >
                                <HandThumbUpIcon className="sm:w-6 sm:h-6 w-[18px] h-[18px]" />
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MessageInput;
