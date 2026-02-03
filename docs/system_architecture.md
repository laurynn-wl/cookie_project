# System Architecture and Data Flow

## Overview
The **Cookie Risk Analyser** system is designed as a browser extension which anlyses the security/ privacy risks of cookies stored on the current website. It is built primarily with **React** using **Chrome Extension APIs** to retrieve, process, and visualise cookie data.  

The overall aim of this architecture is to enable users to easily understand what cookies are active on the current website they're visiting, how they are categorised, and how risky they may be in terms of privacy.

---

## System Components

### **Frontend (React Interface)**
- Built using **React** and served through the Chrome extension popup.  
- **Analysis Engine**:
  - Categorises cookies into **Essential, Preference, Analytics, Tracking or Unknown**. 
  - Calculates a risk level of each cookie based on it's individual attributes (`Secure`, `HttpOnly`, `SameSite` etc).
  - Computes an overall privacy score for the website based on factors such as **Tracking Cookies** and **Excessive Cookie Collection**. 
- **Visualisation**:
  - Displays a table with all the cookies active on the website.
  - Assigns colour coded risk labels to each cookie.
  - A pie chart is used to show the split of all the cookie categories.
- **User Interaction**:
  - Users can send a **delete cookies** command to the background script to remove these cookies from being stored on their browser.     

---

### **Background Script (Chrome API Handler)**
- Runs in the background of the Chrome browser.  
- **Deep Scanning**:
  - Uses the **WebNavigation API** to detect cookies in embedded frames (iframes/ads).
  - Uses the **Scripting & Performance APIs** to detect "ghost" cookies (pixels/scripts) that don't have frames (e.g., Google Tracking).
- **Cookie Management**:
  - Handles the retrieval of cookies using the **Chrome Cookies API**.
  - Executes **Deletion Logic**, including complex removal of Partitioned (CHIPS) cookies. (#TODO: NEEDS TO BE IMPLEMENTED)
- **Storage Management**: Saves retrieved raw data into `chrome.storage.local` for the Frontend to consume.

---

### **Data Persistence (Chrome Storage)**
- Acts as the bridge between the Background Script and the React Frontend.
- Stores the raw cookie data and current tab information locally.
- Ensures the dashboard displays the correct data even if the popup is closed and reopened.

---

### **Manifest File**
- Defines the **extension’s properties and structure**.  
- Declares permissions such as:
  ```json
  "permissions": ["cookies", "tabs", "storage", "activeTab", "webNavigation", "scripting"]
  "host_permissions": ["<all_urls>"]
