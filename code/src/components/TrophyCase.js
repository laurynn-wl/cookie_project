import React from 'react';
import { Trophy, Medal, Award, Lock } from 'lucide-react';

const TrophyCase = ({ streak }) => {
    
    // Define awards + streak milestones
    const milestones = [
        { 
            days: 3, 
            label: "3 Day Streak", 
            icon: Award, 
            color: "text-amber-700", 
            bg: "bg-amber-900/20",
            border: "border-amber-700/50"
        },
        { 
            days: 10, 
            label: "10 Day Streak", 
            icon: Medal, 
            color: "text-gray-300", 
            bg: "bg-gray-700/50",
            border: "border-gray-400/50"
        },
        { 
            days: 50, 
            label: "50 Day Streak", 
            icon: Trophy, 
            color: "text-yellow-400", 
            bg: "bg-yellow-900/20",
            border: "border-yellow-500/50"
        }
    ];

    return (
        <div className="grid grid-cols-3 gap-4 mb-6">
            {milestones.map((milestone, index) => {
                
               
                const unlocked = streak >= milestone.days;
                const Icon = milestone.icon;

                return (
                    <div 
                        key={index}
                        className={`
                            relative flex flex-col items-center justify-center p-3 rounded-xl border 
                            transition-all duration-300 
                            ${unlocked 
                                ? `${milestone.bg} ${milestone.border} shadow-lg scale-100 opacity-100` 
                                : 'bg-gray-800 border-gray-700 opacity-50 scale-95 grayscale'
                            }
                        `}
                    >
                        {/* Trophy Icon */}
                        <div className={`p-2 rounded-full mb-2 ${unlocked ? 'bg-white/5' : 'bg-black/20'}`}>
                            {unlocked ? (
                                <Icon size={24} className={milestone.color} />
                            ) : (
                                <Lock size={24} className="text-gray-500" />
                            )}
                        </div>

                        {/* Text Label */}
                        <span className={`text-xs font-bold ${unlocked ? 'text-gray-200' : 'text-gray-500'}`}>
                            {milestone.label}
                        </span>

                        {/* Progress Bar */}
                        {!unlocked && (
                            <div className="w-full h-1 bg-gray-700 mt-2 rounded-full overflow-hidden">
                                <div 
                                    className="h-full bg-blue-500 transition-all duration-500" 
                                    style={{ width: `${Math.min((streak / milestone.days) * 100, 100)}%` }}
                                />
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
};

export default TrophyCase;