// frontend/src/components/CategoryPanel.js
import React, { useMemo, useRef, useState, useEffect } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer} from 'recharts';
import { prepareChartData } from '../utils/cookieUtils';
import { category_data, category_colour} from '../data/mockData';
import { category_explanation } from '../data/DashboardExplanations';   
import privacy_tip_data from '../data/privacyTipData';
import { BadgeInfo, Eye, List, X } from 'lucide-react';



// Information component for each cookie category on hover
const CategoryHover = ({ active, payload, is_tech_info }) => {
    // Show explanation only when active and payload exists
    if (active && payload && payload.length) {
        const data = payload[0].payload; 
        const category_name = data.name;

        return (
            <div className="bg-gray-800 border border-gray-500 p-3 rounded-lg shadow-lg max-w-s">
                {/*Category Name and Count*/} 
                <p className=" text-base font-bold text-white mb-1">{category_name}: {data.value} Cookies</p>
            </div>
        );
    }
    return null;
};

// Cookie category component for displaying cookie categories 
const Category_panel = ({ cookies, is_tech_info }) => {
    
    // State to manage modal visibility
    const [is_open, set_is_open] = useState(false); 

    const category_details_click = useRef(null);

    useEffect(() => {
            const handleClickOutside = (event) => {
                if ( is_open && category_details_click.current && !category_details_click.current.contains(event.target)) {
                    set_is_open(false);
                }
            };
            if (is_open) {
                document.addEventListener('mousedown', handleClickOutside);
            }

            return () => {
                document.removeEventListener('mousedown', handleClickOutside);
            };
        }, [is_open]);

    // Caches the data to avoid recalculating on every time the cookies change
    const piechart_cookie_data = useMemo(() => prepareChartData(cookies), [cookies]);

    // Creates a lookup object for cookie counts by category
    const cookie_category_count = useMemo(() => {
        const lookup = {};
        Object.keys(category_data).forEach(category => lookup[category] = 0);
        piechart_cookie_data.forEach(item => {
            lookup[item.name] = item.value;
        });
        return lookup;
    }, [piechart_cookie_data]);

    // Selects a random privacy tip on each render
    const [current_tip] = useState(() => {
        const tip_index = Math.floor(Math.random() * privacy_tip_data.length);
        return privacy_tip_data[tip_index];
    });

    
    // Generates legend items for each category
    const legend_items = useMemo(() => {
        return Object.keys(category_data).map(category => {

            // Explanation changes based on technical, or non technical view 
            const explanation = is_tech_info
            ? category_explanation[category]?.technical
            : category_explanation[category]?.simple

            return (
                <div key={category} className="flex justify-between items-center">
                    {/*Displays the colour dot for each category*/}
                    <div className="flex items-center gap-3">
                        <span className="w-5 h-5 rounded-full" style={{ backgroundColor: category_colour[category] }}></span>
                        <div className="infotip">
                            <span className="font-medium cursor-help border-b border-dotted border-gray-500 text-base text-gray-300">
                                {category}
                            </span>
                            {/*Displays information text for each category*/}
                            <span 
                                className="infotiptext">{explanation}</span>
                        </div>
                    </div>
                </div>
            );
        });
    }, [is_tech_info]);

    return (
        <div className="lg:col-span-1 bg-gray-800 p-6 rounded-lg border border-gray-700">
            <div className ="flex items-center gap-2 mb-4">
                <h2 className="text-2xl font-bold text-white">Cookie Categories</h2>
                <div className="infotip flex items-center">
                     {/* When hovering over the info icon, a tooltip appears explaining how the privacy score is calculated */}
                <BadgeInfo size={20} className="w-5 h-5 text-gray-300 cursor-help" />
                <span className="infotiptext">
                        <p className='block font-bold text-center text-sm mb-3 text-white border-b border-gray-600 pb-2'>
                        This panel breaks down cookies intop their functional categories.
                        </p>

                        <p className='leading-relaxed text-xs text-left'>
                        • <strong>Pie Chart: </strong> Hover over the segments to see the number of cookies in each category.
                        <br />
                        • <strong>View Category Details: </strong> Click the button to view detailed explanations for each category. 
                        </p>
                </span>
            </div>
            </div>

            {/*Button for detailed category breakdown*/}
            <button 
                onClick={() => set_is_open(true)}
                className="mb-4 w-full flex items-center justify-center gap-2 bg-gray-700/50 hover:bg-gray-700 text-sky-400 hover:text-sky-300 py-1.5 px-3 rounded-md transition-all text-sm font-semibold border border-gray-600/50 hover:border-gray-500">
                <Eye size={20} />
                View Category Details
            </button>

            <div className="w-full h-64 mx-auto my-2"> 
                <ResponsiveContainer width="100%" height="100%">
                       {/*Piechart using Recharts*/}
                    <PieChart>
                        <Pie
                            data={piechart_cookie_data}
                            cx="50%" 
                            cy="50%"
                            innerRadius={0} 
                            outerRadius={80}
                            paddingAngle={0}
                            dataKey="value"
                            stroke="none"
                        >
                            {/*Fills colours for each category on the piechart*/} 
                            {piechart_cookie_data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                        </Pie>
                        
                        {/* Displays text info for piechart */}
                        <Tooltip content={<CategoryHover is_tech_info={is_tech_info}/>} />
                        
                    </PieChart>
                </ResponsiveContainer>
            </div>

            <div className="space-y-5">
                {legend_items}
            </div>
            
          
            <div className="mt-8 pt-6 border-t border-gray-700">
                <h3 className="text-xl font-semibold text-white mb-2">Privacy Tip</h3>
                <p className="text-sm text-gray-200">
                    {current_tip.text}
                </p>
            </div>
            {/* Modal for detailed category breakdown*/}
            {is_open && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div 
                        ref ={category_details_click}
                        className="bg-gray-800 border border-gray-700 rounded-xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
                        
                        <div className="flex items-center justify-between p-4 border-b border-gray-700 bg-gray-900">
                            <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                <List size={20} className="text-sky-400"/>
                                Category Details
                            </h3>
                            <button onClick={() => set_is_open(false)} className="text-gray-400 hover:text-white transition-colors bg-gray-800 hover:bg-gray-700 p-1 rounded-md">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="p-4 overflow-y-auto space-y-4 bg-gray-800/50">
                            {Object.keys(category_data).map(cat => {
                                const count = cookie_category_count[cat]; 
                                const color = category_colour[cat] || '#ccc';
                                const explanation = is_tech_info
                                    ? category_explanation[cat]?.technical
                                    : category_explanation[cat]?.simple

                                return (
                                    <div key={cat} className="p-4 rounded-lg bg-gray-900/50 border border-gray-700 hover:border-gray-600 transition-colors">
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="flex items-center gap-2">
                                                <span 
                                                    className="w-3 h-3 rounded-full shadow-[0_0_8px_rgba(0,0,0,0.5)]" 
                                                    style={{ backgroundColor: color, boxShadow: `0 0 10px ${color}40` }}
                                                ></span>
                                                <span className="font-bold text-gray-100 text-base">{cat}</span>
                                            </div>
                                            <span className="bg-gray-800 text-gray-300 text-xs font-bold px-3 py-1 rounded-full border border-gray-700">
                                                {count} cookies
                                            </span>
                                        </div>
                                        <div 
                                            className="text-sm text-gray-400 leading-relaxed border-l-2 border-gray-700 pl-3" > {explanation}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                        
                        <div className="p-3 border-t border-gray-700 bg-gray-900 text-center">
                            <button onClick={() => set_is_open(false)} className="w-full bg-sky-600 hover:bg-sky-500 text-white font-medium text-base py-2 rounded-lg transition-colors">
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Category_panel;