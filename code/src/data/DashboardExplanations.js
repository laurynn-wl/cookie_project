// Explanations displayed on the dashboard - consits of technical and non-technical explanations 
export const category_explanation = {
    "Essential": {
        simple: "Essential cookies are needed for the website to work properly. They help to keep you logged in and remember items in your shopping basket as you move between pages.",
        technical: "Essential cookies are required for core website operations, including session management, login persistence and shopping basket functionality.", 
    }, 
    "Preference": {
        simple: "Preference cookies allow the browser to remember how you like things. For example when you set a preferred language, this choice is saved so you don't need to reset it the next time you visit the website.",
        technical: "Preference cookies store user settings, such as language, region or currency to maintain a consistent user experience across sessions."
    }, 
    "Analytics": {
        simple: "Analytical cookies help websites owners understand how people interact with the website. They collect information on which pages are visited the most and how long users stay on each page, so that the website can be improved.",
        technical: "Analytical cookies collect anonymised data on user interactions, such as page views and session duration to enhance website performance.",
    }, 
    "Tracking": {
        simple: "Tracking cookies are used to follow your activity across different websites. They are often used to build a profile of your interests and show you adverts related to things you have recently viewed.", 
        technical: "Tracking cookies enable cross site tracking of user behaviour and are primarily used for targeted advertising, marketing analytics and user profiling.",
    }, 
    "Unknown": {
        simple: "Unknown cookies are cookies that this dashboard couldn't confidently categorise since there is not enough information about what they are used for.",
        technical: "Unknown cookies may not be automatically identified using the 'Open Cookies Database' or standard classification patterns.",
    },
}

export const security_explanation = {
    httpOnly: {
        title: "Missing HTTP ONLY",
        description: {
            simple: "This cookie can be seen by scripts running on the website, which could allow attackers to steal this cookie if the website is not secure.",
            technical: "This cookie can be accessed by client-side scripts, increasing the risk of cross site scripting (XSS) attacks.",
        }
    },
    secure: {
        title: "Missing Secure",
        description: {
            simple: "This cookie may be sent without encryption, making it easier for attackers to intercept the cookie.",
            technical: "This cookie is sent over unencrypted HTTP connections, increasing interception risk.",
        }
    }, 
    hostOnly: {
        title: "Wide Domain Scope (hostOnly)",
        description: {
            simple: "This cookie can be used across other parts of the website, which makes it easier for attackers to access if one part of the website is compromised.",
            technical: "This cookie is accessible to all subdomains of this website, increasing the attack surface.",
        }
    }, 
    sameSite: {
        title: "SameSite: No Restriction",
        description: {
            simple: "This cookie can be sent when you visit other websites, which could allow attackers to trick the website into doing something on your behalf or to track your activity across sites.",
            technical: "This cookie is sent with cross-site requests, enabling CSRF attacks and tracking. ",
        }
    }, 
    expiration: {
        title: "Long Expiration Date", 
        description: {
            simple: "This cookie lasts for over a year, which allow websites to remember your activity for a long time, often for tracking purposes.",
            technical: "This cookie expires in over a year, which is typical for persistent tracking.",
        }
    },
    safe:{
        title: "Low Risk Cookie",
        description: {
            simple: "This cookie is set safely and does not pose security or privacy risks.",
            technical: "This cookie has all recommended security attributes.",
        }
    } 
}

export const category_colour = {
    Essential: '#4ade80',
    Preference: '#38bdf8',
    Analytics: '#a78bfa',
    Tracking: '#f87171',
    Unknown: "#9CA3AF"
};