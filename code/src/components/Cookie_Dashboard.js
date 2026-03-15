/*global chrome*/
import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { mockCookies } from '../data/mockData.js';
import { calculate_site_privacy_score, map_chrome_cookies } from '../utils/cookieUtils.js';
import { calculate_privacy_streak } from '../utils/privacyStreak.js';
import InfoBar from './InfoBar.js';
import CategoryPanel from './CategoryPanel.js';
import CookieTable from './CookieTable.js';
import CookieModal from './CookieModal.js';
import HelpCentre from './HelpCentre.js';
import SettingsDropdown from './SettingsDropdown.js';
import { XCircle} from 'lucide-react';
import TrophyModal from './TrophyModal.js';
import ScoreCapAlert from './ScoreCapAlert.js';



function CookieDashboard() {
    // State Variables 
    const [cookies, set_cookies] = useState([]); 
    const [active_categories , set_active_categories] = useState([]);
    const [active_risks, set_active_risks] = useState([]);  
    const [cookie_id, set_cookie_id] = useState(null);
    const [popup_message, set_message] = useState('');
    const [isBannerOpen, setIsBannerOpen] = useState(true);
    const [delete_cookies, set_deleted_cookies] = useState([]); 
    const [selected_ids, set_selected_ids] = useState([]);
    const [deleted_cookies_ids, set_deleted_cookies_ids] = useState([]);
    const [current_site, set_current_site] = useState([]);
    const [is_settings_open, set_is_settings_open] = useState(false);
    const [is_helpCentre_open, set_helpCentre] = useState(false);
    const [is_tech_info, set_is_tech_info] = useState(false);
    const [streak, set_streak] = useState(0);
    const [is_trophy_open, set_trophy_open] = useState(0);
    const [is_scoreCap_open , set_scoreCap_open] = useState(false); 


    // Close settings dropdown when clicking outside the menu
    const settings_click = useRef(null);
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
    }, [settings_click]);


   // Fetch cookies from Chrome storage on component mount
    useEffect(() => {
        // Check if running in Chrome Extension environment
        if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
            
            // Get cookies from background script 
            chrome.storage.local.get(['cookies_from_site'], (result) => {
                if (result.cookies_from_site && result.cookies_from_site.length > 0) {
                    console.log("Real Cookies Found:", result.cookies_from_site);
                    const real_data = map_chrome_cookies(result.cookies_from_site);
                    chrome.storage.local.get({['deleted_cookies_ids']: []}, (storage) => {
                        const deleted_ids = storage.deleted_cookies_ids;
                        set_deleted_cookies_ids(deleted_ids);

                        const filtered_data = real_data.filter(cookie => !deleted_ids.includes(cookie.id));
                        set_cookies(filtered_data);
                    });
                    // Extract website name to display on the dashboard in a user friendly format
                    const site_url = result.cookies_from_site[0];
                    
                    if (site_url.domain) {
                        let domain = site_url.domain.toLowerCase();
                        if (domain.startsWith('.')) domain = domain.substring(1);
                       // if (domain.startsWith('www.')) domain = domain.substring(4);
                        set_current_site(domain);
                    }

                } else {
                    console.log("No data found in storage.");
                }
            });
            
        } else {
            // Use mock data if not in Chrome Extension environment - for demo purposes 
            console.log("Dev Mode: Loading Mock Data");
            set_cookies(mockCookies);
        }

        
        calculate_privacy_streak((new_streak_count) => {
            set_streak(new_streak_count);
        });

    }, []); 

    // //Show help centre when first visiting the website 
    // useEffect(() => {   
    //     const has_seen_onboarding = chrome.storage.local.get('has_seen_onboarding');
    //     if (!has_seen_onboarding) {
    //         set_helpCentre(true);
    //         chrome.storage.local.set('has_seen_onboarding', 'true');
    //     }
    // }, []);

    useEffect(() => {   
    // 1. Ask Chrome for the data (this is async)
    chrome.storage.local.get(['has_seen_onboarding'], (result) => {
        
        // 2. Check the result from the callback
        if (!result.has_seen_onboarding) {
            set_helpCentre(true);
            
            // 3. Use .set (not .get) to save the flag for next time
            chrome.storage.local.set({ has_seen_onboarding: true }, () => {
                console.log("Onboarding flag saved to storage.");
            });
        }
    });
    }, []);

    useEffect(() => { 
        if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
            chrome.storage.local.get(['cookie_filters'], (result) => {
                if (result.cookie_filters) {
                    set_active_categories(result.cookie_filters.categories || []);
                    set_active_risks(result.cookie_filters.risks || []);
                } 
            });
        }
    }, []);

    useEffect(() => {
        if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
            chrome.storage.local.set({ 
                cookie_filters: { 
                    categories: active_categories, 
                    risks: active_risks 
                } 
            });
        }
    }, [active_categories, active_risks]);

    // Calculates the privacy score whenever the cookies state changes
    const score_data = useMemo(() => {
        return calculate_site_privacy_score(cookies);
    }, [cookies]);
    
    const { 
        privacy_score, 
        privacy_rank, 
        score_colour, 
        vulnerability_badge_text,
         vulnerability_badge_class 
    } = score_data;
 
    // Finds the cookie the user has clicked on for modal view 
    const current_cookie = useMemo(() => {
        return cookies.find(c => c.id === cookie_id);
    }, [cookies, cookie_id]);

    // Shows the popup notififcation when a cookie has been accepted, rejected or deleted 
    // const show_popup = useCallback((message) => {
    //     const warning = message.toLowerCase().includes('skipped') || message.toLowerCase().includes('deleted');
    //     const title = warning ? "Action Restricted" : "Action Completed";
    //     set_message({text: message, title: title, warning: warning});
    //     setTimeout(() => set_message(''), 3000);
    // }, []);

    const show_popup = useCallback((config) => {
        // If it's a string, convert it to our new object format
        const newPopup = typeof config === 'string' 
            ? { title: "Notification", message: config, warning: false } 
            : config;

        set_message(newPopup);
        // Reset to null (not empty string) so the UI knows it's gone
        setTimeout(() => set_message(null), 3000);
    }, []);

    // Selects all the cookies of that category from the active cookie list of the toggle has been selected 
    const handle_toggles = useCallback((category, is_checked) => {

        console.time(`PT-05: Toggle ${category}`);

        set_active_categories(prev => {
            if (is_checked && !prev.includes(category)) {
                return [...prev, category];
            }
            if (!is_checked && prev.includes(category)) {
                return prev.filter(c => c !== category);
            }
            return prev;
        });
    
        requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            console.timeEnd(`PT-05: Toggle ${category}`);
        });
    });

        // Finds all the cookie ids that belong to that category
        const category_ids = cookies
            .filter(cookie => cookie.category === category)
            .map(cookie => cookie.id);

        set_selected_ids(prev => {
            if (is_checked) {
                // Add back the cookies of this category to the selection
                return [...new Set([...prev, ...category_ids])];
            } else {
                // Remove the cookies of this category from the selection
                return prev.filter(id => !category_ids.includes(id));
            }
        });
    }, [cookies]);

    // Selects all the cookies of that risk level from the active cookie list of the toggle has been selected
    const handle_risk_toggles = useCallback((risk, is_checked) => {
        set_active_risks(prev => {  
            if (is_checked && !prev.includes(risk)) {
                return [...prev, risk];
            }
            if (!is_checked && prev.includes(risk)) {
                return prev.filter(c => c !== risk);
            }
            return prev;
        });

        // Finds all the cookie ids that belong to that risk level
        const risk_ids = cookies
            .filter(cookie => cookie.risk_label === risk)
            .map(cookie => cookie.id);

        set_selected_ids(prev => {
            if (is_checked) {
                // Add back the cookies of this risk level to the selection
                return [...new Set([...prev, ...risk_ids])];
            } else {
                // Remove the cookies of this risk level from the selection
                return prev.filter(id => !risk_ids.includes(id));
            }
        });
    }, [cookies]);

    // Handles the user selecting cookies to accept reject and delete  
    const handle_selection = useCallback((button, ids) => {
        // If there are no cookies selected but the button has been pressed - popup to inform the users to select cookies
        if (ids.length === 0) {
            show_popup({
                title: "No Cookies Selected",
                message:`Please select cookies to ${button.toLowerCase()}.`,
                warning: true
        });
            return;
        }
        
        // Adds the selected cookies into the delete cookie state - this removes the cookies from the active cookies table
        if (button === 'Delete' || button === 'Reject') {

            // Filters Essential and Unknown Cookies so they can't be deleted 
            const safe_ids = ids.map(id => cookies.find(c => c.id === id))
            .filter(c => c && c.category !== 'Essential' && c.category !== 'Unknown');
           

            const skipped_count = ids.length - safe_ids.length;
          
            if (safe_ids.length === 0) {
                show_popup({
                    title: "Action Restricted",
                    message: `No cookies deleted. Essential and some Unknown cookies cannot be deleted.`,
                    warning: true
            });
                return;
            }

            // Sends deletion request to background script 
            if (typeof chrome != 'undefined' && chrome.runtime){
                chrome.runtime.sendMessage({
                    action: 'delete_cookies',
                    cookies: safe_ids
                }, (response) => {
                    if (chrome.runtime.lastError) {
                        console.error("Connection Error", chrome.runtime.lastError);
                    } else if (response && response.success){
                        console.log("Background Success", response);
                    }
                    else{
                        console.log("Background Error", response);
                    }
                });    
            } else{
                console.warn("Chrome API not available");
            }

            set_deleted_cookies(safe_ids);

            const ids_to_store = safe_ids.map(c => c.id);

            chrome.storage.local.get(['deleted_cookies_ids'], (storage) => {
                const existing_ids = storage.deleted_cookies_ids || [];
                const updated_deleted_ids = [...new Set([...existing_ids, ...ids_to_store])];
                chrome.storage.local.set({ deleted_cookies_ids: updated_deleted_ids 
                });
            });

            // Animates the rows deleting to fade out 
            setTimeout(() => {
                set_cookies(prevCookies => prevCookies.filter(cookie => !safe_ids.some(c => c.id === cookie.id)));
                set_deleted_cookies([]);

                set_active_categories([]);
                set_active_risks([]);
                set_selected_ids([]);

                
                if (skipped_count > 0) {
                    show_popup({
                        title: "Action Partially Restricted",
                        message: ` ${button}d ${safe_ids.length} cookies. Skipped ${skipped_count} essential/unknown cookie(s).`,
                        warning: true
                    });
                }
                else{ 
                    show_popup({
                        title: "Action Completed",
                        message: `${button}d ${safe_ids.length} cookie(s).`,
                        warning: false
                    });
                }
            }, 300);
        } else { 
            // If the button is accept - no rows are removed so no animation 
            show_popup({
                title: "Action Completed",
                message: `Accepted ${ids.length} cookie(s).`,
                warning: false
            });
            set_active_categories([]);
            set_active_risks([]);
            set_selected_ids([]);
        }
    }, [show_popup, cookies]);


    // 
    return (
        // Sets the dashboards max width to a certain size and centers it on the screen 
        <div className="max-w-7xl mx-auto">
            {/* Container for the dashboard */}
            <div className="bg-gray-900 border border-gray-700 shadow-2xl rounded-xl p-6 md:p-8">
                <header className="border-b border-gray-700 pb-4 mb-6 flex justify-between items-start">
                    <div>
                        <div className="flex sm:flex-row sm:items-center sm:gap-4">
                            <h1 className="text-3xl font-bold text-white">Cookie Dashboard</h1>
                            <span id="risk_badge" className={vulnerability_badge_class}>{vulnerability_badge_text}</span>
                        </div>
                        <p className="text-gray-400 mt-1">
                            Manage your cookie settings for <span className='text-sky-400 font-medium'>{current_site}</span>.
                        </p>
                    </div>
                    <SettingsDropdown 
                        is_settings_open={is_settings_open} 
                        set_is_settings_open={set_is_settings_open} 
                        is_tech_info={is_tech_info} 
                        set_is_tech_info={set_is_tech_info} 
                        on_open_help={() => {
                            set_helpCentre(true);
                            set_is_settings_open(false);
                        }}
                    />
</header>

                {/* Info Banner to inform users what cookies are and allows them to x out this tab */}
            {isBannerOpen && (
                <div id="cookie_info" className="relative bg-sky-800 text-sky-100 p-4 rounded-lg mb-6 border border-sky-600 shadow-lg">
                    <button id="cookie_description" className="absolute top-3 right-3 text-sky-200 hover:text-white" onClick={() => setIsBannerOpen(false)}>
                        <XCircle size={20} />
                    </button>
                    <h3 className="font-semibold text-lg mb-1">What are Cookies?</h3>
                    <p className="text-sm">
                        Cookies are small text files websites store on your browser. They are used to remember your preferences (like language), keep you logged in (session cookies), and, in some cases, track your activity across different sites for advertising. This dashboard helps you see and control them.
                    </p>
                </div>
            )}

                <InfoBar 
                    privacy_score={privacy_score} 
                    privacy_rank={privacy_rank} 
                    score_colour={score_colour}
                    streak={streak}
                    on_open_trophies={() => set_trophy_open(true)}
                />

                <TrophyModal
                    isOpen={is_trophy_open}
                    onClose={() => set_trophy_open(false)}
                    streak={streak}
                />

                <ScoreCapAlert 
                current_score={privacy_score}
                is_scoreCap_open={is_scoreCap_open}
                set_is_scoreCap_open={set_scoreCap_open} 
                />  


                <main className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <CategoryPanel 
                        cookies={cookies} 
                        is_tech_info={is_tech_info}
                        
                    />
                    <CookieTable 
                        cookies={cookies} 
                        delete_cookies={delete_cookies}
                        view_info={set_cookie_id}
                        if_pressed={handle_selection} 
                        selected_ids={selected_ids}
                        set_selected_ids={set_selected_ids}
                        active_categories={active_categories} 
                        on_toggle={handle_toggles} 
                        active_risks={active_risks}
                        on_risk_toggle={handle_risk_toggles}
                    />
                </main>
            </div>
            
            {/* styling for popup message for accepting/rejecting/deleting cookies */}
            {/* <div 
                id="popup_message" 
                className={`fixed bottom-10 right-10 bg-gray-700 text-white py-3 px-5 rounded-lg shadow-xl transition-all duration-300 ${popup_message ? '' : 'translate-y-20 opacity-0'}`}
            >
                {popup_message}
            </div> */}

        <div className={`fixed inset-0 z-[100] flex items-center justify-center pointer-events-none transition-all duration-300 ${popup_message ? 'opacity-100' : 'opacity-0'}`}>
            {/* Use optional chaining (?.) so it doesn't crash when popup_message is null */}
            <div 
                className={`bg-gray-800 border-2 p-6 rounded-2xl flex flex-col items-center gap-4 transform transition-all duration-500 shadow-2xl
                ${popup_message?.warning ? 'border-amber-500 shadow-amber-500/20' : 'border-sky-500 shadow-sky-500/20'}
                ${popup_message ? 'scale-100 translate-y-0' : 'scale-90 translate-y-4'}`}
            >
                {/* Icon changes based on warning status */}
                <div className={`w-12 h-12 rounded-full flex items-center justify-center border-2 
                    ${popup_message?.warning ? 'bg-amber-500/20 border-amber-500 text-amber-500' : 'bg-sky-500/20 border-sky-400 text-sky-400'}`}>
                    {popup_message?.warning ? '!' : '✓'}
                </div>

                <div className="text-center">
                    <h3 className="text-white font-bold text-lg mb-1 tracking-tight">
                        {popup_message?.title}
                    </h3>
                    <p className="text-gray-300 text-sm max-w-[240px] leading-relaxed">
                        {popup_message?.message}
                    </p>
                </div>

                {/* Progress Bar Color Sync */}
                <div className="w-full h-1 bg-gray-700 rounded-full overflow-hidden mt-2">
                    <div className={`h-full transition-all duration-[3000ms] linear ${popup_message ? 'w-full' : 'w-0'} 
                        ${popup_message?.warning ? 'bg-amber-500' : 'bg-sky-500'}`} 
                    />
                </div>
            </div>
        </div>

            {/* Cookie description pop up */}
            <CookieModal 
                cookie={current_cookie}
                isOpen={!!cookie_id}
                onClose={() => set_cookie_id(null)}
                is_tech_info={is_tech_info}
                current_site_domain={current_site}
            />

            <HelpCentre 
                isOpen={is_helpCentre_open}
                onClose={() => set_helpCentre(false)}

            />
        </div>
    );
}

export default CookieDashboard;