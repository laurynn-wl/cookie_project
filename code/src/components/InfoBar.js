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
                <span className="infotiptext">
                    <strong className='block text-center'>How is the privacy score calculated?</strong>
                    
                    <ul className="list-disc list-inside mt-1 text-sm">
                        <li> -10 points per Tracking cookie ~ capped at 50</li>
                        <li> -5 points per high risk cookie ~ capped at 30</li>
                        <li> -1 point per every 5 cookies ~ capped at 20</li>
                        <li> The score is capped at 45 if essential cookies are missing the Secure attribute</li>
                        <li> The score is capped at 60 if essential cookies are missing the HttpOnly attribute </li>
                    </ul>
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