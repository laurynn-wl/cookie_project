/* global chrome */

export const calculate_privacy_streak = (callback) => {
    const today = new Date().toDateString;

    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local){
        chrome.storage.local.get(['streak_data'], (result) =>{
            let streak = result.streak_data || {count: 0, last_visit: null};

            // Streak remain the same if the user has already visited this page today
            if (streak.last_visit === today){
                callback(streak.count);
                return;
            }

            // Calculates yesterday 
            const yesterday_date = new Date();
            yesterday_date.setDate(yesterday_date.getDate() - 1);
            const yesterday = yesterday_date.toDateString();

            // Imcrements the streak 
            if (streak.last_visit === yesterday){
                streak.count +=1;

            }
            // Resets the streak 
            else{
                streak.count = 1;
            }

            // Save the current steak to Chrome storage 
            streak.last_visit = today;
            chrome.storage.local.set({streak_data: streak});

            callback(streak.count);  
    })
    }
}