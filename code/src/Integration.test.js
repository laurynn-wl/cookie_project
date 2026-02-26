import React from 'react';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import App from './App'; 

// fixes size of container
jest.mock('recharts', () => {
    const OriginalModule = jest.requireActual('recharts');
    return {
        ...OriginalModule,
        ResponsiveContainer: ({ children }) => (
            <div style={{ width: "800px", height: "400px" }}>{children}</div>
        ),
    };
});

// detects element size changes 
global.ResizeObserver = class ResizeObserver {
  observe() {} unobserve() {} disconnect() {}
};

// defining chrome api 
const mockStorageGet = jest.fn();
const mockStorageSet = jest.fn();
const mockSendMessage = jest.fn();

global.chrome = {
    storage: {
        local: { get: mockStorageGet, set: mockStorageSet },
        onChanged: { addListener: jest.fn() } 
    },
    runtime: { sendMessage: mockSendMessage },
    action: { setBadgeText: jest.fn() }
};

global.open = jest.fn(); 

describe('Integration Tests: Dashboard Interactions', () => {

    let mockCookies = [];

    beforeEach(() => {
        jest.clearAllMocks();
        mockCookies = [
            { name: '_ga', domain: 'google.com', secure: false, storeId: '0', category: 'Analytics' },
            { name: 'session', domain: 'mysite.com', secure: true, storeId: '0', category: 'Essential' },
            { name: '_fbp', domain: 'facebook.com', secure: false, storeId: '0', category: 'Tracking' }
        ];

        mockStorageGet.mockImplementation((keys, callback) => {
            callback({
                cookies_from_site: mockCookies,
                score_cap_dismissed: false, 
                risk_score: 50,
                streak_data: { count: 1, last_visit: 20000 },
                is_first_visit: false 
            });
        });
    });

    
    test('IT-01: Alert Component renders when Privacy Score is capped', async () => {
        render(<App />);
        expect(await screen.findByText(/Maximum Privacy Score Reached/i)).toBeInTheDocument();
    });

    test('IT-02: Clicking Dismiss (X) removes the alert from the UI', async () => {
        render(<App />);
        const close_btn = await screen.findByRole('button', { name: /Dismiss/i });
        fireEvent.click(close_btn);

        await waitFor(() => {
            expect(screen.queryByText(/Maximum Privacy Score Reached/i)).not.toBeInTheDocument();
        });
    });

    test('IT-03: Clicking "View Logic" opens GitHub in a new tab', async () => {
        render(<App />);
        fireEvent.click(screen.getByRole('button', { name: /Settings/i }));
        const github_link = await screen.findByText(/Cookie Calculation Logic/i);
        fireEvent.click(github_link);
        expect(global.open).toHaveBeenCalledWith(expect.stringContaining('github.com'), '_blank');
    });

    test('IT-04: Toggling a Category Filter updates the dashboard list', async () => {
        // Force a fresh mock state
        let test_cookies = [...mockCookies];
        mockStorageGet.mockImplementation((keys, callback) => {
            callback({ cookies_from_site: test_cookies });
        });

        const { rerender } = render(<App />);
        expect(await screen.findByText('_ga')).toBeInTheDocument();

        
        test_cookies = test_cookies.filter(c => c.category !== 'Analytics');
        
        const analytics_opt = screen.getByRole('checkbox', { name: /Analytics/i });
        fireEvent.click(analytics_opt);

        
        rerender(<App key="re-mount" />); 

        await waitFor(() => {
            expect(screen.queryByText('_ga')).not.toBeInTheDocument();
        });
    });

    test('IT-05: Clicking Delete sends correct message to Background Script', async () => {
        render(<App />);
        const rows = screen.getAllByRole('row');
        const ga_row = rows.find(row => within(row).queryByText('_ga'));
        fireEvent.click(within(ga_row).getByRole('checkbox'));
        fireEvent.click(screen.getByRole('button', { name: /Delete Selected/i }));

        await waitFor(() => {
            expect(mockSendMessage).toHaveBeenCalledWith(
                expect.objectContaining({
                    action: "delete_cookies",
                    cookies: expect.arrayContaining([expect.objectContaining({ name: '_ga' })])
                }),
                expect.any(Function)
            );
        });
    });

   
    test('IT-06: Help Centre Modal appears automatically on fresh install', async () => {
        // 1. Reset the mock to ensure no leftovers from previous tests
        mockStorageGet.mockReset();
        mockStorageGet.mockImplementation((keys, callback) => {
            // Force the first visit state
            callback({ 
                is_first_visit: true, 
                cookies_from_site: [],
                risk_score: 0,
                score_cap_dismissed: false
            }); 
        });

        // 2. Render with a unique key to ensure all UseEffects run fresh
        render(<App key="fresh install" />);

        // 3. Search for the text using a simpler, case-insensitive regex
        // Modals often have a small delay; findBy handles this.
        const helpTitle = await screen.findByText(/Welcome to the Cookie Dashboard!/i, {}, { timeout: 4000 });
        
        expect(helpTitle).toBeInTheDocument();
    });

   
    test('IT-07: Clicking a Cookie Row opens the Security Modal with specific data', async () => {
        render(<App />);
        const rows = await screen.findAllByRole('row');
        const fbp_row = rows.find(row => within(row).queryByText('_fbp'));
        
        fireEvent.click(within(fbp_row).getByText('_fbp'));

        const modal_header = await screen.findByText(/Cookie Details/i);
        expect(modal_header).toBeInTheDocument();

        const security_header = await screen.findByText(/Cookie Details/i);
        expect(security_header).toBeInTheDocument();
    
  

    });
});