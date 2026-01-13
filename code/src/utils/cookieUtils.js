/*global chrome*/
import { category_data } from '../data/mockData';
import { cookie_finder_in_db } from './cookieFinder';
import { security_explanation } from '../data/DashboardExplanations';   


const year_in_seconds = 31536000;

/*
HELPER FUNCTION: Cookie Categorisation 
*/
export const categorise_cookie = (name) => {
    const lowerName = name ? name.toLowerCase() : '';

    // 1. Check in the cookie database 
    const db_category = cookie_finder_in_db(lowerName);
    if (db_category) {
        return db_category;
    }

    // 2. Pattern based categorisation
    // ESSENTIAL Cookies Patterns
    if (
        lowerName.startsWith('st-') ||
        /^(jsessionid|phpsessid|aspsessionid)/.test(lowerName) ||
        lowerName.startsWith('aws') ||
        lowerName.includes('csrf') ||
        lowerName.includes('xsrf')
    )  { 
        return "Essential";
    }

    // PREFERENCE Cookies Patterns
    if(
        lowerName === 'lang' ||
        lowerName === 'language' ||
        lowerName.startsWith('wp-settings-') 
    ) {
        return "Preference";
    }

    // ANALYTICS Cookies Patterns
    if (
        lowerName.startsWith('_pk_') ||
        /^(_ga|_gid|_gat)/.test(lowerName)
    ) {
        return "Analytics";
    }

    // TRACKING Cookies Patterns
    if(
        lowerName === 'ide' ||
        lowerName.startsWith('_fbp') ||
        lowerName.startsWith('_uet')
    ) {
        return "Tracking";
    }


    // 3. Keyword based categorisation as fallback

    // ESSENTIAL Keywords
    if (
        lowerName.includes('sess') || 
        lowerName.includes('auth') || 
        lowerName.includes('id') || 
        lowerName.includes('cart')){
            return "Essential";
        }

    // PREFERENCE Keywords
    if (
        lowerName.includes('pref') || 
        lowerName.includes('darkmode') || 
        lowerName.includes('theme')) {
            return "Preference";
    }

    // ANALYTICS Keywords
    if (
        lowerName.includes('metric') || 
        lowerName.includes('analytics') || 
        lowerName.includes('stats')) {
            return "Analytics";
        }

    //  TRACKING Keywords
    if (
        lowerName.includes('pixel') || 
        lowerName.includes('tracker') || 
        lowerName.includes('ads') ||
        lowerName.includes('banner')) {
            return "Tracking";
        }
    
    return "Unknown";
};

/*
HELPER FUNCTION: Cookie risk generation based on attributes
*/
export const generate_cookie_risk = (details) => {
    const { is_secure, is_httpOnly, is_hostOnly, sameSite, is_session, expiration_ts } = details;
    

     // Risk attribute scoring
    let risk_score = 0;
    if (!is_secure) risk_score += 3;
    if (!is_httpOnly) risk_score += 3;
    if (!is_hostOnly) risk_score += 1;
    if (sameSite === 'no_restriction') risk_score += 2;

    // Check if cookie lasts longer than 365 days
    if (!is_session && expiration_ts) {
        const seconds_to_live = expiration_ts - (Date.now() / 1000);
        if (seconds_to_live > year_in_seconds) { 
            risk_score += 1;
        }
    }

    // Determine risk label based on score 
    let label = 'Low Risk';
    if (risk_score >= 7) {
        label = 'High Risk';
    } else if (risk_score >= 3) {
        label = 'Moderate Risk';
    }

    return { risk_score, label };
};

/*
MAIN FUNCTION: Maps raw Chrome cookie data to structured cookie objects
*/
export const map_chrome_cookies = (raw_cookies) => {
    if (!raw_cookies || !Array.isArray(raw_cookies)) return [];

    return raw_cookies.map((c, index) => {
        
        // 1. Clean Data & Boolean Logic
        const domain = c.domain || '';
        const name = c.name ? c.name.toLowerCase() : 'unknown';
        
        // Ensure booleans are real booleans (fixes "false" string bug)
        const is_secure = String(c.secure).toLowerCase() === 'true' || c.secure === true;
        const is_httpOnly = String(c.httpOnly).toLowerCase() === 'true' || c.httpOnly === true;
        const is_hostOnly = c.hostOnly === true || (c.domain && !c.domain.startsWith('.'));
        const is_session = String(c.session).toLowerCase() === 'true' || c.session === true;
        const expiration_ts = c.expiration || c.expirationDate;

        // 2. Calculate Risk
        const { risk_score, label } = generate_cookie_risk({
            is_secure,
            is_httpOnly,
            is_hostOnly,
            sameSite: c.sameSite,
            is_session,
            expiration_ts
        });

        // 3. Determine Category
        const category = categorise_cookie(name);
      
        // 4. Return Final Object
        return {
            id: (c.name && c.domain) ? (c.name + c.domain) : `cookie-${index}`,
            name: name,
            domain: domain,
            value: c.value || '',
            category: category,
            
            // Risk Data (Used for insights badge)
            risk_label: label, 
            risk_score: risk_score,
            
            // Raw Flags (Used for modal analysis)
            secure: is_secure,
            httpOnly: is_httpOnly,
            hostOnly: is_hostOnly,
            sameSite: c.sameSite || 'unspecified',
            expiration: is_session ? 'Session' : new Date(expiration_ts * 1000).toLocaleDateString(),
            expiration_time: is_session ? null : expiration_ts
        };
    });
};



/*
HELPER FUNCTION: Returns risk insight badge JSX
*/ 
export const get_insights = (label) => {
    
    let style = "bg-green-600 text-green-100 border-green-500 text-xs"; 
    
    if (!label) return null;

    if (label === 'High Risk') {
        style = "bg-red-600 text-red-100 border-red-500 text-xs";
    } else if (label === 'Moderate Risk') {
        style = "bg-yellow-600 text-yellow-100 border-yellow-500 text-xs";
    }

    return (
        <span className={`uppercase font-semibold inline-block px-2 py-1 rounded border tracking-wider ${style}`}>
            {label}
        </span>


    );
};

/*
HELPER FUNCTION: Provides detailed security analysis for a cookie
*/
export const get_detailed_analysis = (cookie, is_tech_info = false) => {
    const analysis = [];
    const view = is_tech_info ? 'technical' : 'simple'
    

    // 1. Check HttpOnly
    if (!cookie.httpOnly) {
        analysis.push({
            title: "Missing HttpOnly Flag",
            description: security_explanation.httpOnly.description[view],
            color: "text-red-400"
        });
    }

    // 2. Check Secure
    if (!cookie.secure) {
        analysis.push({
            title: "Missing Secure Flag",
            description: security_explanation.secure.description[view],
            color: "text-red-400"
        });
    }

    // 3. Check HostOnly 
    if (!cookie.hostOnly) {
        analysis.push({
            title: "Wide Domain Scope (Not HostOnly)",
            description: security_explanation.hostOnly.description[view],
            color: "text-yellow-400"
        });
    }

    // 4. Check SameSite
    if (cookie.sameSite === 'no_restriction') {
        analysis.push({
            title: "SameSite: No restriction",
            description: security_explanation.sameSite.description[view],
            color: "text-orange-400"
        });
    }

    // 5. Check Expiration
    if (cookie.expiration !== 'Session' && cookie.expiration_time) {
         const seconds_till_expiration = cookie.expiration_time - (Date.now() / 1000);
         if (seconds_till_expiration > year_in_seconds) {
             analysis.push({
                 title: "Long Expiration Date",
                 description: security_explanation.expiration.description[view],
                 color: "text-blue-400"
             });
         }
    }

    if (analysis.length === 0) {
        analysis.push({
            title: "Low Risk Cookie",
            description: security_explanation.safe.description[view],
            color: "text-green-400"
        });
    }

    return analysis;
};

/*
HELPER FUNCTION: Prepares data for category pie chart
*/
export const prepareChartData = (cookies) => {
    if (!cookies || !Array.isArray(cookies)) return [];
    if (!category_data) return [];

    const count = cookies.reduce((acc, cookie) => {
        const cat = cookie.category || "Unknown";
        acc[cat] = (acc[cat] || 0) + 1;
        return acc;
    }, {});

    return Object.keys(category_data).map(category => ({
        name: category,
        value: count[category] || 0,
        color: category_data[category].color
    })).filter(item => item.value > 0); 
};

// Badge styles for privacy score display
const badge_style = 'text-sm font-medium px-3 py-1 rounded-full self-start transition-colors duration-200';
const badge_layout = 'mt-2 sm:mt-0'; 

export const calculate_site_privacy_score = (cookies) => { 
    let privacy_score = 100;
    let capped_score = 100;

    if (!cookies || cookies.length === 0) {
        return {
            privacy_score: 100,
            privacy_rank: 'Excellent',
            score_colour: 'text-green-400',
            vulnerability_badge_class: `${badge_style} ${badge_layout} bg-green-600 text-green-100`,
            vulnerability_badge_text: 'Site Rank: Excellent',
        };
    }
   
    // 1. Tracking Cookies Penalty
    const tracking_cookies = cookies.filter(c => c.category === 'Tracking').length;
    const tracking_penalty = Math.min(tracking_cookies * 10, 50); // Max 50 points

    // 2. Security Risk Penalty
    let security_penalty_sum = 0;
    cookies.forEach(c => {
        if (!c.secure || !c.httpOnly){
            if (c.category === 'Tracking') {
                // Reduces score for tracking cookies to prevent double counting
                security_penalty_sum += 2;
            } else {
                security_penalty_sum += 5;
            }
        }
    });

    const security_penalty = Math.min(security_penalty_sum, 30); // Max 30 points

    // 3. Cookie Amount Penalty
    const cookie_sum_penalty = Math.min(Math.floor(cookies.length / 5), 20); // Max 20 points


    // 4. Final Score Calculation    let privacy_score = 100 - tracking_penalty - security_penalty - cookie_sum_penalty;
    privacy_score = 100 - tracking_penalty - security_penalty - cookie_sum_penalty;
    privacy_score = Math.max(privacy_score, 0); // Ensure non-negative  

    // 5. Essential Security cap 

    cookies.forEach(c => {
        if (c.category === 'Essential'){
            if (!c.secure){
                capped_score = Math.min(capped_score, 45);
            }
            if (!c.httpOnly){
                capped_score = Math.min(capped_score, 60);
            }
        }
    });

    privacy_score = Math.min(privacy_score, capped_score);

    // Site Rank Determination
    let grade = 'A';
    let rank = 'Excellent';
    let text_color = 'text-green-400';
    let badge_class = `${badge_style} ${badge_layout} bg-green-600 text-green-100`;

    if (privacy_score >=90) {
        grade = 'A';
        rank = 'Excellent';
        text_color = 'text-green-400';
        badge_class = `${badge_style} ${badge_layout} bg-green-600 text-green-100`;
    } else if (privacy_score >=75) {
        grade = 'B';
        rank = 'Good';
        text_color = 'text-lime-400';
        badge_class = `${badge_style} ${badge_layout} bg-lime-600 text-lime-100`;
    } else if (privacy_score >=50) {
        grade = 'C';
        rank = 'Medium';
        text_color = 'text-yellow-400';
        badge_class = `${badge_style} ${badge_layout} bg-yellow-600 text-yellow-100`;
    } else if (privacy_score >=30) {
        grade = 'D';
        rank = 'Poor';
        text_color = 'text-orange-400';
        badge_class = `${badge_style} ${badge_layout} bg-orange-600 text-orange-100`;
    } else {
        grade = 'F';
        rank = 'Very Poor';
        text_color = 'text-red-400';
        badge_class = `${badge_style} ${badge_layout} bg-red-600 text-red-100`;
    }

    return {
        privacy_score,
        privacy_rank: rank,
        score_colour: text_color,
        vulnerability_badge_class: badge_class,
        vulnerability_badge_text: `Site Rank: ${grade} - ${rank}`
    };


};