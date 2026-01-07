# Cookie Risk Assessment Methodology

This document outlines the logic used to evaluate the security posture and purpose of browser cookies. The system categorizes cookies into functional groups (e.g., Essential vs. Tracking) and assigns a **"Risk Score"** based on security attributes. This methodology aligns with OWASP Session Management best practices and industry standards for cookie classification.

## 1. Cookie Categorization System

The application categorizes cookies into five distinct groups: **Essential**, **Preference**, **Analytics**, **Tracking**, and **Unknown**. This categorization is achieved through a **Tiered Lookup System** that prioritizes database accuracy before falling back to pattern matching.

### Tier 1: Open Cookie Database (Level 3)
The system first queries a local instance of the [Open Cookie Database](https://github.com/jkwakman/Open-Cookie-Database).
* **Exact Match:** Checks for a direct match of the cookie name (e.g., `_ga`, `IDE`).
* **Wildcard Match:** Checks for vendor-specific prefixes (e.g., `prism_` for Active Campaign) defined in the database schema.
* **Mapping:** Database categories are mapped to internal groups (e.g., "Marketing" $\rightarrow$ "Tracking", "Security" $\rightarrow$ "Essential").

### Tier 2: Scientific Pattern Matching (Level 2)
If no database match is found, the system applies Regular Expressions (Regex) based on official vendor documentation and web standards.

| Category | Cookie Pattern / ID | Classification Logic | Reference / Standard |
| :--- | :--- | :--- | :--- |
| **Essential** | `st-` | **Session Token.** Used to maintain user state in frameworks like Streamlit. "ST" is the standard abbreviation for Session Token in security protocols. | [OIPM (OpenID Connect)](https://doi.org/10.1109/ACCESS.2024.3351980) <br> [Streamlit Documentation](https://docs.streamlit.io/develop/concepts/connections/authentication) |
| **Essential** | `JSESSIONID`<br>`PHPSESSID` | **Session Identifier.** Strictly necessary for the server to recognize the user across page loads. Defined in core server specifications. | [Java Servlet Spec (JSR 369)](https://jcp.org/en/jsr/detail?id=369) <br> [OWASP Session Management](https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html) |
| **Essential** | `AWSALB`<br>`AWSALBCORS` | **Load Balancing.** Used to maintain "sticky sessions," routing a user to the same server for application stability. | [AWS ELB Documentation](https://docs.aws.amazon.com/elasticloadbalancing/latest/application/sticky-sessions.html) |
| **Essential** | `csrf-` `xsrf-`<br>`_csrf` | **Security Token.** Anti-forgery tokens required to prevent Cross-Site Request Forgery (CSRF) attacks. | [NIST SP 800-63B](https://pages.nist.gov/800-63-3/sp800-63b.html) <br> [IETF RFC 6749 (OAuth 2.0)](https://datatracker.ietf.org/doc/html/rfc6749) |
| **Analytics** | `_ga` `_gid`<br>`_gat` | **User Measurement.** Used to distinguish users for statistical reporting without identifying them personally. | [Google Analytics Cookie Usage](https://developers.google.com/analytics/devguides/collection/analyticsjs/cookie-usage) |
| **Analytics** | `_pk_` | **User Measurement.** Used by Matomo (Piwik) to store a unique visitor ID for analytics. | [Matomo Analytics FAQ](https://matomo.org/faq/general/faq_146/) |
| **Tracking** | `IDE` | **Ad Delivery.** Used by Google DoubleClick to register user actions after viewing an ad (Conversion Tracking). | [Google Advertising Policies](https://policies.google.com/technologies/types) |
| **Tracking** | `_fbp` `fr` | **Cross-Site Tracking.** Used by Meta (Facebook) to track users across websites for targeted advertising. | [Meta Pixel Reference](https://developers.facebook.com/docs/meta-pixel/) |
| **Preference** | `lang`<br>`language` | **UI Personalization.** Stores the user's preferred language (e.g., `en-US`) for the interface. | [IETF BCP 47 (Language Tags)](https://datatracker.ietf.org/doc/html/rfc5646) |
| **Preference** | `wp-settings-` | **UI Persistence.** Stores WordPress admin interface customization settings (not user data). | [WordPress Codex (Cookies)](https://wordpress.org/support/article/cookies/) |

### Tier 3: Heuristic Keyword Analysis (Level 1)
As a final fallback, the system scans the cookie name for common English keywords associated with specific functions.
* **Essential:** `sess`, `auth`, `login`, `id`, `cart`
* **Analytics:** `stats`, `metric`, `analytics`
* **Tracking:** `ads`, `pixel`, `banner`, `tracker`
* **Preference:** `pref`, `theme`, `darkmode`

**Default State:** Any cookie failing all three checks is labeled **"Unknown"** (Unclassified).

---

## 2. Risk Scoring System

The risk calculation is based on the presence (or absence) of critical security attributes defined in the Chrome Cookies API. Scores are weighted based on the severity of the potential exploit.

A cumulative **Risk Score** is calculated starting at **0**. Points are added for every missing security feature or unsafe configuration:

| Attribute Check | Condition | Points Added | Security Justification |
| :--- | :--- | :--- | :--- |
| **Secure Flag** | Missing | **+3** | Without `Secure`, cookies are transmitted over unencrypted HTTP, making them susceptible to interception via Man-in-the-Middle (MitM) attacks. |
| **HttpOnly Flag** | Missing | **+3** | Without `HttpOnly`, cookies can be accessed by client-side JavaScript, significantly increasing the risk of session theft via XSS. |
| **SameSite** | No Restriction | **+2** | Cookies set with `SameSite=None` (or no restriction) allow cross-site requests, enabling CSRF attacks and third-party tracking. |
| **HostOnly** | False | **+1** | If a cookie is not `HostOnly`, it is accessible to all subdomains (e.g., `*.example.com`), widening the attack surface if a subdomain is compromised. |
| **Expiration** | > 1 Year | **+1** | Long-lived persistent cookies (over 31,536,000 seconds) typically indicate aggressive user tracking rather than functional necessity. |

## 3. Risk Classification Thresholds

Once the total score is calculated, the cookie is categorized into one of three risk levels. This logic is handled by the `generate_cookie_risk` function.

| Total Score | Risk Level | Description |
| :--- | :--- | :--- |
| **7 or higher** | **High Risk** | **Critical Vulnerability.** Likely missing both `Secure` and `HttpOnly` flags. Immediate remediation required. |
| **3 to 6** | **Moderate Risk** | **Significant Vulnerability.** Missing at least one major flag (e.g., `Secure`) or combines multiple lower risks (e.g., `SameSite` issues + Tracking). |
| **0 to 2** | **Low Risk** | **Safe / Best Practice.** The cookie follows most security guidelines, though minor configuration notices (like Long Expiration) may exist. |

## 4. Vulnerability Descriptions

In addition to the numerical score, the system provides qualitative analysis via the `get_detailed_analysis` function. This maps technical flags to user-friendly descriptions.

* **Missing HttpOnly:** "This cookie can be accessed by client-side scripts, increasing the risk of XSS attacks."
* **Missing Secure:** "This cookie is sent over unencrypted HTTP connections, increasing interception risk."
* **Wide Domain Scope:** "This cookie is accessible to all subdomains, increasing the attack surface."
* **Long Expiration:** "This cookie expires in over a year, which is typical for persistent tracking."

## 5. References

1.  **Chrome for Developers.** (2025). *chrome.cookies API Reference*. Available at: [https://developer.chrome.com/docs/extensions/reference/api/cookies](https://developer.chrome.com/docs/extensions/reference/api/cookies)
2.  **OWASP.** (n.d.). *Session Management Cheat Sheet*. Available at: [https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html](https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html)
3.  **Open Cookie Database.** (n.d.). *A Community-driven database of cookies*. GitHub. Available at: [https://github.com/jkwakman/Open-Cookie-Database](https://github.com/jkwakman/Open-Cookie-Database)
4.  **Al-Fayoumi, M. et al.** (2024). *OIPM: Access Control Method to Prevent ID/Session Token Abuse on OpenID Connect*. IEEE Access. [doi:10.1109/ACCESS.2024.3351980](https://doi.org/10.1109/ACCESS.2024.3351980)
5.  **NIST.** (2017). *Digital Identity Guidelines (SP 800-63B)*. Available at: [https://pages.nist.gov/800-63-3/sp800-63b.html](https://pages.nist.gov/800-63-3/sp800-63b.html)