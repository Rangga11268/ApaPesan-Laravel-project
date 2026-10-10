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
            type="button"
            onClick={onMicrophoneClick}
            className={`min-h-[44px] min-w-[44px] p-2 rounded-lg transition-colors flex items-center justify-center relative ${
                recording
                    ? "bg-red-500/10 text-red-500 hover:bg-red-500/20"
                    : "text-muted hover:text-main hover:bg-surface-elevated"
            }`}
            title={recording ? "Hentikan Rekaman" : "Rekam Suara"}
            aria-label={recording ? "Hentikan Rekaman" : "Rekam Suara"}
        >
            {recording ? (
                <StopCircleIcon className="w-5 h-5 text-red-500 animate-pulse" />
            ) : (
                <MicrophoneIcon className="w-5 h-5" />
            )}
        </button>
    );
};

export default AudioRecorder;
