import { useState, useMemo, useCallback } from 'react';
import { mockCookies } from '../data/mockData.js';
import { cookie_score_data } from '../utils/cookieUtils.js';
import InfoBar from './InfoBar.js';
import CategoryPanel from './CategoryPanel.js';
import CookieTable from './CookieTable.js';
import CookieModal from './CookieModal.js';
import { XCircle } from 'lucide-react';

//TODO: Add info icons for each section to explain to users what each section is 
// TODO: remove styling for mobiles  

function CookieDashboard() {
    // States 
    const [cookies, set_cookies] = useState(mockCookies); 
    const [active_categories , set_active_categories] = useState(['Essential']);
    const [cookie_id, set_cookie_id] = useState(null);
    const [popup_message, set_message] = useState('');
    const [isBannerOpen, setIsBannerOpen] = useState(true);
    const [delete_cookies, set_deleted_cookies] = useState([]); 
    const [selected_ids, set_selected_ids]    = useState([]);

    
    //TODO: change this when the logic is implemented - currently using mock data for dashboard 
    const { privacy_score, privacy_rank, score_colour, vulnerability_badge_class, vulnerability_badge_text } = cookie_score_data;
    
    // Finds the cookie the user has clicked on 
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
        // If there are no cookies selected but the button hasd been pressed - popup to inform the users to select cookies
        if (ids.length === 0) {
            show_popup(`Please select cookies to ${button.toLowerCase()}.`);
            return;
        }
        
        // Adds the selected cookies into the delete cookie state - this remopves the cookies from the active cookies table
        if (button === 'Delete' || button === 'Reject') {
            set_deleted_cookies(ids);

            // Animates the rows deleting to fade out 
            setTimeout(() => {
                set_cookies(prevCookies => prevCookies.filter(cookie => !ids.includes(cookie.id)));
                set_deleted_cookies([]);
                show_popup(`${button}ed ${ids.length} cookie(s).`);
            }, 300);
        } else { 
            // If the button is accept - no rows are removed so no animation 
            show_popup(`Accepted ${ids.length} cookie(s).`);
        }
    }, [show_popup]);

    // 
    return (
        // Sets the dashboards max width to a certain sixe and centers it on the screen 
        <div className="max-w-6xl mx-auto">
            {/* Container for the dashboard */}
            <div className="bg-gray-900 border border-gray-700 shadow-2xl rounded-xl p-6 md:p-8">
                
                <header className="border-b border-gray-700 pb-4 mb-6">
                    <div className="flex sm:flex-row sm:items-center sm:gap-4">
                        <h1 className="text-3xl font-bold text-white">Cookie Dashboard</h1>
                        <span id="risk_badge" className={vulnerability_badge_class}>{vulnerability_badge_text}</span>
                    </div>
                    <p className="text-gray-400 mt-1">Manage your cookie settings for the current site.</p>
                </header>
                
                {/* Info Banner to inform users what cpookies are and allows them to x out this tab */}
            {isBannerOpen && (
                <div id="cookie_info" className="relative bg-sky-800 text-sky-100 p-4 rounded-lg mb-6 border border-sky-600 shadow-lg">
                    <button id="cookie_description" className="absolute top-3 right-3 text-sky-200 hover:text-white" onClick={() => setIsBannerOpen(false)}>
                        <XCircle size={20} />
                    </button>
                    <h3 className="font-semibold text-lg mb-1">What are Cookies?</h3>
                    <p className="text-sm">
                        {/*TODO: Change description based on research*/}
                        Cookies are small text files websites store on your browser. They are used to remember your preferences (like language), keep you logged in (session cookies), and, in some cases, track your activity across different sites for advertising. This dashboard helps you see and control them.
                    </p>
                </div>
            )}

                <InfoBar privacy_score={privacy_score} privacy_rank={privacy_rank} score_colour={score_colour} />

                <main className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <CategoryPanel 
                        cookies={cookies} 
                        
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
            
            {/* stlying for popup message for accepting/rejecting/deleting cookies */}
            <div 
                id="popup_message" 
                className={`fixed bottom-10 right-10 bg-gray-700 text-white py-3 px-5 rounded-lg shadow-xl transition-all duration-300 ${popup_message ? '' : 'translate-y-20 opacity-0'}`}
            >
                {popup_message}
            </div>

            {/* Cookie description pop up */}
            <CookieModal 
                cookie={current_cookie}
                is_open={!!cookie_id}
                is_closed={() => set_cookie_id(null)}
            />
        </div>
    );
}

export default CookieDashboard;