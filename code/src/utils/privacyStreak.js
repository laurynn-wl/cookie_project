/* global chrome */

// Function to calculate and update the user's privacy streak
export const calculate_privacy_streak = (callback) => {

    // Get today's date as a simple integer (days since epoch)
    const today = Math.floor(Date.now() / (1000 * 60 * 60 * 24));

    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local){
        // Retrieve the current streak data from Chrome storage
        chrome.storage.local.get(['streak_data'], (result) =>{
            let streak = result.streak_data || {count: 0, last_visit: null};

            // Streak remains the same if the user has already visited this page today
            if (streak.last_visit === today){
                callback(streak.count);
                return;
            }

            // Update the streak count based on the last visit
            if (today - streak.last_visit === 1){
                streak.count += 1;
            }
            // Reset the streak if the last visit was not yesterday
            else{
                streak.count = 1;
            }

            // Save the current steak to Chrome storage 
            streak.last_visit = today;
            chrome.storage.local.set({streak_data: streak}, () => {
                callback(streak.count);
            }); 
        });
    }
}