import { BadgeInfo } from 'lucide-react';



// The InfoBar component displays the privacy score and streak information
const info_bar = ({ privacy_score, privacy_rank, score_colour }) => (
    // Container for the InfoBar with styling adapting depending on screen size
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 p-4 bg-gray-800 rounded-lg">
        <div className="flex items-center gap-2">
            <div>
                <span className="text-s text-gray-300 block">Privacy Score </span>
                <span className={`text-2xl font-semibold ${score_colour}`}>{privacy_score}/100 ~ {privacy_rank}</span>
            </div>
            <div className="infotip">
                     {/* When hovering over the info icon, a tip appears explaining how the privacy score is calculated */}
                <BadgeInfo size={20} className="w-5 h-5 text-gray-300 cursor-help" />
                <span className="infotiptext">
                    <strong>How is the privacy score calculated?(functionality will be added when backend logic is complete)</strong>
                    {/* TODO: Add points calculation logic */}
                    <ul className="list-disc list-inside mt-1 text-xs">
                        <li> -x points per Tracking cookie</li>
                        <li> -x points per Analytics cookie</li>
                        <li> -x points for missing 'Secure'</li>
                        <li> -x points for missing 'HttpOnly'</li>
                    </ul>
                </span>
            </div>
        </div>
        <div>
            <span className="text-s text-gray-300 block">Privacy Streak</span>
            <span className="text-2xl font-semibold text-green-400">3 Days</span>
        </div>
    </div>
);

export default info_bar;