// frontend/src/components/CategoryPanel.js
import React, { useMemo, useState } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer} from 'recharts';
import { prepareChartData } from '../utils/cookieUtils';
import { category_data, category_colour} from '../data/mockData';
import privacy_tip_data from '../data/privacyTipData';
import { BadgeInfo } from 'lucide-react';

// TODO: When selecting the toggle tick active cookies for that category 

// Information component for each cookie category on hover
const CategoryHover = ({ active, payload }) => {
    // Show explanation only when active and payload exists
    if (active && payload && payload.length) {
        const data = payload[0].payload; 
        return (
            <div className="bg-gray-800 border border-gray-500 p-3 rounded-lg shadow-lg max-w-s">
                {/*Category Name and Count*/} 
                <p className=" text-base font-bold text-white mb-1">{data.name}: {data.value} Cookies</p>
                <p 
                // Displays explanation text
                    className="text-xs text-gray-300" 
                    dangerouslySetInnerHTML={{ __html: data.explanation }} 
                />
            </div>
        );
    }
    return null;
};

const Category_panel = ({ cookies }) => {
    
    // Caches the data to avoid recalculating on every time the cookies change
    const piechart_cookie_data = useMemo(() => prepareChartData(cookies), [cookies]);

    const [current_tip] = useState(() => {
        const tip_index = Math.floor(Math.random() * privacy_tip_data.length);
        return privacy_tip_data[tip_index];
    });

    // 
    const legend_items = useMemo(() => {
        return Object.keys(category_data).map(category => {
            // Essential cookies cannot be toggled off
            // const is_essential = category === 'Essential';
            // // Determine if the category is on or off
            // let is_toggled;
            // if (active_categories){
            //     is_toggled = active_categories.includes(category);
            // }
            // else {
            //     is_toggled = true;
            // }
            return (
                // Spreads each category row with toggle
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
                                className="infotiptext" 
                                dangerouslySetInnerHTML={{ __html: category_data[category].explanation }} 
                            />
                        </div>
                    </div>
                </div>
            );
        });
    }, []);

    return (
        <div className="lg:col-span-1 bg-gray-800 p-6 rounded-lg border border-gray-700">
            <div className ="flex items-center gap-2 mb-4">
                <h2 className="text-2xl font-bold text-white">Cookie Categories</h2>
                <div className="infotip flex items-center">
                     {/* When hovering over the info icon, a tip appears explaining how the privacy score is calculated */}
                <BadgeInfo size={20} className="w-5 h-5 text-gray-300 cursor-help" />
                <span className="infotiptext">
                    <strong>Cookie Category Explanation</strong>
                </span>
            </div>
            </div>
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
                        
                        {/* Displays text info for piecgart */}
                        <Tooltip content={<CategoryHover/>} />
                        
                    </PieChart>
                </ResponsiveContainer>
            </div>

            <div className="space-y-5">
                {legend_items}
            </div>
            
            {/*TODO: Change this so the privacy tips changes everytime this page is loaded up again */}
            <div className="mt-8 pt-6 border-t border-gray-700">
                <h3 className="text-xl font-semibold text-white mb-2">Privacy Tip</h3>
                <p className="text-sm text-gray-200">
                    {current_tip.text}
                </p>
            </div>
        </div>
    );
};

export default Category_panel;