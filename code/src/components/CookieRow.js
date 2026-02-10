import { get_insights } from '../utils/cookieUtils';


/**
 * 
 */
const cookie_row = ({ cookie, is_selected, on_selected, view_info, is_deleted }) => {
    
    // Opens cookie detail view unless the checkbox was clicked 
    const handle_click = (e) => {
        if (e.target.type !== 'checkbox') {
            view_info(cookie.id);
        }
    };

    // Notifies when a cookie is selected or deselected
    const handle_checkbox = (e) => {
        on_selected(cookie.id, e.target.checked);
    };

    // Makes the colour of the box lighter when a user hovers over each cookie, fades the row is cookie is rejected or deleted
    let rows = "hover:bg-gray-600 cursor-pointer !text-gray-200";

    if (is_deleted){
        rows += "fade-out";
    }

    return (
        <tr className={rows} data-cookie-id={cookie.id} onClick={handle_click}>
            <td className="p-3">
                <input 
                    type="checkbox" 
                    className="cookie-checkbox" 
                    data-id={cookie.id} 
                    data-category={cookie.category} 
                    checked={is_selected}
                    onChange={handle_checkbox}
                />
            </td>
            <td className="p-3">{cookie.name}</td>
            <td className="p-3">{cookie.domain}</td>
            <td className="p-3">{cookie.category}</td>
            {/* If badges can't fit on one line place the next badge underneath*/}
            <td className="p-3 flex flex-wrap gap-1">{get_insights(cookie.risk_label)}</td>
        </tr>
    );
};

export default cookie_row;