import { getCookieUrl } from "./urlUtils";

describe('Unit Test: URL Construction Logic (UT-11/12)', () => {

    // UT-11: Protocol Handling (Security)
    test('UT-11: Constructs HTTPS URL for secure cookies', () => {
        const cookie = { 
            name: 'session_id', 
            domain: 'google.com', 
            path: '/', 
            secure: true 
        };
        
        // Expect HTTPS because secure=true
        expect(getCookieUrl(cookie)).toBe('https://google.com/');
    });

    test('UT-11b: Constructs HTTP URL for non-secure cookies', () => {
        const cookie = { 
            name: 'test_cookie', 
            domain: 'example.com', 
            path: '/', 
            secure: false 
            
        };
        
        // Expect HTTP because secure=false
        expect(getCookieUrl(cookie)).toBe('http://example.com/');
    });

    // UT-12: Dot Prefix Handling (Robustness)
    test('UT-12: Removes leading dot from cookie domains (.youtube.com)', () => {
        const cookie = { 
            name: 'visitor_info', 
            domain: '.youtube.com', 
            path: '/watch', 
            secure: true 
        };
        
        // Expect clean domain without the dot
        expect(getCookieUrl(cookie)).toBe('https://youtube.com/watch');
    });

    // Bonus: Path Handling
    test('UT-12b: Correctly appends complex paths', () => {
        const cookie = { 
            name: 'cart_id', 
            domain: 'amazon.co.uk', 
            path: '/gp/product/123', 
            secure: true 
        };
        
        expect(getCookieUrl(cookie)).toBe('https://amazon.co.uk/gp/product/123');
    });

    // Bonus: Null Safety
    test('UT-12c: Returns empty string for null input', () => {
        expect(getCookieUrl(null)).toBe('');
        expect(getCookieUrl(undefined)).toBe('');
    });

});