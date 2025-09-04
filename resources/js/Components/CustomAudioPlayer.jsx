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

    const handleEnded = () => {
        setIsPlaying(false);
        audioRef.current.currentTime = 0;
        setCurrentTime(0);
    };

    return (
        <div className="w-full flex items-center gap-2 py-2 px-3 rounded-md bg-slate-800">
            <audio
                ref={audioRef}
                src={file.url}
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={handleLoadedMetaData}
                onEnded={handleEnded}
                className="hidden"
            />
            <button onClick={togglePlayPause}>
                {isPlaying ? (
                    <PauseCircleIcon className="w-6 text-gray-400" />
                ) : (
                    <PlayCircleIcon className="w-6 text-gray-400" />
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
                />
            )}
            <div className="flex-1 flex items-center gap-2">
                <input
                    type="range"
                    className="flex-1"
                    min="0"
                    max={duration}
                    step="0.01"
                    value={currentTime}
                    onChange={handleSeekChange}
                />
                <span className="text-sm text-gray-400">
                    {new Date(currentTime * 1000).toISOString().substr(14, 5)} /{" "}
                    {new Date(duration * 1000).toISOString().substr(14, 5)}
                </span>
            </div>
        </div>
    );
};

export default CustomAudioPlayer;
