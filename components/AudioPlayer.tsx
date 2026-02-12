import React from 'react';
import { useAudio } from '../contexts/AudioContext';
import { Play, Pause, X, Headphones } from 'lucide-react';

const AudioPlayer: React.FC = () => {
    const { currentArticle, isPlaying, isLoading, pauseAudio, resumeAudio, stopAudio } = useAudio();

    if (!currentArticle) return null;

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 animate-slide-up">
            {/* Slim Player Bar */}
            <div className="bg-black/95 backdrop-blur-xl border-t border-white/10 shadow-2xl">
                <div className="container mx-auto px-4 md:px-6 py-3 md:py-4">
                    <div className="flex items-center justify-between gap-3 md:gap-4">

                        {/* Left: Article Info */}
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                            <div className="flex-shrink-0 w-10 h-10 md:w-12 md:h-12 rounded bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                                <Headphones size={20} className="text-emerald-500" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-xs md:text-sm font-bold text-white truncate">
                                    {currentArticle.title}
                                </p>
                                <p className="text-[10px] md:text-xs text-gray-400 uppercase tracking-wider">
                                    Audio Article
                                </p>
                            </div>
                        </div>

                        {/* Right: Controls */}
                        <div className="flex items-center gap-2 md:gap-3 flex-shrink-0">
                            {/* Play/Pause Button */}
                            <button
                                onClick={isPlaying ? pauseAudio : resumeAudio}
                                disabled={isLoading}
                                className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-emerald-500 hover:bg-emerald-400 disabled:bg-gray-700 disabled:cursor-not-allowed flex items-center justify-center transition-all duration-200 shadow-lg hover:shadow-emerald-500/50"
                                aria-label={isPlaying ? "Pause" : "Play"}
                            >
                                {isLoading ? (
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                ) : isPlaying ? (
                                    <Pause size={20} className="text-black fill-black" />
                                ) : (
                                    <Play size={20} className="text-black fill-black ml-0.5" />
                                )}
                            </button>

                            {/* Close Button */}
                            <button
                                onClick={stopAudio}
                                className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 flex items-center justify-center transition-all duration-200"
                                aria-label="Close player"
                            >
                                <X size={16} className="text-gray-400 hover:text-white" />
                            </button>
                        </div>
                    </div>

                    {/* Loading indicator bar */}
                    {isLoading && (
                        <div className="mt-2 h-1 bg-white/5 rounded-full overflow-hidden">
                            <div className="h-full bg-emerald-500 w-1/3 animate-pulse"></div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AudioPlayer;
