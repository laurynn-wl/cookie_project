/*global chrome*/
import React, { useEffect, useRef } from 'react';
import { Settings, HelpCircle, Calculator } from 'lucide-react';

const SettingsDropdown = ({ 
    is_settings_open, 
    set_is_settings_open, 
    is_tech_info, 
    set_is_tech_info,
    on_open_help
}) => {
    const settings_click = useRef(null);

    // Close settings dropdown when clicking outside the menu
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (settings_click.current && !settings_click.current.contains(event.target)) {
                set_is_settings_open(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [set_is_settings_open]);

    // Function to open GitHub
    const open_github = () => {
        const repoUrl = 'https://github.com/laurynn-wl/cookie_project/blob/main/docs/risk_scoring.md'; // <--- REPLACE THIS URL

        if (typeof chrome !== 'undefined' && chrome.tabs) {
            chrome.tabs.create({ url: repoUrl });
        } else {
            window.open(repoUrl, '_blank');
        }
        // Optional: Close the dropdown after clicking
        set_is_settings_open(false);
    };


    return (
        <div className="relative" ref={settings_click}>
            <button
                onClick={() => set_is_settings_open(!is_settings_open)}
                className={`p-2 rounded-full transition-colors ${
                    is_settings_open ? 'bg-sky-800 text-white' : 'text-gray-400 hover:text-white hover:bg-sky-600'
                }`}
            >
                <Settings size={36} />
            </button>

            {is_settings_open && (
                <div className="absolute right-0 top-12 w-64 bg-gray-800 border-2 border-sky-600 rounded-lg shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="p-4 border-b border-gray-700">
                        <h3 className="text-white text-base font-bold mb-3">Dashboard Settings</h3>

                        {/* Toggle switch for technical view */}
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-300">Technical View</span>
                            <button
                                onClick={() => set_is_tech_info(!is_tech_info)}
                                className={`relative inline-flex h-7 w-11 items-center rounded-full transition-colors ${
                                    is_tech_info ? 'bg-sky-600' : 'bg-gray-600'
                                }`}
                            >
                                <span
                                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                        is_tech_info ? 'translate-x-6' : 'translate-x-1'
                                    }`}
                                />
                            </button>
                        </div>
                        <p className="text-xs text-gray-500 mt-2">
                            {is_tech_info ? "Displaying technical explanations." : "Displaying simple explanations."}
                        </p>
                    </div>

                    <div className="p-2 space-y-1">
                        <button 
                            onClick={on_open_help}
                            className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-300 hover:bg-gray-700 rounded-md transition-colors text-left group">
                            <HelpCircle size={16} className="text-sky-400 group-hover:text-sky-600" /> Help Centre
                        </button>
                        <button 
                            onClick={open_github}
                            className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-300 hover:bg-gray-700 rounded-md transition-colors text-left group">
                            <Calculator size={16} className="text-sky-400 group-hover:text-sky-600" /> Cookie Calculation Logic
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SettingsDropdown;