import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";

const LivePlayer = ({ loading, news, section_name, category }) => {
    const [isSticky, setIsSticky] = useState(false);
    const [userClosedSticky, setUserClosedSticky] = useState(false);
    const placeholderRef = useRef(null);

    useEffect(() => {
        const handleScroll = () => {
            if (placeholderRef.current) {
                const rect = placeholderRef.current.getBoundingClientRect();
                // Player goes out of view from top (user scrolls down past the bottom of the player)
                if (rect.bottom < 0) {
                    if (!userClosedSticky) {
                        setIsSticky(true);
                    }
                } else {
                    // Player is back in view
                    setIsSticky(false);
                    setUserClosedSticky(false);
                }
            }
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        handleScroll();

        return () => window.removeEventListener('scroll', handleScroll);
    }, [userClosedSticky]);

    const handleCloseSticky = (e) => {
        e.stopPropagation();
        setIsSticky(false);
        setUserClosedSticky(true);
    };

    return (
        <div className="mb-8 relative" ref={placeholderRef}>
            <div className="flex items-center mb-6 border-r-4 border-red-600 pr-4">
                <h2 className="font-jameel-noori text-3xl text-gray-800 font-bold">
                    لائیو نیوز
                </h2>
                <div className="flex-grow h-px bg-gray-200 mr-4"></div>
            </div>

            {/* Placeholder when sticky keeps layout from shifting */}
            {isSticky && (
                <div className="w-full rounded-xl" style={{ paddingTop: '56.25%' }}></div>
            )}

            <div
                className={`transition-all duration-300 ease-in-out bg-black ${isSticky
                    ? "fixed bottom-4 left-4 md:bottom-6 md:left-6 w-[200px] sm:w-[280px] md:w-[360px] lg:w-[400px] shadow-[0_10px_40px_rgba(0,0,0,0.5)] rounded-xl border-2 border-red-600/50 hover:border-red-600 z-[60]"
                    : "relative w-full rounded-xl overflow-hidden shadow-xl z-10"
                    }`}
                style={isSticky ? { aspectRatio: '16/9' } : { paddingTop: '56.25%' }}
            >
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

                <iframe
                    className={`absolute top-0 left-0 w-full h-full border-none ${isSticky ? 'rounded-xl' : ''}`}
                    src="https://cdn.96newshd.com/96newshd/livecdn/embed.html"
                    allowFullScreen
                    title="Live Stream"
                ></iframe>
            </div>
        </div>
    );
};

const NewsSectionSkeleton = () => {
    return (
        <div className="space-y-6">
            player here
        </div>
    );
};

export default LivePlayer;