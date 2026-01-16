// src/components/HelpCentre.js
import React, { useState } from 'react';
import { X, PlayCircle, Shield, MousePointerClick, Code2, ChevronRight } from 'lucide-react';

const HelpCentre = ({ isOpen, onClose }) => {
    const [activeTab, setActiveTab] = useState('start');

    if (!isOpen) return null;

    const tabs = [
        {
            id: 'start',
            label: 'Getting Started',
            icon: PlayCircle,
            content: (
                <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                    <h3 className="text-2xl font-bold text-white mb-4">Getting Started</h3>
                    <p className="text-gray-300 leading-relaxed">
                        Welcome to the Cookie Dashboard! This tool gives you transparency and control over how this website uses your data.
                    </p>
                    <div className="p-4 bg-gray-800 rounded-lg border border-gray-700">
                        <p className="text-sm text-gray-400">Content placeholder: Add your tutorial steps here.</p>
                    </div>
                </div>
            )
        },
        {
            id: 'score',
            label: 'Understanding your Score',
            icon: Shield,
            content: (
                <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                    <h3 className="text-2xl font-bold text-white mb-4">Understanding your Score</h3>
                    <p className="text-gray-300 leading-relaxed">
                        Your privacy score is calculated based on the types of cookies found. A lower score indicates higher privacy risks.
                    </p>
                    <div className="p-4 bg-gray-800 rounded-lg border border-gray-700">
                        <p className="text-sm text-gray-400">Content placeholder: Add score breakdown here.</p>
                    </div>
                </div>
            )
        },
        {
            id: 'manage',
            label: 'Managing Cookies',
            icon: MousePointerClick,
            content: (
                <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                    <h3 className="text-2xl font-bold text-white mb-4">Managing Cookies</h3>
                    <p className="text-gray-300 leading-relaxed">
                        You can delete or reject non-essential cookies using the table checkboxes.
                    </p>
                    <div className="p-4 bg-gray-800 rounded-lg border border-gray-700">
                        <p className="text-sm text-gray-400">Content placeholder: Add deletion instructions here.</p>
                    </div>
                </div>
            )
        },
        {
            id: 'tech',
            label: 'Technical View',
            icon: Code2,
            content: (
                <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                    <h3 className="text-2xl font-bold text-white mb-4"> Enabling Technical View</h3>
                    <p className="text-gray-300 leading-relaxed">
                        You can switch the dashboard to <strong>Technical View</strong> to see a more detailed information.
                    </p>
                </div>
            )
        }
    ];

    const activeContent = tabs.find(t => t.id === activeTab)?.content;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            
            <div className="bg-gray-900 border border-gray-700 rounded-xl w-full max-w-5xl shadow-2xl overflow-hidden flex flex-col h-[600px] max-h-[90vh]">
                
                
                <div className="flex items-center justify-between p-5 border-b border-gray-700 bg-gray-800 shrink-0">
                    <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                        Help Centre
                    </h2>
                    <button 
                        onClick={onClose} 
                        className="text-gray-400 hover:text-white transition-colors bg-gray-700 hover:bg-gray-600 p-2 rounded-lg"
                    >
                        <X size={20} />
                    </button>
                </div>

                
                <div className="flex flex-1 overflow-hidden">
                    
                    
                    <div className="w-1/3 border-r border-gray-700 flex flex-col bg-gray-800/30">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                // flex-1 makes it stretch to fill available height equally
                                className={`flex-1 w-full text-left px-6 flex items-center justify-between group transition-all duration-200 border-b border-gray-700 last:border-b-0 ${
                                    activeTab === tab.id 
                                        ? 'bg-sky-500/10 text-sky-400 shadow-[inset_3px_0_0_0_#38bdf8]' // Left blue border indicator
                                        : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                                }`}
                            >
                                <div className="flex items-center gap-4">
                                    <tab.icon size={22} className={activeTab === tab.id ? "text-sky-400" : "text-gray-500 group-hover:text-white"} />
                                    <span className="font-bold text-base">{tab.label}</span>
                                </div>
                                {activeTab === tab.id && <ChevronRight size={18} />}
                            </button>
                        ))}
                    </div>

                    
                    <div className="w-2/3 bg-gray-900/50 p-8 overflow-y-auto">
                        {activeContent}
                    </div>

                </div>
            </div>
        </div>
    );
};

export default HelpCentre;