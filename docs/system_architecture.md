# 🧩 System Architecture and Data Flow

## Overview
The **Cookie Risk Analyser** system is designed as a browser extension that evaluates the privacy risk of cookies stored by websites. It integrates a **React frontend**, a **Node.js backend**, and **Chrome Extension APIs** to retrieve, process, and visualise cookie data.  

The overall goal of this architecture is to enable users to easily understand what cookies are active on a visited site, how they are categorised, and how risky they may be in terms of privacy.

---

## 1. System Components

### **Frontend (React Interface)**
- Built using **React** and served through the Chrome extension popup.  
- Displays the main **dashboard** that visualises cookie information.  
- Includes interactive **charts** that show cookie categories, domains, and privacy scores.  
- Requests processed data from the backend and presents it to the user in a simple, visual format.

---

### **Backend (Node.js Server)**
- A lightweight **Node.js script** that performs the analysis of retrieved cookies.  
- Processes cookie data and assigns a **risk level** based on attributes (e.g., `Secure`, `HttpOnly`, `SameSite`).  
- Returns a structured JSON response to the frontend, including:  
  - Total cookies detected  
  - Risk categories (e.g., low, medium, high)  
  - Overall privacy score  

---

### **Background Script (Chrome API Handler)**
- Runs in the background of the Chrome browser.  
- Uses the **Chrome Cookies API** to collect cookies from the currently active tab or domain.  
- Acts as a **bridge** between the browser environment and the backend.  
- Sends cookie data to the Node.js backend for analysis, then relays the results to the frontend interface.

---

### **Manifest File**
- Defines the **extension’s properties and structure**.  
- Declares permissions such as:
  ```json
  "permissions": ["cookies", "tabs", "storage", "activeTab"]
