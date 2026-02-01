/*global chrome */
import React, { useState, useEffect, useRef } from 'react';
import { X, PlayCircle, Shield, MousePointerClick, ChevronRight, ShieldAlert, Search, CheckSquare, ToggleLeft, Trash, AlertTriangle, Glasses, Eye, Settings, TrendingDown, Github} from 'lucide-react';

const HelpCentre = ({ isOpen, onClose }) => {
    const [activeTab, setActiveTab] = useState('start');
    const help_centre_click = useRef(null);

    // Close help centre when clicking outside the menu
    useEffect(() => {
                const handleClickOutside = (event) => {
                    if ( isOpen && help_centre_click.current && !help_centre_click.current.contains(event.target)) {
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

     // Function to open GitHub
    const open_github = () => {
        const repoUrl = 'https://github.com/laurynn-wl/cookie_project/blob/main/docs/risk_scoring.md'; 

        if (typeof chrome !== 'undefined' && chrome.tabs) {
            chrome.tabs.create({ url: repoUrl });
        } else {
            window.open(repoUrl, '_blank');
        }
    };

    const tabs = [
        {
            id: 'start',
            label: 'Getting Started',
            icon: PlayCircle,
            content: (
                <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                    <div>
                        <h3 className="text-2xl font-bold text-white mb-4">Getting Started</h3>
                        <p className="text-gray-300 leading-relaxed text-base">
                            Welcome to the Cookie Dashboard! This tool analyses the cookies on the current website you are visiting and provides insights on how your privacy may be affected.
                        </p>
                    </div>

                    <div className='space-y-3'>

                    <div className="bg-gray-800/50 p-4 rounded-xl border border-gray-700 items-center flex gap-4">
                        <div className="bg-blue-500/20 h-12 w-12 p-3 rounded-lg flex items-center justify-center text-blue-400">
                                <MousePointerClick size={24} />
                            </div>
                            <div>
                                <h4 className="text-white font-bold text-sm mb-1">Explore using Tooltips</h4>
                                <p className="text-sm text-gray-400 leading-relaxed">
                                    Hover over the <strong>info tooltips</strong> located next to section headings to see detailed explanations of what each part of the dashboard does.
                                </p>
                            </div>
                    </div>

                    <div className="bg-gray-800/50 p-4 rounded-xl border border-gray-700 items-center flex gap-4">
                            <div className="bg-purple-500/20 h-12 w-12 p-3 rounded-lg flex items-center justify-center text-purple-400">
                                <Search size={24} /> 
                            </div>
                            <div>
                                <h4 className="text-white font-bold text-sm mb-1">See What Cookies are Stored</h4>
                                <p className="text-sm text-gray-400 leading-relaxed">
                                    The dashboard lists every active cookie on the website, by its purpose (e.g. essential, tracking).
                                </p>
                            </div>
                        </div>

                    <div className="bg-gray-800/50 p-4 rounded-xl border border-gray-700 items-center flex gap-4">
                        <div className="bg-red-500/20 h-12 w-12 p-3 rounded-lg flex items-center justify-center text-red-400">
                            <ShieldAlert size={24} />
                        </div>
                        <div>
                            <h4 className="text-white font-bold text-sm mb-1">Understand the Risks</h4>
                            <p className="text-sm text-gray-400 leading-relaxed">
                                Learn about the privacy risks associated with different types if cookies and how they impact your online safety. 
                            </p>
                        </div>
                    </div>
                    
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
                    <div> 
                        <h3 className="text-2xl font-bold text-white mb-4">Understanding your Score</h3>
                        <p className="text-gray-300 leading-relaxed text-base">
                            The privacy score provides an overview of how the cookies on this website may impact your privacy. A lower score indicates a higher number of potentially harmful cookies.
                        </p>
                    </div>

                    <div className='space-y-3'>

                        <div className="bg-gray-800/50 p-4 rounded-xl border border-gray-700">
                            <h4 className="text-white font-bold text-sm mb-3 flex items-center gap-2">
                                <TrendingDown size={18} className="text-red-500"/>
                                Score Reductions
                            </h4>
                            <ul className="space-y-2 text-sm text-gray-400">
                                <li className="flex items-start gap-2">
                                    <span className="text-red-500 font-bold">•</span>
                                    <span><strong>Tracking Cookies:</strong> 10 points are removed for every tracking cookie (capped at 50 points).</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-red-500 font-bold">•</span>
                                    <span><strong>Attributes:</strong> 5 points are removed for each high risk cookie (capped at 30 points).</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-red-500 font-bold">•</span>
                                    <span><strong>Cookie Quantity:</strong> Too many excessive cookies will lower the score (capped at 20 points).</span>
                                </li>
                            </ul>
                        </div>

                        <div className="bg-orange-500/10 border border-orange-500/30 p-4 rounded-xl">
                    <h4 className="text-orange-200 font-bold text-sm mb-2 flex items-center gap-2">
                        <AlertTriangle size={18} />
                        Critical Security Caps
                    </h4>
                    <p className="text-sm text-orange-100/80 leading-relaxed mb-2">
                        If <strong>Essential Cookies</strong> are insecure, the score is strictly limited regardless of other factors:
                    </p>
                    <div className="grid grid-cols-2 gap-3 mt-2">
                        <div className="bg-gray-900/50 p-2 rounded border border-orange-500/20 text-center">
                            <span className="block text-xl font-bold text-orange-400">Cap: 60</span>
                            <span className="text-xs text-gray-400">Missing 'HttpOnly'</span>
                        </div>
                        <div className="bg-gray-900/50 p-2 rounded border border-orange-500/20 text-center">
                            <span className="block text-xl font-bold text-orange-400">Cap: 45</span>
                            <span className="text-xs text-gray-400">Missing 'Secure'</span>
                        </div>
                    </div>
                </div>

                
                <div className="pt-2">
                    <button 
                        onClick={open_github}
                        className="w-full flex items-center justify-center gap-2 bg-gray-800 hover:bg-gray-700 text-white p-3 rounded-lg border border-gray-600 transition-all group"
                    >
                        <Github size={20} />
                        <span className='text-base font-bold'>View Full Calculation Logic on GitHub</span>
                    </button>
                </div>



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
                    <p className="text-gray-300 leading-relaxed text-base">
                        You can manage cookies directly from the dashboard. You can use the <strong>Active Cookie Table </strong> to select what cookies to delete.
                    </p>

                    <div className ='space-y-3'>

                        <div className="bg-gray-800/50 p-4 rounded-xl border border-gray-700 items-center flex gap-4">
                        <div className="bg-green-500/20 h-12 w-12 p-3 rounded-lg flex items-center justify-center text-green-400">
                                <CheckSquare size={24} />
                            </div>
                            <div>
                                <h4 className="text-white font-bold text-sm mb-1">Selecting Individual Cookies</h4>
                                <p className="text-sm text-gray-400 leading-relaxed">
                                    You can select the <strong>checkboxes</strong> next to each cookie in the <strong>Active Cookie Table</strong> to choose which cookies to delete.
                                </p>
                            </div>
                        </div>

                        <div className="bg-gray-800/50 p-4 rounded-xl border border-gray-700 items-center flex gap-4">
                        <div className="bg-blue-500/20 h-12 w-12 p-3 rounded-lg flex items-center justify-center text-blue-400">
                                <ToggleLeft size={24} />
                            </div>
                            <div>
                                <h4 className="text-white font-bold text-sm mb-1">Selecting by Category</h4>
                                <p className="text-sm text-gray-400 leading-relaxed">
                                    Use the <strong>category filters</strong> to select all cookies of a specific type (e.g. tracking) for deletion.
                                    <span className="text-gray-500 italic block mt-1">
                                        Note: "Essential" and "Unknown" categories cannot be selected to prevent the website from breaking.
                                    </span>
                                </p>    
                            </div>
                        </div>

                        <div className="bg-gray-800/50 p-4 rounded-xl border border-gray-700 items-center flex gap-4">
                        <div className="bg-red-500/20 h-12 w-12 p-3 rounded-lg flex items-center justify-center text-red-400">
                                <Trash size={24} />
                            </div>
                            <div>
                                <h4 className="text-white font-bold text-sm mb-1">Deleting Selected Cookies</h4>
                                <p className="text-sm text-gray-400 leading-relaxed">
                                    Once you have selected the cookies you want to delete, click the <strong>Delete Selected</strong> button at the bottom of the Active Cookie Table to remove them from your browser.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-yellow-500/10 border border-yellow-500/30 p-4 rounded-lg flex gap-3">
                        <AlertTriangle className="text-yellow-500 shrink-0" size={20} />
                        <p className="text-xs text-yellow-200/80 leading-relaxed">
                            <strong>Why can't I delete everything?</strong><br/>
                            "Essential" cookies are required for the website to function (e.g., keeping you logged in). "Unknown" cookies are also protected because they may be essential but haven't been able to be categorised.
                        </p>
                    </div>



                </div>
            )
        },
        {
            id: 'tech',
            label: 'Technical View',
            icon: Glasses,
            content: (
                <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                    <h3 className="text-2xl font-bold text-white mb-4"> Tailoring your Dashboard Experience</h3>
                    <p className="text-gray-300 leading-relaxed text-base">
                        You can switch the dashboard to <strong>Technical View</strong> to see a more detailed information.
                    </p>

                    <div className='space-y-3'>

                    <div className="bg-gray-800/50 p-4 rounded-xl border border-gray-700 items-center flex gap-4">
                        <div className="bg-orange-500/20 h-12 w-12 p-3 rounded-lg flex items-center justify-center text-orange-400">
                                <Settings size={24} />
                            </div>
                            <div>
                                <h4 className="text-white font-bold text-sm mb-1">How to Use Technical View</h4>
                                <p className="text-sm text-gray-400 leading-relaxed">
                                    Open the <strong>Settings</strong> button in the top-right corner of the dashboard and toggle on <strong>Technical View</strong> to enable it.
                                </p>
                            </div>
                    </div>

                    <div className="bg-gray-800/50 p-4 rounded-xl border border-gray-700 items-center flex gap-4">
                        <div className="bg-lime-500/20 h-12 w-12 p-3 rounded-lg flex items-center justify-center text-lime-400">
                                <Eye size={24} />
                            </div>
                            <div>
                                <h4 className="text-white font-bold text-sm mb-1">When the Technical View is Enabled</h4>
                                <p className="text-sm text-gray-400 leading-relaxed">
                                    The dashboard will replace simple summaries with detailed technical information on each cookie for a deeper more technical understanding.
                                </p>
                            </div>
                    </div>


                </div>
                </div>
                

                
            )
        }
    ];

    const activeContent = tabs.find(t => t.id === activeTab)?.content;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            
            <div 
                ref={help_centre_click}
                className="bg-gray-900 border border-gray-700 rounded-xl w-full max-w-5xl shadow-2xl overflow-hidden flex flex-col h-[600px] max-h-[90vh]">
                
                
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
                               
                                className={`flex-1 w-full text-left px-6 flex items-center justify-between group transition-all duration-200 border-b border-gray-700 last:border-b-0 ${
                                    activeTab === tab.id 
                                        ? 'bg-sky-500/10 text-sky-400 shadow-[inset_3px_0_0_0_#38bdf8]' 
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