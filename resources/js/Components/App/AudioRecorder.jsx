import { MicrophoneIcon, StopCircleIcon } from "@heroicons/react/24/outline";
import { useState } from "react";

const AudioRecorder = ({ fileReady }) => {
    const [mediaRecorder, setMediaRecorder] = useState(null);
    const [recording, setRecording] = useState(false);

    const onMicrophoneClick = async () => {
        if (recording) {
            setRecording(false);
            if (mediaRecorder) {
                mediaRecorder.stop();
                setMediaRecorder(null);
            }
            return;
        }

        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            alert(
                "Audio recording is not supported in this browser or context."
            );
            return;
        }

        setRecording(true);
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: true,
            });
            const newMediaRecorder = new MediaRecorder(stream);
            const chunks = [];
            newMediaRecorder.addEventListener("dataavailable", (ev) => {
                chunks.push(ev.data);
            });

            newMediaRecorder.addEventListener("stop", () => {
                let audioBlob = new Blob(chunks, {
                    type: "audio/ogg; codecs=opus",
                });
                let audioFile = new File([audioBlob], "recorded_audio.ogg", {
                    type: "audio/ogg; codecs=opus",
                });

                const url = URL.createObjectURL(audioFile);
                fileReady(audioFile, url);
            });

            newMediaRecorder.start();
            setMediaRecorder(newMediaRecorder);
        } catch (error) {
            setRecording(false);
            console.error("Error accessing microphone:", error);
        }
    };

    return (
        <button
            onClick={onMicrophoneClick}
            className="p-1 sm:p-2 text-primary-300 hover:text-white hover:bg-white/10 rounded-full transition-all relative group tooltip sm:tooltip-top"
            data-tip={recording ? "Stop Recording" : "Record Audio"}
        >
            {recording ? (
                <StopCircleIcon className="sm:w-6 sm:h-6 w-[18px] h-[18px] text-red-500 animate-pulse" />
            ) : (
                <MicrophoneIcon className="sm:w-6 sm:h-6 w-[18px] h-[18px]" />
            )}
        </button>
    );
};

export default AudioRecorder;
