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
    const [cookie_id, set_cookie_id] = useState(null);
    const [popup_message, set_message] = useState('');
    const [isBannerOpen, setIsBannerOpen] = useState(true);
    const [delete_cookies, set_deleted_cookies] = useState([]); 
    const [selected_ids, set_selected_ids] = useState([]);
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
                    set_cookies(real_data);

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

    // Show help centre when first visiting the website 
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
    const show_popup = useCallback((message) => {
        set_message(message);
        setTimeout(() => set_message(''), 2000);
    }, []);

    // Selects all the cookies of that category from the active cookie list of the toggle has been selected 
    const handle_toggles = useCallback((category, is_checked) => {
        set_active_categories(prev => {
            if (is_checked && !prev.includes(category)) {
                return [...prev, category];
            }
            if (!is_checked && prev.includes(category)) {
                return prev.filter(c => c !== category);
            }
            return prev;
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

    // Handles the user selecting cookies to accept reject and delete  
    const handle_selection = useCallback((button, ids) => {
        // If there are no cookies selected but the button has been pressed - popup to inform the users to select cookies
        if (ids.length === 0) {
            show_popup(`Please select cookies to ${button.toLowerCase()}.`);
            return;
        }
        
        // Adds the selected cookies into the delete cookie state - this removes the cookies from the active cookies table
        if (button === 'Delete' || button === 'Reject') {

            // Filters Essential and Unknown Cookies so they can't be deleted 
            const safe_ids = ids.map(id => cookies.find(c => c.id === id))
            .filter(c => c && c.category !== 'Essential' && c.category !== 'Unknown');
           

            const skipped_count = ids.length - safe_ids.length;
          
            if (safe_ids.length === 0) {
                show_popup(`No cookies deleted. Essential/Unknown cookies cannot be deleted.`);
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

            // Animates the rows deleting to fade out 
            setTimeout(() => {
                set_cookies(prevCookies => prevCookies.filter(cookie => !ids.includes(cookie.id)));
                set_deleted_cookies([]);

                set_active_categories([]);
                set_selected_ids([]);

                
                if (skipped_count > 0) {
                    show_popup(` ${button}d ${safe_ids.length} cookies. Skipped ${skipped_count} essential cookie(s).`);
                }
                else{ 
                    show_popup(`${button}d ${safe_ids.length} cookie(s).`);
                }
            }, 300);
        } else { 
            // If the button is accept - no rows are removed so no animation 
            show_popup(`Accepted ${ids.length} cookie(s).`);
            set_active_categories([]);
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
                    />
                </main>
            </div>
            
            {/* styling for popup message for accepting/rejecting/deleting cookies */}
            <div 
                id="popup_message" 
                className={`fixed bottom-10 right-10 bg-gray-700 text-white py-3 px-5 rounded-lg shadow-xl transition-all duration-300 ${popup_message ? '' : 'translate-y-20 opacity-0'}`}
            >
                {popup_message}
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