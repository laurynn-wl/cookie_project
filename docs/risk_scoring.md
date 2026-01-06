# Cookie Risk Assessment Methodology

This document outlines the logic used to evaluate the security posture of browser cookies. The system assigns a **"Risk Score"** to each cookie based on its attributes and flags vulnerabilities that may expose users to attacks such as Cross-Site Scripting (XSS) and Cross-Site Request Forgery (CSRF).

## 1. Risk Scoring System

The risk calculation is based on the presence (or absence) of critical security attributes defined in the Chrome Cookies API. Scores are weighted based on the severity of the potential exploit, aligning with OWASP Session Management best practices.

A cumulative **Risk Score** is calculated starting at **0**. Points are added for every missing security feature or unsafe configuration:

| Attribute Check | Condition | Points Added | Security Justification |
| :--- | :--- | :--- | :--- |
| **Secure Flag** | Missing | **+3** | Without `Secure`, cookies are transmitted over unencrypted HTTP, making them susceptible to interception via Man-in-the-Middle (MitM) attacks. |
| **HttpOnly Flag** | Missing | **+3** | Without `HttpOnly`, cookies can be accessed by client-side JavaScript, significantly increasing the risk of session theft via XSS. |
| **SameSite** | No Restriction | **+2** | Cookies set with `SameSite=None` (or no restriction) allow cross-site requests, enabling CSRF attacks and third-party tracking. |
| **HostOnly** | False | **+1** | If a cookie is not `HostOnly`, it is accessible to all subdomains (e.g., `*.example.com`), widening the attack surface if a subdomain is compromised. |
| **Expiration** | > 1 Year | **+1** | Long-lived persistent cookies (over 31,536,000 seconds) typically indicate aggressive user tracking rather than functional necessity. |

## 2. Risk Classification Thresholds

Once the total score is calculated, the cookie is categorized into one of three risk levels. This logic is handled by the `generate_cookie_risk` function.

| Total Score | Risk Level | Description |
| :--- | :--- | :--- |
| **7 or higher** | **High Risk** | **Critical Vulnerability.** Likely missing both `Secure` and `HttpOnly` flags. Immediate remediation required. |
| **3 to 6** | **Moderate Risk** | **Significant Vulnerability.** Missing at least one major flag (e.g., `Secure`) or combines multiple lower risks (e.g., `SameSite` issues + Tracking). |
| **0 to 2** | **Low Risk** | **Safe / Best Practice.** The cookie follows most security guidelines, though minor configuration notices (like Long Expiration) may exist. |

## 3. Vulnerability Descriptions

In addition to the numerical score, the system provides qualitative analysis via the `get_detailed_analysis` function. This maps technical flags to user-friendly descriptions.

* **Missing HttpOnly:** "This cookie can be accessed by client-side scripts, increasing the risk of XSS attacks."
* **Missing Secure:** "This cookie is sent over unencrypted HTTP connections, increasing interception risk."
* **Wide Domain Scope:** "This cookie is accessible to all subdomains, increasing the attack surface."
* **Long Expiration:** "This cookie expires in over a year, which is typical for persistent tracking."

## 4. References

1.  **Chrome for Developers.** (2025). *chrome.cookies API Reference*. Available at: [https://developer.chrome.com/docs/extensions/reference/api/cookies](https://developer.chrome.com/docs/extensions/reference/api/cookies)
2.  **OWASP.** (n.d.). *Session Management Cheat Sheet*. Available at: [https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html](https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html)