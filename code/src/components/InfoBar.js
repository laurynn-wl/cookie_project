import { BadgeInfo, Flame, Trophy} from 'lucide-react';



// The InfoBar component displays the privacy score and streak information
const info_bar = ({ privacy_score, privacy_rank, score_colour, streak, on_open_trophies}) => (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 p-4 bg-gray-800 rounded-lg">
        <div className="flex items-center gap-2">
            <div>
                <span className="text-sm  font-semibold text-gray-300 block">Privacy Score </span>
                <span className={`text-2xl font-semibold ${score_colour}`}>{privacy_score}/100 ~ {privacy_rank}</span>
            </div>
            <div className="infotip">
                     {/* When hovering over the info icon, a tip appears explaining how the privacy score is calculated */}
                <BadgeInfo size={20} className="w-5 h-5 text-gray-300 cursor-help" />
                <span className="infotiptext w-96 p-4"> 
    
    <strong className='block text-center text-sm mb-3 text-white border-b border-gray-600 pb-2'>
        How is the privacy score calculated?
    </strong>

    <table className="w-full text-xs text-left border-collapse">
        <thead>
            <tr className="text-gray-400">
                <th className="pb-2 font-semibold">Criteria</th>
                <th className="pb-2 text-right font-semibold">Impact</th>
            </tr>
        </thead>
        <tbody className="divide-y divide-gray-700">
            <tr>
                <td className="py-2 pr-2 text-gray-300">Tracking Cookie</td>
                <td className="py-2 text-right text-red-400">-10 pts <span className="text-gray-500">(Max 50)</span></td>
            </tr>
            <tr>
                <td className="py-2 pr-2 text-gray-300">High Risk Cookie</td>
                <td className="py-2 text-right text-red-400">-5 pts <span className="text-gray-500">(Max 30)</span></td>
            </tr>
            <tr>
                <td className="py-2 pr-2 text-gray-300">Cookie Quantity</td>
                <td className="py-2 text-right text-yellow-400">-1 per 5 <span className="text-gray-500">(Max 20)</span></td>
            </tr>
            <tr>
                <td className="py-2 pr-2 text-gray-300">Missing 'Secure'</td>
                <td className="py-2 text-right text-orange-400">Cap at 45</td>
            </tr>
            <tr>
                <td className="py-2 pr-2 text-gray-300">Missing 'HttpOnly'</td>
                <td className="py-2 text-right text-orange-400">Cap at 60</td>
            </tr>
        </tbody>
    </table>
</span>
            </div>
        </div>
        {/* Privacy Streak */}
        <div>
            <span className="text-sm font-semibold text-gray-300 block">Privacy Streak</span>
            <div className = "flex items-center gap-2">
            <span className="text-2xl font-semibold text-green-400">
                {streak} {streak === 1 ? 'Day' : 'Days'}
            </span>
            <Flame 
                size={24} 
                className={`${streak > 0 ? 'text-orange-500 fill-orange-500 animate-pulse' : 'text-gray-500'}`} 
            />
            <button 
                onClick={on_open_trophies}
                className="bg-yellow-600/20 hover:bg-yellow-600/30 border border-yellow-600/50 p-1 rounded-lg group transition-all"
                title="View Achievements"
            >
                <Trophy size={24} className="text-yellow-500 group-hover:scale-110 transition-transform" />
            </button>
            </div>

        </div>
    </div>
);

export default info_bar;