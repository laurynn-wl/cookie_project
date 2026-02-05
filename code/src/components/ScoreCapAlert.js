import React, { useState, useEffect } from 'react';

const ScoreCapAlert = ({ currentScore }) => {
    const [isVisible, setIsVisible] = useState(false);

    // CONSTANTS
    const STORAGE_KEY = 'score_cap_msg_dismissed';

    useEffect(() => {
        // 1. Check if user already dismissed this specific message
       // const hasDismissed = localStorage.getItem(STORAGE_KEY);

        // 3. Logic Check
        if (currentScore === 60 || currentScore === 45) {
            setIsVisible(true);
        } else {
            // Optional: Hide if score drops below cap (live updates)
            setIsVisible(false);
        }
    }, [currentScore]);

    const handleDismiss = () => {
        setIsVisible(false);
        localStorage.setItem(STORAGE_KEY, 'true');
    };

    if (!isVisible) return null;

    // ... (rest of your JSX return is fine)
    return (
        <div className="mb-4 mx-4 p-4 bg-sky-900/50 border border-sky-500/50 rounded-lg flex items-start gap-3 shadow-lg backdrop-blur-sm animate-fade-in">
             {/* Icon */}
             <div className="text-sky-400 mt-1">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            </div>

            {/* Content */}
            <div className="flex-1">
                <h4 className="text-sm font-semibold text-sky-100">
                    Maximum Privacy Score Reached
                </h4>
                <p className="text-xs text-sky-200/80 mt-1 leading-relaxed">
                    You've reached the highest possible score! Deleting more cookies won't increase this number, but removing tracking cookies still improves your actual privacy.
                </p>
            </div>

            {/* Close Button */}
            <button 
                onClick={handleDismiss}
                className="text-sky-400 hover:text-white hover:bg-sky-800 rounded p-1 transition-colors"
                aria-label="Dismiss"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
            </button>
        </div>
    );
};

export default ScoreCapAlert;