import React from "react";
import { X } from "lucide-react";
import TrophyCase from "./TrophyCase";
import { useRef, useEffect} from "react";

// Trophie centre for privacy streaks 
const TrophyModal = ({isOpen, onClose, streak}) => {
    const trophy_modal_click = useRef(null);
    
        // Close help centre when clicking outside the menu
        useEffect(() => {
                    const handleClickOutside = (event) => {
                        if ( isOpen && trophy_modal_click.current && !trophy_modal_click.current.contains(event.target)) {
                            onClose();
                        }
                    };
                    if (isOpen) {
                        document.addEventListener('mousedown', handleClickOutside);
                    }
        
                    return () => {
                        document.removeEventListener('mousedown', handleClickOutside);
                    };
                }, [isOpen, onClose]);

    if (!isOpen) return null;

    return(
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">

            <div 
                ref={trophy_modal_click}
                className="bg-gray-900 border border-gray-700 rounded-2xl shadow-2xl w-full max-w-2xl relative overflow-hidden">

                <div className='flex justify-between items-center p-6 border-b border-gray-800 bg-gray-800/50'>
                    <div>
                        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                            Achievements 🏆
                        </h2>
                        <p className='text-gray-300 text-sm mt-1'>
                            Keep your privacy streak alive to unlock trophies!
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-full transition-colors"
                        >
                            <X
                                size={24}
                            />
                        </button>
                </div>

                <div className='p-8'>
                    <TrophyCase
                        streak={streak}
                    />
                </div>
            </div>
        </div>
    );
};

export default TrophyModal;