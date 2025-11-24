//TODO: Change the explanation 

export const mockCookies = [
    { id: 1, name: '_ga', domain: 'google-analytics.com', category: 'Analytics', vulnerabilities: ['3rd-Party'], expiration: '2 years' },
    { id: 2, name: 'session_id', domain: 'current-site.com', category: 'Essential', vulnerabilities: ['Missing Secure', 'Missing HttpOnly'], expiration: 'Session' },
    { id: 3, name: '_gid', domain: 'google-analytics.com', category: 'Analytics', vulnerabilities: ['3rd-Party'], expiration: '24 hours' },
    { id: 4, name: 'lang_pref', domain: 'current-site.com', category: 'Preference', vulnerabilities: [], expiration: '1 year' },
    { id: 5, name: 'ad_id', domain: 'doubleclick.net', category: 'Tracking', vulnerabilities: ['3rd-Party', 'Tracking'], expiration: '1 year' },
    { id: 6, name: 'user_token', domain: 'current-site.com', category: 'Essential', vulnerabilities: [], expiration: '30 days' },
    { id: 7, name: 'theme', domain: 'current-site.com', category: 'Preference', vulnerabilities: [], expiration: '6 months' },
    { id: 8, name: 'fr', domain: 'facebook.com', category: 'Tracking', vulnerabilities: ['3rd-Party', 'Tracking'], expiration: '3 months' },
    { id: 9, name: '_ga_XYZ123', domain: 'google-analytics.com', category: 'Analytics', vulnerabilities: ['3rd-Party'], expiration: '2 years' },
    { id: 10, name: 'cookie_consent', domain: 'current-site.com', category: 'Preference', vulnerabilities: [], expiration: '1 year' },
    { id: 11, name: '__Secure-sess', domain: 'current-site.com', category: 'Essential', vulnerabilities: [], expiration: 'Session' }
];

export const category_data = {
    Essential: { color: '#4ade80', explanation: "<strong>Essential Cookies:</strong> These are necessary for the website to function. They are usually set in response to actions made by you, such as logging in or filling in forms." },
    Preference: { color: '#38bdf8', explanation: "<strong>Preference Cookies:</strong> These cookies allow a website to remember information that changes the way the website behaves or looks, like your preferred language or region." },
    Analytics: { color: '#a78bfa', explanation: "<strong>Analytics Cookies:</strong> Used to understand how visitors interact with the website. They help measure traffic sources and page views, usually anonymously." },
    Tracking: { color: '#f87171', explanation: "<strong>Tracking Cookies:</strong> These are set by third-party advertisers to build a profile of your interests and show you relevant adverts on other sites. Rejecting these stops this tracking." }
};

export const category_colour = {
    Essential: '#4ade80',
    Preference: '#38bdf8',
    Analytics: '#a78bfa',
    Tracking: '#f87171'
};