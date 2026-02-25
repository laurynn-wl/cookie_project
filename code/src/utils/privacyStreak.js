/* global chrome */

/**
 * Calculates and updates the user's privacy streak based on their visits to the extension's page
 * The streak is incremented if the user visits the page on consecutive days, and reset if they miss a day
 * @param {*} callback - Called with the current streak count after calculation
 */
export const calculate_privacy_streak = (callback) => {

    // Get today's date as an integer (days since epoch)
    const today = Math.floor(Date.now() / (1000 * 60 * 60 * 24));

    // const DEMO_MODE = true; 
    // if (DEMO_MODE) {
    //     const demoStreak = { count: 30, last_visit: today };
    //     chrome.storage.local.set({ streak_data: demoStreak }, () => {
    //         callback(demoStreak.count);
    //     });
    //     return; 
    // }

    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local){
        // Retrieve the current streak data from local Chrome storage
        chrome.storage.local.get(['streak_data'], (result) =>{

            // Initialise streak data if it doesn't exist
            let streak = result.streak_data || {count: 0, last_visit: null};

            // If the user has already visited today, return the current streak count without updating
            if (streak.last_visit === today){
                callback(streak.count);
                return;
            }

            // Update the streak is the last visit was yesterday
            if (today - streak.last_visit === 1){
                streak.count += 1;
            }
            // Otherwise, reset the streak
            else{
                streak.count = 1;
            }

            // Save the current steak data to local Chrome storage 
            streak.last_visit = today;
            chrome.storage.local.set({streak_data: streak}, () => {
                callback(streak.count);
            }); 
        });
    }
}