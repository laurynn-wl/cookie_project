// Utility function to convert a cookie's domain and path into a URL - for testing script
export const getCookieUrl = (cookie) => {

    if(!cookie) return '';
    const protocol = cookie.secure ? 'https:' : 'http:';
    const domain = cookie.domain.startsWith('.') ? cookie.domain.slice(1) : cookie.domain;
    const path = cookie.path || '/';

    return `${protocol}//${domain}${path}`;
}