import {useMemo, useCallback, useState} from 'react';
import CookieRow from './CookieRow';
import {Lock, BadgeInfo, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { category_data, category_colour} from '../data/mockData';

const Active_cookie_table = ({ cookies, delete_cookies, view_info, if_pressed, selected_ids, set_selected_ids, active_categories, on_toggle}) => {

    // Current sort column and direction
    const [searchTerm, setSearchTerm] = useState ({key: null, direction: 'ascending'});

    // Filters cookies based on active categoty toggle 
    const filtered_cookies = useMemo(() => {

        if (active_categories.length > 0) {
            return cookies.filter(cookie => active_categories.includes(cookie.category));
        }
        return cookies;
        
    }, [cookies, active_categories]);


    // (de)Selects visible cookies 
    const handle_select_all = useCallback((e) => {
        const checked = e.target.checked;
        if(checked){
            const all_ids = filtered_cookies.map(c => c.id);
            set_selected_ids(all_ids);
        }
        else{
            set_selected_ids([]);
        }
    }, [filtered_cookies, set_selected_ids]);

    // Handles selection of cookie rows (checkbox)
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

    // Handle sorting state 
    const handle_sort = useCallback((key) => {
        setSearchTerm(prev => {
            if (prev.key === key){
                return {key, direction: prev.direction === 'ascending' ? 'descending' : 'ascending'};
            }
            else{
                return {key, direction: 'ascending'};
            }
        });
    }, []);

    // Sorts cookies based on column and direction 
    const sorted_rows = useMemo(() => {
        let sorted_cookies = [...filtered_cookies];
        if (searchTerm.key !== null){
            sorted_cookies.sort((a,b) => {
                let a_value = a[searchTerm.key];
                let b_value = b[searchTerm.key];

                if (a_value === null|| a_value === undefined) a_value = '';
                if (b_value === null|| b_value === undefined) b_value = '';

                if (typeof a_value === 'string') a_value = a_value.toLowerCase();
                if (typeof b_value === 'string') b_value = b_value.toLowerCase();

                if (a_value < b_value) {
                    return searchTerm.direction ==='ascending' ? -1 : 1;
                }
                if (a_value > b_value) {
                    return searchTerm.direction ==='ascending' ? 1 : -1;
                }
                return 0;
            });
        }
        return sorted_cookies;
    }, [filtered_cookies, searchTerm]);

    // Changes the icon based on the sort 
    const get_arrow_icon = (columnName) => {
        if (searchTerm.key !== columnName) return (<ArrowUpDown size={18} className="inline-block ml-1 text-gray-600" />);
        if (searchTerm.direction === 'ascending') return (<ArrowUp size={18} className="inline-block ml-1 text-sky-400" />);
        return (<ArrowDown size={18} className="inline-block ml-1 text-sky-400" />);
    }

    const row_count = sorted_rows.length;
    const checked_count = selected_ids.length;
    const is_multiple_rows = checked_count > 0 && checked_count < row_count;
    const is_all_checked = checked_count === row_count && row_count > 0;

    // generates the table rows of each cookie 
    const cookie_rows = useMemo(() => {
        return sorted_rows.map(cookie => (
            <CookieRow
                key={cookie.id} 
                cookie={cookie} 
                is_selected={selected_ids.includes(cookie.id)} 
                on_selected={handle_select_row}
                view_info={view_info}
                is_deleted={delete_cookies.includes(cookie.id)}
            />
        ));
    }, [sorted_rows, selected_ids, handle_select_row, view_info, delete_cookies]);

    // Selects all cookies for that category when toggled 
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
                                These cookies are stricty necessary for website functionality so they can't be rejected or deleted.
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
                        aria-label={category}
                    />
                    <label 
                    htmlFor={`banner-toggle-${category}`} 
                    className="toggle-label block overflow-hidden h-4 rounded-full cursor-pointer bg-gray-600"
                    ></label>
                </div>
            </div>
        );
    });

    return (
        <div className="lg:col-span-2 bg-gray-800 p-6 rounded-lg border border-gray-700">
            <div className ="flex items-center gap-2 mb-4">
            <h2 className="text-2xl font-bold text-white">Active Cookies</h2>
            <h2 className="bg-gray-700 text-gray-300 text-base font-bold px-2.5 py-0.5 rounded-full border border-gray-600">
                    {'Total Cookies: ' + row_count}
                </h2>
            <div className="infotip flex items-center">
            <BadgeInfo size={20} className="w-5 h-5 text-gray-300 cursor-help" />
            <span className="infotiptext w-64">
                
                    <p className='block font-bold text-center text-sm mb-3 text-white border-b border-gray-600 pb-2'>
                    This table displays all active cookies found on the current website.
                    </p>

                    <p className='leading-relaxed text-xs text-left'>
                    • <strong> Inspect: </strong> Click on each row to view detailed information about that cookie.
                    <br />
                    • <strong> Delete: </strong> Select individual cookies or categories to reject and delete them. 
                    <br />
                    • <strong> Sorting: </strong> Click on the column headers to sort cookies by Name, Domain, Category, or Insights.
                    <br />
                    • <strong> Risk Level: </strong> Cookies are assigned a risk level based on their category and potential impact.
                    <br />
                    </p>
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
            
            <div className="mb-6 bg-cyan-950/30 border border-cyan-500/30 p-4 rounded-lg flex gap-3 items-start">
                <BadgeInfo className="text-cyan-400 shrink-0 mt-0.5" size={18} />
                <p className="text-sm text-gray-300 leading-relaxed">
                    <strong className="text-cyan-400 font-semibold uppercase text-xs tracking-tighter mr-1">Pro Tip:</strong> 
                    To delete cookies scroll to the bottom of this table and click
                    <span className="italic"> "Delete Selected".</span>
                </p>
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
                            <th className="p-3 cursor-pointer hover:text-white transition-colors" onClick={() => handle_sort('name')}>
                                <div className="flex items-center">
                                    NAME {get_arrow_icon('name')}
                                </div>
                            </th>
                            <th className="p-3 cursor-pointer hover:text-white transition-colors" onClick={() => handle_sort('domain')}>
                                <div className="flex items-center">
                                    DOMAIN {get_arrow_icon('domain')}
                                </div>
                            </th>
                            <th className="p-3 cursor-pointer hover:text-white transition-colors" onClick={() => handle_sort('category')}>
                                <div className="flex items-center">
                                    CATEGORY {get_arrow_icon('category')}
                                </div>
                            </th>
                            <th className="p-3 cursor-pointer hover:text-white transition-colors" onClick={() => handle_sort('risk_score')}>
                                <div className="flex items-center">
                                    INSIGHTS {get_arrow_icon('risk_score')}
                                </div>
                            </th>
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