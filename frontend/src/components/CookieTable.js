import { useState, useMemo, useCallback, useEffect } from 'react';
import CookieRow from './CookieRow';

const Active_cookie_table = ({ cookies, delete_cookies, view_info, if_pressed }) => {
    const [selected_ids, set_ids] = useState([]);

    // Removes deleted and rejected from selection 
    useEffect(() => {
        set_ids(prev => prev.filter(id => cookies.some(c => c.id === id)));
    }, [cookies]);

    
    const handle_select_all = useCallback((e) => {
        const checked = e.target.checked;

        if(checked){
            const all_ids = cookies.map(c => c.id);
            set_ids(all_ids);
        }
        else{
            set_ids([]);
        }
    }, [cookies]);

    const handle_select_row = useCallback((id, checked) => {
        set_ids(prev => {
            if (checked){
                return[...prev, id];
            }
            else{
                return prev.filter(i => i !==id);
            }
        })
    },[])      
    
   
   
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

    return (
        <div className="lg:col-span-2 bg-gray-800 p-6 rounded-lg border border-gray-700">
            <h2 className="text-2xl font-bold text-white mb-4">Active Cookies</h2>
            
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
            {/*TODO: Ask Steve if i should keep the red amber green section or keep the buttons one colour */}
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