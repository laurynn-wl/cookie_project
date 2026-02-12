import {categorise_cookie, calculate_site_privacy_score  } from './cookieUtils'


describe('Unit Test: Cookie Classification Logic', () =>
{
    // UT-01: Heursitic Override
    test('UT-01: Identifies Cloudflare Security Cookies (__cf_bm) as Essential', () =>
    {
        const result = categorise_cookie('__cf_bm')
        expect(result).toBe('Essential');
    });

    // UT-02: Database Lookup
    test('UT-02: Identifies Google Analytics (_ga) as Analytics', () =>
    {
        const result = categorise_cookie('_ga')
        expect(result).toBe('Analytics');
    });

    // UT-03: Unkown Categorisation
    test('UT-03: Returns "Unknown" for random inputs', () =>
    {
        const result = categorise_cookie('random-entry1')
        expect(result).toBe('Unknown');
    });
});

describe('Unit Test: Privacy Score Calculation', () =>
{
    // UT-04: Perfect score 
    test('UT-04: Returns 100 for empty cookie array', () =>
    {
        const cookies=[]
        const score = calculate_site_privacy_score(cookies);
        expect(score.privacy_score).toBe(100);
    })

    // UT-05: Makes sure maximum deductions work for categories 
    test('UT-05: Returns a score = 50 for 20 tracking cookies', () =>
    {
        const cookies= new Array(20).fill({category: 'Tracking'})
        const score = calculate_site_privacy_score(cookies);

        expect(score.privacy_score).toBeLessThanOrEqual(50);
    })

    // UT-06: Ensures Score is never < 0
    test('UT-06: Score is never negative', () =>
    {
        const cookies= [
            new Array(10).fill({category: 'Tracking'}),
            new Array(100).fill({caregory: 'Unknown'}),
            new Array(20).fill({category: 'Essential', secure: false, httpOnly: false})
        ]
        const score = calculate_site_privacy_score(cookies);

        expect(score.privacy_score).toBeGreaterThan(0);
    })

    // UT-07: Handles no input  
    test('UT-07: Returns score as 100 for no input', () =>
    {
        const score = calculate_site_privacy_score(null);
        expect(score.privacy_score).toBe(100);
    })


})