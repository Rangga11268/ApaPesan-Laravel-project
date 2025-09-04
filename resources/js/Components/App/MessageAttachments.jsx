import {
    PaperClipIcon,
    ArrowDownTrayIcon,
} from "@heroicons/react/24/outline";
import { isAudio, isImage, isPDF, isPreviewable, isVideo } from "@/helpers";
import CustomAudioPlayer from "../CustomAudioPlayer";
import { PlayCircleIcon } from "@heroicons/react/24/outline";

const MessageAttachments = ({ attachments, attachmentClick }) => {
    return (
        <>
            {attachments.length > 0 && (
                <div
                    className={`mt-2 flex flex-wrap justify-end gap-2 ${
                        attachments.length === 1 ? "max-w-[300px]" : ""
                    }`}
                >
                    {attachments.map((attachment, ind) => (
                        <div
                            onClick={(ev) =>
                                !isAudio(attachment) &&
                                attachmentClick(attachments, ind)
                            }
                            key={attachment.id}
                            className={`group relative flex justify-center items-center overflow-hidden rounded-lg ${
                                !isAudio(attachment) ? "cursor-pointer" : ""
                            } ${
                                attachments.length > 1 ? "w-32 h-32" : "w-full"
                            }`}
                        >
                            {!isAudio(attachment) && (
                                <a
                                    onClick={(ev) => ev.stopPropagation()}
                                    download
                                    href={attachment.url}
                                    className="z-20 opacity-0 group-hover:opacity-100 transition-all w-8 h-8 flex items-center justify-center text-gray-100 bg-gray-700/70 rounded-full absolute right-2 top-2 cursor-pointer hover:bg-gray-800"
                                >
                                    <ArrowDownTrayIcon className="w-4 h-4" />
                                </a>
                            )}

                            {isImage(attachment) && (
                                <img
                                    src={attachment.url}
                                    className="w-full h-full object-cover"
                                />
                            )}
                            {isVideo(attachment) && (
                                <>
                                    <PlayCircleIcon className="z-20 absolute w-16 h-16 text-white opacity-70" />
                                    <div className="absolute left-0 top-0 w-full h-full bg-black/50 z-10"></div>
                                    <video
                                        src={attachment.url}
                                        className="w-full h-full object-cover"
                                    ></video>
                                </>
                            )}
                            {isAudio(attachment) && (
                                <div className="w-full flex items-center justify-center bg-slate-800 rounded-lg">
                                    <CustomAudioPlayer
                                        file={attachment}
                                        showVolume={false}
                                    />
                                </div>
                            )}
                            {isPDF(attachment) && (
                                <div className="w-full h-full flex justify-center items-center bg-gray-800">
                                    <iframe
                                        src={attachment.url}
                                        className="hidden"
                                    ></iframe>
                                    <img
                                        src="/img/pdf.png"
                                        alt="PDF icon"
                                        className="w-16 h-16"
                                    />
                                </div>
                            )}
                            {!isPreviewable(attachment) && (
                                <a
                                    onClick={(ev) => ev.stopPropagation()}
                                    href={attachment.url}
                                    download
                                    className="w-full h-full flex flex-col justify-center items-center bg-gray-800 p-2"
                                >
                                    <PaperClipIcon className="w-10 h-10 mb-3" />
                                    <small className="text-center text-gray-300 break-all">
                                        {attachment.name}
                                    </small>
                                </a>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </>
    );
};

export default MessageAttachments;
