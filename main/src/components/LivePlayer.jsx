import React, { useState, useEffect, useRef, useCallback } from "react";
import Hls from "hls.js";

const STREAM_URL = "https://cdn.96newshd.com/96newshd/livecdn/index.m3u8";

const LivePlayer = () => {
    const [isSticky, setIsSticky] = useState(false);
    const [userClosedSticky, setUserClosedSticky] = useState(false);
    const placeholderRef = useRef(null);

    // Player state
    const videoRef = useRef(null);
    const hlsRef = useRef(null);
    const controlsTimeoutRef = useRef(null);
    const [isPlaying, setIsPlaying] = useState(true);
    const [isMuted, setIsMuted] = useState(false);
    const [volume, setVolume] = useState(1);
    const [showControls, setShowControls] = useState(true);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [qualityLevels, setQualityLevels] = useState([]);
    const [currentQuality, setCurrentQuality] = useState(-1); // -1 = auto
    const [showQualityMenu, setShowQualityMenu] = useState(false);
    const [isBuffering, setIsBuffering] = useState(true);
    const [error, setError] = useState(null);
    const playerContainerRef = useRef(null);

    // --- Sticky / PiP scroll behavior ---
    useEffect(() => {
        const handleScroll = () => {
            if (placeholderRef.current) {
                const rect = placeholderRef.current.getBoundingClientRect();
                if (rect.bottom < 0) {
                    if (!userClosedSticky) setIsSticky(true);
                } else {
                    setIsSticky(false);
                    setUserClosedSticky(false);
                }
            }
        };
        window.addEventListener("scroll", handleScroll, { passive: true });
        handleScroll();
        return () => window.removeEventListener("scroll", handleScroll);
    }, [userClosedSticky]);

    const handleCloseSticky = (e) => {
        e.stopPropagation();
        setIsSticky(false);
        setUserClosedSticky(true);
    };

    // --- HLS setup ---
    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;

        let hls;

        if (Hls.isSupported()) {
            hls = new Hls({
                enableWorker: true,
                lowLatencyMode: true,
                startLevel: -1, // auto
            });
            hls.loadSource(STREAM_URL);
            hls.attachMedia(video);

            hls.on(Hls.Events.MANIFEST_PARSED, (_event, data) => {
                const levels = data.levels.map((level, index) => ({
                    index,
                    height: level.height,
                    width: level.width,
                    bitrate: level.bitrate,
                    label: level.height ? `${level.height}p` : `${Math.round(level.bitrate / 1000)}k`,
                }));
                setQualityLevels(levels);
                setError(null);
                video.play().catch(() => {});
            });

            hls.on(Hls.Events.LEVEL_SWITCHED, (_event, data) => {
                setCurrentQuality(data.level);
            });

            hls.on(Hls.Events.ERROR, (_event, data) => {
                if (data.fatal) {
                    switch (data.type) {
                        case Hls.ErrorTypes.NETWORK_ERROR:
                            hls.startLoad();
                            break;
                        case Hls.ErrorTypes.MEDIA_ERROR:
                            hls.recoverMediaError();
                            break;
                        default:
                            setError("Stream unavailable");
                            hls.destroy();
                            break;
                    }
                }
            });

            hlsRef.current = hls;
        } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
            // Safari native HLS
            video.src = STREAM_URL;
            video.addEventListener("loadedmetadata", () => {
                video.play().catch(() => {});
            });
        } else {
            setError("Your browser does not support HLS playback");
        }

        return () => {
            if (hls) hls.destroy();
        };
    }, []);

    // --- Video event listeners ---
    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;

        const onPlay = () => setIsPlaying(true);
        const onPause = () => setIsPlaying(false);
        const onWaiting = () => setIsBuffering(true);
        const onPlaying = () => setIsBuffering(false);
        const onCanPlay = () => setIsBuffering(false);

        video.addEventListener("play", onPlay);
        video.addEventListener("pause", onPause);
        video.addEventListener("waiting", onWaiting);
        video.addEventListener("playing", onPlaying);
        video.addEventListener("canplay", onCanPlay);

        return () => {
            video.removeEventListener("play", onPlay);
            video.removeEventListener("pause", onPause);
            video.removeEventListener("waiting", onWaiting);
            video.removeEventListener("playing", onPlaying);
            video.removeEventListener("canplay", onCanPlay);
        };
    }, []);

    // --- Controls auto-hide ---
    const resetControlsTimeout = useCallback(() => {
        setShowControls(true);
        if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
        controlsTimeoutRef.current = setTimeout(() => {
            if (isPlaying) setShowControls(false);
        }, 3000);
    }, [isPlaying]);

    useEffect(() => {
        resetControlsTimeout();
        return () => {
            if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
        };
    }, [isPlaying, resetControlsTimeout]);

    // --- Fullscreen listener ---
    useEffect(() => {
        const onFsChange = () => setIsFullscreen(!!document.fullscreenElement);
        document.addEventListener("fullscreenchange", onFsChange);
        return () => document.removeEventListener("fullscreenchange", onFsChange);
    }, []);

    // --- Controls handlers ---
    const togglePlay = () => {
        const video = videoRef.current;
        if (!video) return;
        if (video.paused) {
            video.play().catch(() => {});
        } else {
            video.pause();
        }
    };

    const toggleMute = () => {
        const video = videoRef.current;
        if (!video) return;
        video.muted = !video.muted;
        setIsMuted(video.muted);
    };

    const handleVolumeChange = (e) => {
        const video = videoRef.current;
        if (!video) return;
        const val = parseFloat(e.target.value);
        video.volume = val;
        setVolume(val);
        if (val === 0) {
            video.muted = true;
            setIsMuted(true);
        } else if (video.muted) {
            video.muted = false;
            setIsMuted(false);
        }
    };

    const setQuality = (levelIndex) => {
        const hls = hlsRef.current;
        if (!hls) return;
        hls.currentLevel = levelIndex; // -1 = auto
        setCurrentQuality(levelIndex);
        setShowQualityMenu(false);
    };

    const toggleFullscreen = () => {
        const container = playerContainerRef.current;
        if (!container) return;
        if (!document.fullscreenElement) {
            container.requestFullscreen().catch(() => {});
        } else {
            document.exitFullscreen().catch(() => {});
        }
    };

    const goLive = () => {
        const video = videoRef.current;
        if (!video) return;
        // Jump to live edge
        if (video.duration && isFinite(video.duration)) {
            video.currentTime = video.duration;
        }
        video.play().catch(() => {});
    };

    // Close quality menu on outside click
    useEffect(() => {
        if (!showQualityMenu) return;
        const close = () => setShowQualityMenu(false);
        document.addEventListener("click", close);
        return () => document.removeEventListener("click", close);
    }, [showQualityMenu]);

    // --- Render ---
    return (
        <div className="mb-8 relative" ref={placeholderRef}>
            {/* Section title */}
            <div className="flex items-center mb-6 border-r-4 border-red-600 pr-4">
                <h2 className="font-jameel-noori text-3xl text-gray-800 font-bold">
                    لائیو نیوز
                </h2>
                <div className="flex-grow h-px bg-gray-200 mr-4"></div>
            </div>

            {/* Placeholder when sticky */}
            {isSticky && (
                <div className="w-full rounded-xl" style={{ paddingTop: "56.25%" }}></div>
            )}

            {/* Player wrapper */}
            <div
                ref={playerContainerRef}
                className={`group transition-all duration-300 ease-in-out bg-black ${
                    isSticky
                        ? "fixed bottom-4 left-4 md:bottom-6 md:left-6 w-[200px] sm:w-[280px] md:w-[360px] lg:w-[400px] shadow-[0_10px_40px_rgba(0,0,0,0.5)] rounded-xl border-2 border-red-600/50 hover:border-red-600 z-[60]"
                        : "relative w-full rounded-xl overflow-hidden shadow-xl z-10"
                }`}
                style={isSticky ? { aspectRatio: "16/9" } : { paddingTop: "56.25%" }}
                onMouseMove={resetControlsTimeout}
                onMouseLeave={() => isPlaying && setShowControls(false)}
            >
                {/* Close sticky button */}
                {isSticky && (
                    <div className="absolute -top-3 -right-3 z-50">
                        <button
                            onClick={handleCloseSticky}
                            className="bg-black hover:bg-red-600 border border-gray-600 shadow-md text-white rounded-full p-1.5 transition-colors"
                            title="Close picture-in-picture"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                        </button>
                    </div>
                )}

                {/* Video element */}
                <video
                    ref={videoRef}
                    className={`absolute top-0 left-0 w-full h-full object-cover ${isSticky ? "rounded-xl" : ""}`}
                    autoPlay
                    playsInline
                    muted={false}
                    onClick={togglePlay}
                />

                {/* Buffering spinner */}
                {isBuffering && !error && (
                    <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
                        <div className="w-12 h-12 border-4 border-white/30 border-t-red-600 rounded-full animate-spin"></div>
                    </div>
                )}

                {/* Error overlay */}
                {error && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center z-20 bg-black/80">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-12 h-12 text-red-500 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <p className="text-white text-sm">{error}</p>
                    </div>
                )}

                {/* Big center play button (when paused) */}
                {!isPlaying && !error && (
                    <button
                        onClick={togglePlay}
                        className="absolute inset-0 flex items-center justify-center z-20"
                    >
                        <div className="w-16 h-16 md:w-20 md:h-20 bg-red-600/90 hover:bg-red-600 rounded-full flex items-center justify-center shadow-lg backdrop-blur-sm transition-transform hover:scale-110">
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 md:w-10 md:h-10 text-white ml-1" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M8 5v14l11-7z" />
                            </svg>
                        </div>
                    </button>
                )}

                {/* LIVE badge - always visible top-left */}
                <div className="absolute top-3 left-3 z-30 flex items-center gap-1.5">
                    <button
                        onClick={goLive}
                        className="flex items-center gap-1.5 bg-red-600/90 hover:bg-red-600 text-white text-xs font-bold px-2.5 py-1 rounded-md backdrop-blur-sm transition-colors"
                    >
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
                        </span>
                        LIVE
                    </button>
                </div>

                {/* Controls bar */}
                {!isSticky && (
                    <div
                        className={`absolute bottom-0 left-0 right-0 z-30 bg-gradient-to-t from-black/90 via-black/50 to-transparent pt-10 pb-3 px-3 md:px-4 transition-opacity duration-300 ${
                            showControls ? "opacity-100" : "opacity-0 pointer-events-none"
                        }`}
                    >
                        <div className="flex items-center gap-2 md:gap-3">
                            {/* Play / Pause */}
                            <button
                                onClick={togglePlay}
                                className="text-white hover:text-red-400 transition-colors p-1"
                                title={isPlaying ? "Pause" : "Play"}
                            >
                                {isPlaying ? (
                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M6 4h4v16H6zM14 4h4v16h-4z" />
                                    </svg>
                                ) : (
                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M8 5v14l11-7z" />
                                    </svg>
                                )}
                            </button>

                            {/* Volume */}
                            <div className="flex items-center gap-1 group/vol">
                                <button
                                    onClick={toggleMute}
                                    className="text-white hover:text-red-400 transition-colors p-1"
                                    title={isMuted ? "Unmute" : "Mute"}
                                >
                                    {isMuted || volume === 0 ? (
                                        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51A8.796 8.796 0 0021 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06a8.99 8.99 0 003.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z" />
                                        </svg>
                                    ) : volume < 0.5 ? (
                                        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M18.5 12c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM5 9v6h4l5 5V4L9 9H5z" />
                                        </svg>
                                    ) : (
                                        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
                                        </svg>
                                    )}
                                </button>
                                <input
                                    type="range"
                                    min="0"
                                    max="1"
                                    step="0.05"
                                    value={isMuted ? 0 : volume}
                                    onChange={handleVolumeChange}
                                    className="w-0 group-hover/vol:w-20 transition-all duration-200 accent-red-600 h-1 cursor-pointer opacity-0 group-hover/vol:opacity-100"
                                />
                            </div>

                            {/* Spacer */}
                            <div className="flex-grow" />

                            {/* Quality selector */}
                            {qualityLevels.length > 1 && (
                                <div className="relative">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setShowQualityMenu((prev) => !prev);
                                        }}
                                        className="text-white hover:text-red-400 transition-colors p-1 flex items-center gap-1 text-xs font-mono"
                                        title="Quality"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                        <span className="hidden sm:inline">
                                            {currentQuality === -1
                                                ? "Auto"
                                                : qualityLevels[currentQuality]?.label || "Auto"}
                                        </span>
                                    </button>

                                    {/* Quality dropdown */}
                                    {showQualityMenu && (
                                        <div
                                            className="absolute bottom-full right-0 mb-2 bg-gray-900/95 backdrop-blur-sm rounded-lg border border-gray-700 shadow-xl overflow-hidden min-w-[140px]"
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            <div className="px-3 py-2 text-[10px] uppercase tracking-wider text-gray-400 border-b border-gray-700 font-sans">
                                                Quality
                                            </div>
                                            <button
                                                onClick={() => setQuality(-1)}
                                                className={`w-full text-left px-3 py-2 text-sm hover:bg-white/10 flex items-center justify-between font-sans ${
                                                    hlsRef.current?.autoLevelEnabled
                                                        ? "text-red-400"
                                                        : "text-white"
                                                }`}
                                            >
                                                <span>Auto</span>
                                                {hlsRef.current?.autoLevelEnabled && (
                                                    <span className="text-xs text-gray-400">
                                                        ({qualityLevels[currentQuality]?.label})
                                                    </span>
                                                )}
                                            </button>
                                            {[...qualityLevels].reverse().map((level) => (
                                                <button
                                                    key={level.index}
                                                    onClick={() => setQuality(level.index)}
                                                    className={`w-full text-left px-3 py-2 text-sm hover:bg-white/10 font-sans ${
                                                        !hlsRef.current?.autoLevelEnabled && currentQuality === level.index
                                                            ? "text-red-400"
                                                            : "text-white"
                                                    }`}
                                                >
                                                    {level.label}
                                                    <span className="text-gray-500 text-xs ml-2">
                                                        {Math.round(level.bitrate / 1000)}k
                                                    </span>
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Fullscreen */}
                            <button
                                onClick={toggleFullscreen}
                                className="text-white hover:text-red-400 transition-colors p-1"
                                title={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
                            >
                                {isFullscreen ? (
                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-11V5h-2v5h5V8h-3z" />
                                    </svg>
                                ) : (
                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z" />
                                    </svg>
                                )}
                            </button>
                        </div>
                    </div>
                )}

                {/* Minimal controls for sticky mode - just play/pause on click */}
                {isSticky && !isPlaying && (
                    <button
                        onClick={togglePlay}
                        className="absolute inset-0 flex items-center justify-center z-20"
                    >
                        <div className="w-10 h-10 bg-red-600/90 rounded-full flex items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-white ml-0.5" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M8 5v14l11-7z" />
                            </svg>
                        </div>
                    </button>
                )}
            </div>
        </div>
    );
};

export default LivePlayer;
