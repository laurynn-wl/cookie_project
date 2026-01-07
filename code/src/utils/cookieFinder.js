import openCookieDB from '../data/open-cookie-database.json'

let cookie_db = null; 

// Initialise the cookie database from the JSON file
const initialise_database = () => {
    if (cookie_db) {
        return;
    }
    console.log("Initialising cookie database...");

    // Structure: { exact: {cookie_name: category}, wildcards: [{pattern: string, category: string}] }
    cookie_db = {
        exact: {},
        wildcards: []
    }; 

    // Validate the loaded database
    if (!openCookieDB || typeof openCookieDB !== 'object') {
        console.error("Cookie Database failed to load.", openCookieDB);
        return;
    }

    try {
        Object.values(openCookieDB).forEach(db_cookies => {
            if (Array.isArray(db_cookies)) {
                // Process each cookie entry
                db_cookies.forEach(entry => {
                    // Extract relevant fields
                    const cookie_name = entry.cookie;
                    const db_category = entry.category; 
                    const is_wildcard = entry.wildcardMatch === "1";

                    // Map database categories to our categories
                    if (cookie_name && db_category) {
                        let mapped_category = "Unknown";
                
                        switch (db_category) {
                            case "Security":
                            case "Functional":
                                mapped_category = "Essential"; 
                                break;
                            
                            case "Personalization":
                                mapped_category = "Preference";
                                break;

                            case "Analytics":
                                mapped_category = "Analytics";
                                break;

                            case "Marketing":
                                mapped_category = "Tracking";
                                break;

                            default:
                                mapped_category = "Unknown";
                        }

                        // Store in the database structure
                        if (mapped_category !== "Unknown") {
                            if (is_wildcard) {
                                cookie_db.wildcards.push({
                                    pattern: cookie_name.toLowerCase(),
                                    category: mapped_category
                                });
                            }
                            else {
                                cookie_db.exact[cookie_name.toLowerCase()] = mapped_category;
                            }
                        }
                    }
                });
            }
        });
        // Sort wildcards by pattern length (longest first) for accurate matching
        cookie_db.wildcards.sort((a, b) => b.pattern.length - a.pattern.length);

        console.log(`Database initialised with ${Object.keys(cookie_db).length} cookies.`);
        
    } catch (err) {
        console.error("Critical error building cookie cache:", err);
        cookie_db = { exact: {}, wildcards: [] };
    }
};

/*
Lookup a cookie name in the database and return its category if found
Returns null if not found
 */
export const cookie_finder_in_db = (cookie_name) => {
    if (!cookie_db) {
        initialise_database();
    }

    if (!cookie_db || !cookie_name) return null;

    if (cookie_db.exact[cookie_name.toLowerCase()]) {
        return cookie_db.exact[cookie_name.toLowerCase()];
    }

    const wildcards_matching = cookie_db.wildcards.find(entry => cookie_name.toLowerCase().startsWith(entry.pattern));
    if (wildcards_matching) {
        return wildcards_matching.category;
    }
    
    return null;    
};