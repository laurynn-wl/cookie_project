import { get_random_tip } from "./privacyTip";


describe ("Unit Test: Privacy Tip Logic", () => {

    test('UT-13: Returns different tips on different calls' , () =>
        {
            const seen_privacy_tips = new Set();

            for (let i = 0; i < 20; i++){
                const tip = get_random_tip();
                seen_privacy_tips.add(tip.text)
            }

            expect(seen_privacy_tips.size).toBeGreaterThan(1);
        });
}); 
