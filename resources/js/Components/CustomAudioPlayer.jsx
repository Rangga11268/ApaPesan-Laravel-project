import { PauseCircleIcon, PlayCircleIcon } from "@heroicons/react/24/outline";
import React, { useRef, useState } from "react";

const CustomAudioPlayer = ({ file, showVolume = true }) => {
    const audioRef = useRef();
    const [isPlaying, setIsPlaying] = useState(false);
    const [volume, setVolume] = useState(1);
    const [duration, setDuration] = useState(0);
    const [currentTime, setCurrentTime] = useState(0);

    const togglePlayPause = () => {
        const audio = audioRef.current;
        if (isPlaying) {
            audio.pause();
        } else {
            audio.play();
        }
        setIsPlaying(!isPlaying);
    };

    const handleVolumeChange = (e) => {
        const volume = e.target.value;
        audioRef.current.volume = volume;
        setVolume(volume);
    };

    const handleTimeUpdate = (e) => {
        setCurrentTime(e.target.currentTime);
    };

    const handleLoadedMetaData = (e) => {
        setDuration(e.target.duration);
    };

    const handleSeekChange = (e) => {
        const time = e.target.value;
        audioRef.current.currentTime = time;
        setCurrentTime(time);
    };

    return (
        <div className="w-full flex items-center gap-2.5 py-2 px-3 rounded-xl bg-surface border border-border shadow-2xs text-main">
            <audio
                ref={audioRef}
                src={file.url}
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={handleLoadedMetaData}
                className="hidden"
            />
            <button
                type="button"
                onClick={togglePlayPause}
                className="min-h-[32px] min-w-[32px] flex items-center justify-center rounded-lg hover:bg-surface-elevated transition-colors"
                aria-label={isPlaying ? "Jeda audio" : "Putar audio"}
            >
                {isPlaying ? (
                    <PauseCircleIcon className="w-7 h-7 text-primary" />
                ) : (
                    <PlayCircleIcon className="w-7 h-7 text-primary" />
                )}
            </button>
            {showVolume && (
                <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={volume}
                    onChange={handleVolumeChange}
                    className="accent-primary"
                />
            )}
            <input
                type="range"
                className="flex-1 accent-primary cursor-pointer"
                min="0"
                max={duration}
                step="0.01"
                value={currentTime}
                onChange={handleSeekChange}
            />
        </div>
    );
};

export default CustomAudioPlayer;
