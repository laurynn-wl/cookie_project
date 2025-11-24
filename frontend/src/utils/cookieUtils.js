import { category_data } from '../data/mockData';

// Adds the amount of cookies in each category 
export const prepareChartData = (cookies) => {
    const count = cookies.reduce((acc, cookie) => {
        acc[cookie.category] = (acc[cookie.category] || 0) + 1;
        return acc;
    }, {});

    // Converts the count into a format Recharts can use 
    return Object.keys(category_data).map(category => ({
        name: category,
        value: count[category] || 0,
        color: category_data[category].color
        // Filters out categories with no cookies 
    })).filter(item => item.value > 0); 
};



// TODO: Edit description to fit research 
export const get_vulnerability_description= (vulnerability) => {
    switch (vulnerability.toLowerCase()) {
        case '3rd-party': return "<strong>3rd-Party:</strong> This cookie is set by a domain other than the one you are visiting, often for tracking or advertising.";
        case 'tracking': return "<strong>Tracking:</strong> This cookie is used to follow your activity across different websites to build a profile of your interests.";
        case 'missing secure': return "<strong>Missing 'Secure' Flag:</strong> This cookie can be sent over an unencrypted (HTTP) connection, making it easier for attackers to intercept.";
        case 'missing httponly': return "<strong>Missing 'HttpOnly' Flag:</b> This cookie can be accessed by client-side scripts (JavaScript), increasing the risk of XSS attacks.";
        default: return vulnerability;
    }
};

// If the cookie has no vulnerabilities return secure 
export const get_insights = (vulnerabilities) => {
    if (vulnerabilities.length === 0) {
        return <span className="text-xs font-medium text-green-400">Secure</span>;
    }
    // Converts each vulnerability into an insight badge 
    return vulnerabilities.map((vulnerability, index) => {
        let colour_bage_style = 'bg-yellow-600 text-yellow-100';
        if (vulnerability.toLowerCase().includes('tracking') || vulnerability.toLowerCase().includes('3rd-party')) {
            colour_bage_style = 'bg-red-600 text-red-100';
        }
        return (
            <span key={index} className={`inline-block rounded-full px-2 py-0.5 text-xs font-semibold ${colour_bage_style}`}>
                {vulnerability}
            </span>
        );
    });
};

// Tailwindcss for insight badges
const badge_style = 
    'text-sm font-medium px-3 py-1 rounded-full self-start transition-colors duration-200';
const badge_layout = 
    'mt-2 sm:mt-0'; 


// TODO: Remove this when logic is implemented 
export const cookie_score_data = {
    privacy_score: 12, 
    privacy_rank: 'Medium',
    score_colour: 'text-yellow-400', 
    // 
    vulnerability_badge_class: `${badge_style} ${badge_layout} bg-yellow-600 text-yellow-100`,
    vulnerability_badge_text: 'Site Risk: Medium'
};
