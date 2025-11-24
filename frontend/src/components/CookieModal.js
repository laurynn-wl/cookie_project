
import { X } from 'lucide-react';
import { get_vulnerability_description} from '../utils/cookieUtils';

const CookieModal = ({ cookie, is_open, is_closed }) => {
    
    if (!cookie) return null;
    let overlay_classes = 'description_overlay';
    if (is_open) {
        overlay_classes += ' open';
    }

    return (
        // Overlay with exit button to close 
        <div id="cookie_description_overlay" className={overlay_classes} onClick={is_closed}>
            
            {/* The centre box prevents closing when clicking inside */}
            <div id="cookie_description_box" className="description_box" onClick={e => e.stopPropagation()}>
                
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-semibold text-white" id="description_title">Cookie Details</h3>
                    <button id="exit_button" className="text-gray-400 hover:text-white" onClick={is_closed}>
                        <X size={24} />
                    </button>
                </div>
                
                <div id="description_content" className="space-y-4">
                    <div>
                        <span className="text-sm text-gray-400">Name</span>
                        <p className="text-lg font-medium text-white">{cookie.name}</p>
                    </div>
                    <div>
                        <span className="text-sm text-gray-400">Domain</span>
                        <p className="text-lg font-medium text-white">{cookie.domain}</p>
                    </div>
                    <div>
                        <span className="text-sm text-gray-400">Category</span>
                        <p className="text-lg font-medium text-white">{cookie.category}</p>
                    </div>
                    <div>
                        <span className="text-sm text-gray-400">Expiration</span>
                        <p className="text-gray-300">{cookie.expiration}</p>
                    </div>
                    <div>
                        <span className="text-sm text-gray-400">Vulnerabilities</span>
                        {cookie.vulnerabilities.length === 0 
                            ? <p className="text-green-400">No vulnerabilities detected.</p>
                            : <ul className="list-disc list-inside mt-1 space-y-1">
                                    {cookie.vulnerabilities.map((v, i) => (
                                        <li key={i} className="text-yellow-400" 
                                            dangerouslySetInnerHTML={{ __html: get_vulnerability_description(v) }} 
                                        />
                                    ))}
                              </ul>
                        }
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CookieModal;