#  Project Name: Educational Cookie Dashboard

This project is a React-based Chrome extension designed to improve users’ understanding of website cookies and online privacy.

---

## Environment Setup & Dependencies

### ⚙️ Prerequisites
Before running this project, ensure you have the following installed:
* **Node.js:** v16.0.0 or higher 
* **npm:** Installed automatically with Node.js
* **Google Chrome:** Required to load and use the extension

---

## 📦 Installation

1. **Clone the repository** 
    ```bash
    git clone https://github.com/laurynn-wl/cookie_project.git

2. **Navigate to project directory**
    ```bash 
    cd cookie_project/code
3. **Install all project dependencies** by running:
   ```bash
   npm install

## 🧩 Chrome Extension Deployment 

Follow these steps to load the extension into Google Chrome. 

1. **Generate the Production Build** \\
    Before loading the extension, you must compile the React code into a format the browser understands. Run the following command in your terminal:
    ```bash
    cd cookie_project/code
    npm run build

2. **Open Chrome Extenstions** 
    1. Open Google Chrome.
    2. In the address bar, type chrome://extensions/ and press Enter.
    3. Or click the three dots (Menu) > Extensions > Manage Extensions.

3. **Enable Developer Mode** \\
    In the top right corner of the Extensions page, locate the Developer mode toggle and switch it to ON. 

4. **Load the Unpacked Extension**
    1. Click the Load unpacked button that appears in the top left.
    2. In the file picker, navigate to your project's root directory.
    3. Select the build folder (created in Step 1) and click Open/Select.

5. **Use Extension** \\
    Once on a website click the extensions icon and click on the Educational Cookie Dashboard to open the dashboard. 