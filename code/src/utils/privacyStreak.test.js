import { calculate_privacy_streak } from "./privacyStreak";


const mockGet = jest.fn();
const mockSet = jest.fn();


global.chrome = {
    storage: {
        local: {
            get: mockGet,
            set: mockSet
        }
    }
};

describe('Unit Test: Privacy Streak Logic', () => {
    
    const TODAY_TIMESTAMP = 10000 * 24 * 60 * 60 * 1000; 
    const YESTERDAY_DAYS = 9999;
    const TWO_DAYS_AGO_DAYS = 9998;

    let callback;

    beforeEach(() => {
        jest.clearAllMocks(); 
        
        callback = jest.fn(); 
        

        jest.spyOn(Date, 'now').mockReturnValue(TODAY_TIMESTAMP);
    });

    afterEach(() => {
        jest.restoreAllMocks(); 
    });

    // UT-08: Increment Streak
    test('UT-08: Increments streak if last visit was yesterday', () => {

        mockGet.mockImplementation((keys, cb) => {
            cb({ 
                streak_data: { 
                    count: 5, 
                    last_visit: YESTERDAY_DAYS 
                } 
            });
        });

        calculate_privacy_streak(callback);

        expect(mockSet).toHaveBeenCalledWith({
            streak_data: { 
                count: 6, 
                last_visit: 10000 
            }
        }, expect.any(Function));
    });

    // UT-09: Reset Streak
    test('UT-09: Resets streak to 1 if last visit was 2 days ago', () => {
        mockGet.mockImplementation((keys, cb) => {
            cb({ 
                streak_data: { 
                    count: 10, 
                    last_visit: TWO_DAYS_AGO_DAYS 
                } 
            });
        });

        calculate_privacy_streak(callback);

        expect(mockSet).toHaveBeenCalledWith({
            streak_data: { 
                count: 1, 
                last_visit: 10000 
            }
        }, expect.any(Function));
    });

    // Streak remains the same 
    test('UT-10: Streak remains the same if the last visit was today', () => {
        mockGet.mockImplementation((keys, cb) => {
            cb({ 
                streak_data: { 
                    count: 10, 
                    last_visit: 10000
                } 
            });
        });

        calculate_privacy_streak(callback);

        expect(mockSet).not.toHaveBeenCalledWith();

        expect(callback).toHaveBeenCalledWith(10);
    });
});