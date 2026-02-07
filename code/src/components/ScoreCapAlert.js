import React, { useEffect } from 'react';
import { X, Info } from 'lucide-react';     

const ScoreCapAlert = ({ 
    current_score, 
    is_scoreCap_open, 
    set_is_scoreCap_open }) => {

    useEffect(() => {

        if (current_score === 60 || current_score === 45) {
                set_is_scoreCap_open(true);
        }
        else {
            // Incase score drops below cap, reset dismissal so alert can show again
            set_is_scoreCap_open(false);
        }

    }, [current_score, set_is_scoreCap_open]);

    const handleClose = () => {
        set_is_scoreCap_open(false);
    
    };

    if (!is_scoreCap_open) return null;

    return (
        <div className="mb-4 mx-4 p-4 bg-sky-900/50 border border-sky-500/50 rounded-lg flex items-start gap-3 shadow-lg backdrop-blur-sm animate-fade-in">
             <div className="text-sky-400 mt-1">
                <Info size={20} />
            </div>

            <div className="flex-1">
                <h4 className="text-sm font-semibold text-sky-100">
                    Maximum Privacy Score Reached
                </h4>
                <p className="text-xs text-sky-200/80 mt-1 leading-relaxed">
                    You've reached the highest possible privacy score for this website! 
                    <br/> Deleting other cookies won't increase this score, but removing unecessary cookies will still improve your privacy and security. 
                    <br/> If you want more information on why the score is capped, visit the help centre and go to the <strong>Understanding the Score</strong> section. 

                </p>
            </div>

            <button 
                onClick={handleClose}
                className="text-sky-400 hover:text-white hover:bg-sky-800 rounded p-1 transition-colors"
                aria-label="Dismiss"
            >
                <X size={16} />
            </button>
        </div>
    );
};

export default ScoreCapAlert;