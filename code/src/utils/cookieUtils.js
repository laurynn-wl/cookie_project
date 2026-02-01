/*global chrome*/
import { category_data } from '../data/mockData';
import { cookie_finder_in_db } from './cookieFinder';
import { security_explanation } from '../data/DashboardExplanations';   


const year_in_seconds = 31536000;

/*
HELPER FUNCTION: Cookie Categorisation
Determines cookie category based on name patterns and keywords
1. Checks against known cookie database
2. Matches name patterns for common categories
3. Searches for keywords indicative of categories
Returns one of: "Essential", "Preference", "Analytics", "Tracking", "Unknown"
*/
export const categorise_cookie = (name) => {
    const lowerName = name ? name.toLowerCase() : '';


    const db_category = cookie_finder_in_db(lowerName);
    if (db_category) {
        return db_category;
    }

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
HELPER FUNCTION: Cookie risk generation
Calculates risk score and label based on cookie attributes
Attributes considered:
- is_secure
- is_httpOnly
- is_hostOnly
- sameSite
- is_session
- expiration_ts
Returns an object with risk_score and label

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
HELPER FUNCTION: Get Insights
Returns styled badge based on risk label
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
HELPER FUNCTION: Detailed Cookie Analysis
Generates detailed analysis of cookie based on its attributes
Returns an array of analysis objects with title, description, and color 
*/
export const get_detailed_analysis = (cookie, is_tech_info = false) => {
    const analysis = [];
    const view = is_tech_info ? 'technical' : 'simple'

    if (!cookie.httpOnly) {
        analysis.push({
            title: "Missing HttpOnly Flag",
            description: security_explanation.httpOnly.description[view],
            color: "text-red-400"
        });
    }

    if (!cookie.secure) {
        analysis.push({
            title: "Missing Secure Flag",
            description: security_explanation.secure.description[view],
            color: "text-red-400"
        });
    }

    if (!cookie.hostOnly) {
        analysis.push({
            title: "Wide Domain Scope (Not HostOnly)",
            description: security_explanation.hostOnly.description[view],
            color: "text-yellow-400"
        });
    }

    if (cookie.sameSite === 'no_restriction') {
        analysis.push({
            title: "SameSite: No restriction",
            description: security_explanation.sameSite.description[view],
            color: "text-orange-400"
        });
    }

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
HELPER FUNCTION: Prepare Chart Data
Aggregates cookie data for chart visualization
Returns an array of objects with name, value, and color for each category   
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

/*
MAIN FUNCTION: Maps Chrome Cookies 
Transforms raw Chrome cookie data into structured format with risk and category
returns an array of mapped cookie objects
*/
export const map_chrome_cookies = (raw_cookies) => {
    if (!raw_cookies || !Array.isArray(raw_cookies)) return [];

    return raw_cookies.map((c, index) => {
        
        // Clean and extract cookie attributes
        const domain = c.domain || '';
        const name = c.name ? c.name.toLowerCase() : 'unknown';
        
        // Ensure booleans are real booleans
        const is_secure = String(c.secure).toLowerCase() === 'true' || c.secure === true;
        const is_httpOnly = String(c.httpOnly).toLowerCase() === 'true' || c.httpOnly === true;
        const is_hostOnly = c.hostOnly === true || (c.domain && !c.domain.startsWith('.'));
        const is_session = String(c.session).toLowerCase() === 'true' || c.session === true;
        const expiration_ts = c.expiration || c.expirationDate;

        // Calcukate Risk Score and Label
        const { risk_score, label } = generate_cookie_risk({
            is_secure,
            is_httpOnly,
            is_hostOnly,
            sameSite: c.sameSite,
            is_session,
            expiration_ts
        });

        // Determine Cookie Category
        const category = categorise_cookie(name);
      
        // Return Mapped Cookie Object
        return {
            id: (c.name && c.domain) ? (c.name + c.domain) : `cookie-${index}`,
            name: name,
            domain: domain,
            value: c.value || '',
            category: category,

            paritionKey: c.paritionKey,
            path: c.path, 
            storeId: c.storeId,
            
        
            risk_label: label, 
            risk_score: risk_score,
            
            
            secure: is_secure,
            httpOnly: is_httpOnly,
            hostOnly: is_hostOnly,
            sameSite: c.sameSite || 'unspecified',
            expiration: is_session ? 'Session' : new Date(expiration_ts * 1000).toLocaleDateString(),
            expiration_time: is_session ? null : expiration_ts
        };
    });
};

// Badge styles for privacy score display
const badge_style = 'text-sm font-medium px-3 py-1 rounded-full self-start transition-colors duration-200';
const badge_layout = 'mt-2 sm:mt-0'; 

/**
 MAIN FUNCTION: Calculate Site Privacy Score
 Takes an array of cookie objects and computes a privacy score out of 100
 Algorithm:
    1. Start with a perfect score of 100
    2. Deduct points for tracking cookies (max 50 points)
    3. Deduct points for security risks (max 30 points)
    4. Deduct points for excessive cookie count (max 20 points)
    5. Cap score based on essential cookie security attributes
 Returns an object with privacy score, rank, color, and badge details
 */
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
   
    // Tracking Cookie Penalty
    const tracking_cookies = cookies.filter(c => c.category === 'Tracking').length;
    const tracking_penalty = Math.min(tracking_cookies * 10, 50); // Max 50 points

    // Security Attribute Penalty
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

    // Cookie Quantity Penalty
    const cookie_sum_penalty = Math.min(Math.floor(cookies.length / 5), 20); // Max 20 points


    // Final Score Calculation    let privacy_score = 100 - tracking_penalty - security_penalty - cookie_sum_penalty;
    privacy_score = 100 - tracking_penalty - security_penalty - cookie_sum_penalty;
    privacy_score = Math.max(privacy_score, 0); // Ensure non-negative  

    // Essential Security cap 
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