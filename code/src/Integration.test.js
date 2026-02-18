import React from 'react';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import App from './App'; 

// --- 1. MOCK RECHARTS ---
jest.mock('recharts', () => {
    const OriginalModule = jest.requireActual('recharts');
    return {
        ...OriginalModule,
        ResponsiveContainer: ({ children }) => (
            <div style={{ width: "800px", height: "400px" }}>{children}</div>
        ),
    };
});

// --- 2. RESIZE OBSERVER POLYFILL ---
global.ResizeObserver = class ResizeObserver {
  observe() {} unobserve() {} disconnect() {}
};

// --- 3. MOCK CHROME API ---
const mockStorageGet = jest.fn();
const mockStorageSet = jest.fn();
const mockSendMessage = jest.fn();

global.chrome = {
    storage: {
        local: { get: mockStorageGet, set: mockStorageSet },
        onChanged: { addListener: jest.fn() } // Added to prevent background errors
    },
    runtime: { sendMessage: mockSendMessage },
    action: { setBadgeText: jest.fn() }
};

global.open = jest.fn(); 

describe('Integration Tests: Dashboard Interactions', () => {

    let mockCookies = [];

    beforeEach(() => {
        jest.clearAllMocks();
        // Set up a base set of cookies that we can modify during tests
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
        const closeButton = await screen.findByRole('button', { name: /Dismiss/i });
        fireEvent.click(closeButton);
        await waitFor(() => {
            expect(screen.queryByText(/Maximum Privacy Score Reached/i)).not.toBeInTheDocument();
        });
    });

    test('IT-03: Clicking "View Logic" opens GitHub in a new tab', async () => {
        render(<App />);
        fireEvent.click(screen.getByRole('button', { name: /Settings/i }));
        const githubLink = await screen.findByText(/Cookie Calculation Logic/i);
        fireEvent.click(githubLink);
        expect(global.open).toHaveBeenCalledWith(expect.stringContaining('github.com'), '_blank');
    });

    // --- IT-04 FIXED: Dynamic State Handling ---
    test('IT-04: Toggling a Category Filter updates the dashboard list', async () => {
        render(<App />);
        expect(await screen.findByText('_ga')).toBeInTheDocument();

        const analyticsToggle = screen.getByRole('checkbox', { name: /Analytics/i });
        
        // Update the mock cookies BEFORE clicking, so when the component re-renders,
        // it actually sees the "new" state of the world.
        mockCookies = mockCookies.filter(c => c.category !== 'Analytics');

        fireEvent.click(analyticsToggle);

        await waitFor(() => {
            expect(screen.queryByText('_ga')).not.toBeInTheDocument();
        });
        expect(screen.getByText('session')).toBeInTheDocument();
    });

    test('IT-05: Clicking Delete sends correct message to Background Script', async () => {
        render(<App />);
        const rows = screen.getAllByRole('row');
        const gaRow = rows.find(row => within(row).queryByText('_ga'));
        fireEvent.click(within(gaRow).getByRole('checkbox'));
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

    // --- IT-06 FIXED: Added cookies to first visit mock ---
    test('IT-06: Help Centre Modal appears automatically on fresh install', async () => {
        mockStorageGet.mockImplementationOnce((keys, callback) => {
            callback({ 
                is_first_visit: true, 
                cookies_from_site: [{ name: 'test', domain: 'a.com', category: 'Essential' }] 
            }); 
        });

        render(<App />);
        // Finding "Getting Started" which is the first tab of Help Centre
        const helpTitle = await screen.findByText(/Getting Started/i, {}, { timeout: 4000 });
        expect(helpTitle).toBeInTheDocument();
    });

    // --- IT-07 FIXED: Scoped search inside modal ---
    test('IT-07: Clicking a Cookie Row opens the Security Modal with specific data', async () => {
        render(<App />);
        const rows = await screen.findAllByRole('row');
        const fbpRow = rows.find(row => within(row).queryByText('_fbp'));
        
        fireEvent.click(within(fbpRow).getByText('_fbp'));

        // Look for the Modal specifically
        const modal = await screen.findByRole('dialog'); 
        // If your modal doesn't have role="dialog", use screen.getByText('Cookie Details').closest('div')
        
        expect(within(modal).getByText('facebook.com')).toBeInTheDocument();
    });
});