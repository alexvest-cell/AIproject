import React, { createContext, useContext, useState, useRef, useCallback } from 'react';
import { Article } from '../types';

interface AudioContextType {
    currentArticle: Article | null;
    isPlaying: boolean;
    isLoading: boolean;
    playArticle: (article: Article) => Promise<void>;
    pauseAudio: () => void;
    resumeAudio: () => void;
    stopAudio: () => void;
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

export const AudioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [currentArticle, setCurrentArticle] = useState<Article | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const audioRef = useRef<HTMLAudioElement | null>(null);

    const stopAudio = useCallback(() => {
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
            // Remove all event listeners to prevent memory leaks
            audioRef.current.onended = null;
            audioRef.current.onerror = null;
            audioRef.current.oncanplaythrough = null;
            // Set src to empty to fully release the audio resource
            audioRef.current.src = '';
            audioRef.current.load();
            audioRef.current = null;
        }
        setIsPlaying(false);
        setCurrentArticle(null);
    }, []);

    const pauseAudio = useCallback(() => {
        if (audioRef.current && isPlaying) {
            audioRef.current.pause();
            setIsPlaying(false);
        }
    }, [isPlaying]);

    const resumeAudio = useCallback(() => {
        if (audioRef.current && !isPlaying) {
            audioRef.current.play();
            setIsPlaying(true);
        }
    }, [isPlaying]);

    const playArticle = useCallback(async (article: Article) => {
        // If same article is already playing, just toggle pause/play
        if (currentArticle?.id === article.id && audioRef.current) {
            if (isPlaying) {
                pauseAudio();
            } else {
                resumeAudio();
            }
            return;
        }

        // Stop current playback
        stopAudio();

        // Check if article has cached audio
        if (!article.audioUrl) {
            alert("Audio is not yet available for this article. Please contact the administrator to generate it.");
            return;
        }

        setIsLoading(true);
        setCurrentArticle(article);

        try {
            // Create audio element and load from Cloudinary URL
            const audio = new Audio(article.audioUrl);
            audioRef.current = audio;

            audio.onended = () => {
                stopAudio();
            };

            audio.onerror = () => {
                alert("Error loading audio. Please try again.");
                stopAudio();
                setIsLoading(false);
            };

            audio.oncanplaythrough = () => {
                setIsLoading(false);
                audio.play();
                setIsPlaying(true);
            };

            audio.load();
        } catch (e) {
            console.error("Audio playback error", e);
            alert("Error playing audio.");
            stopAudio();
            setIsLoading(false);
        }
    }, [currentArticle, isPlaying, pauseAudio, resumeAudio, stopAudio]);

    return (
        <AudioContext.Provider value={{
            currentArticle,
            isPlaying,
            isLoading,
            playArticle,
            pauseAudio,
            resumeAudio,
            stopAudio
        }}>
            {children}
        </AudioContext.Provider>
    );
};

export const useAudio = () => {
    const context = useContext(AudioContext);
    if (context === undefined) {
        throw new Error('useAudio must be used within an AudioProvider');
    }
    return context;
};
