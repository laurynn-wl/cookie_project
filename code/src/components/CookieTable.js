import {useMemo, useCallback} from 'react';
import CookieRow from './CookieRow';
import {Lock, BadgeInfo } from 'lucide-react';
import { category_data, category_colour} from '../data/mockData';

const Active_cookie_table = ({ cookies, delete_cookies, view_info, if_pressed, selected_ids, set_selected_ids, active_categories, on_toggle}) => {
    
    const handle_select_all = useCallback((e) => {
        const checked = e.target.checked;
        if(checked){
            const all_ids = cookies.map(c => c.id);
            set_selected_ids(all_ids);
        }
        else{
            set_selected_ids([]);
        }
    }, [cookies, set_selected_ids]);

    const handle_select_row = useCallback((id, checked) => {
        set_selected_ids(prev => {
            if (checked){
                return[...prev, id];
            }
            else{
                return prev.filter(i => i !==id);
            }
        })
    },[set_selected_ids])      
    
    const row_count = cookies.length;
    const checked_count = selected_ids.length;
    const is_multiple_rows = checked_count > 0 && checked_count < row_count;
    const is_all_checked = checked_count === row_count && row_count > 0;

    // generates the components of each cookie_row 
    const cookie_rows = useMemo(() => {
        return cookies.map(cookie => (
            <CookieRow
                key={cookie.id} 
                cookie={cookie} 
                is_selected={selected_ids.includes(cookie.id)} 
                on_selected={handle_select_row}
                view_info={view_info}
                is_deleted={delete_cookies.includes(cookie.id)}
            />
        ));
    }, [cookies, selected_ids, handle_select_row, view_info, delete_cookies]);

    const toggle_banner = Object.keys(category_data).map(category => {
        const is_essential = category === 'Essential';
        const is_toggled = active_categories ? active_categories.includes(category) : true;

        return (
            <div key={category} className="flex items-center gap-3 bg-gray-900 px-3 py-2 rounded-lg border border-gray-700">
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: category_colour[category] }}></span>
                <span className="text-sm font-medium text-gray-300">{category}</span>
                {is_essential && (
                        <div className="infotip">
                            <Lock size={12} className="text-gray-500 cursor-help" />
                            <span className="infotiptext w-32 text-xs text-center ml-1 font-normal normal-case">
                                These cookies are stricty necessary for website functionality so they can't be disabled.
                            </span>
                        </div>
                        )}
                
                <div className="relative inline-block w-8 align-middle select-none transition duration-200 ease-in ml-1">
                    <input 
                        type="checkbox" 
                        id={`banner-toggle-${category}`} 
                        className="toggle-checkbox absolute block w-4 h-4 rounded-full bg-white border-4 appearance-none cursor-pointer" 
                        checked={is_toggled}
                        onChange={(e) => on_toggle(category, e.target.checked)}
                        disabled={is_essential}
                    />
                    <label htmlFor={`banner-toggle-${category}`} className={`toggle-label block overflow-hidden h-4 rounded-full cursor-pointer ${is_essential ? 'opacity-50 cursor-not-allowed' : 'bg-gray-600'}`}></label>
                </div>
            </div>
        );
    });

    return (
        <div className="lg:col-span-2 bg-gray-800 p-6 rounded-lg border border-gray-700">
            <div className ="flex items-center gap-2 mb-4">
            <h2 className="text-2xl font-bold text-white">Active Cookies</h2>
            <div className="infotip flex items-center">
            <BadgeInfo size={20} className="w-5 h-5 text-gray-300 cursor-help" />
            <span className="infotiptext w-64">
                Active Cookies Explanation
            </span>
            </div>
            </div>

            <div className="mb-6 p-4 bg-gray-700/30 rounded-lg border border-gray-600/50">
                <div className="flex flex-wrap gap-4 items-center justify-between">
                    <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider"> Select cookie Categories:</span>
                    <div className="flex flex-wrap gap-3">
                        {toggle_banner}
                    </div>
                </div>
            </div>
            
            
            <div className="overflow-x-auto">
                <table className="w-full text-left table-auto">
                    <thead className="border-b border-gray-600 text-gray-400 text-sm font-semibold">
                        <tr>
                            <th className="p-3">
                                <input 
                                    type="checkbox" 
                                    id="select_all" 
                                    onChange={handle_select_all} 
                                    checked={is_all_checked} 
                                    ref={el => el && (el.indeterminate = is_multiple_rows)} 
                                />
                            </th>
                            <th className="p-3">NAME</th>
                            <th className="p-3">DOMAIN</th>
                            <th className="p-3">CATEGORY</th>
                            <th className="p-3">INSIGHTS</th>
                        </tr>
                    </thead>
                    <tbody id="cookie_table" className="divide-y divide-gray-700">
                        {cookie_rows}
                    </tbody>
                </table>
            </div>
            
            {/* Displays a message if no cookies are found */}
            {row_count === 0 && (
                <div id="no_cookies" className="text-center p-8 text-gray-400">
                    <p>No cookies found or all cookies have been deleted.</p>
                </div>
            )}
            
            <div className="flex flex-col sm:flex-row gap-3 mt-6">
                <button 
                    id="accept_btn" 
                    className="flex-1 bg-sky-600 hover:bg-sky-800 text-white font-medium py-2 px-4 rounded-lg transition duration-150"
                    onClick={() => if_pressed('Accept', selected_ids)}
                >
                    Accept Selected
                </button>
                <button 
                    id="reject_btn" 
                    className="flex-1 bg-sky-600 hover:bg-sky-800 text-white font-medium py-2 px-4 rounded-lg transition duration-150"
                    onClick={() => if_pressed('Reject', selected_ids)}
                >
                    Reject Selected
                </button>
                <button 
                    id="delete_btn" 
                    className="flex-1 bg-sky-600 hover:bg-sky-800 text-white font-medium py-2 px-4 rounded-lg transition duration-150"
                    onClick={() => if_pressed('Delete', selected_ids)}
                >
                    Delete Selected
                </button>
            </div>
        </div>
    );
};

export default Active_cookie_table;