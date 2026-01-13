import { X } from 'lucide-react';
import { get_detailed_analysis } from '../utils/cookieUtils'; 


const CookieModal = ({ cookie, isOpen, onClose, is_tech_info }) => {
    if (!isOpen || !cookie) return null;

    // Run detailed analysis
    const analysed_cookies = get_detailed_analysis(cookie, is_tech_info);

    return (
        // OVERLAY
        <div 
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
            onClick={onClose}
        >
            
            {/* MODAL BOX */}
            <div 
                className="bg-gray-800 border border-gray-700 rounded-lg shadow-xl w-full max-w-2xl p-6 relative animate-in fade-in zoom-in duration-200 max-h-[90vh] overflow-y-auto"
                onClick={e => e.stopPropagation()} 
            >
                
                {/* Header */}
                <div className="flex justify-between items-center mb-6 border-b border-gray-700 pb-4">
                    <div>
                        <h3 className="text-xl font-bold text-white">Cookie Details</h3>
                    </div>
                    <button 
                        className="text-gray-400 hover:text-white transition-colors" 
                        onClick={onClose}
                    >
                        <X size={24} />
                    </button>
                </div>
                
                {/* 1. Basic Cookie Details*/}
                <div className="grid grid-cols-2 gap-y-4 gap-x-8 mb-8 bg-gray-900/50 p-5 rounded-lg border border-gray-700/50">
                    <div>
                        <span className="text-sm uppercase tracking-wider text-gray-500 font-bold block mb-1">Name</span>
                        <p className="text-gray-200 font-mono text-sm">{cookie.name}</p>
                    </div>

                    <div>
                        <span className="text-sm uppercase tracking-wider text-gray-500 font-bold block mb-1">Domain</span>
                        <p className="text-gray-200 font-mono text-sm break-all">{cookie.domain}</p>
                    </div>

                    <div>
                        <span className="text-sm uppercase tracking-wider text-gray-500 font-bold block mb-1">Category</span>
                        <p className="text-gray-200 text-sm">{cookie.category}</p>
                    </div>

                    <div>
                        <span className="text-sm uppercase tracking-wider text-gray-500 font-bold block mb-1">Expires</span>
                        <p className="text-gray-200 text-sm">{cookie.expiration}</p> 
                    </div>
                </div>

                {/* 2. Security Analysis */}
                <div>
                    <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                        Security Analysis
                    </h4>
                    
                    <div className="space-y-3">
                        {analysed_cookies.map((item, index) => (
                            <div key={index} className="bg-gray-900 border border-gray-700 p-4 rounded-md">
                                <h5 className={`font-bold text-sm mb-1 ${item.color}`}>
                                    {item.title}
                                </h5>
                                <p className="text-gray-200 text-sm leading-relaxed">
                                    {item.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CookieModal;