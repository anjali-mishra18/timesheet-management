# Manual Setup Guide: Timesheet Management System

If the automated launcher (`START_PROJECT.bat`) isn't working on the new machine, please follow these manual steps to get the system running.

## 📋 1. Prerequisites (Must be installed first)

Before you begin, ensure the new machine has these two tools installed:
1.  **.NET 8.0 SDK**: [Download here](https://dotnet.microsoft.com/en-us/download/dotnet/8.0)
2.  **Node.js (LTS Version)**: [Download here](https://nodejs.org/en)

---

## ⚙️ 2. Step-by-Step Setup

### Step A: Prepare the Backend
1.  Open **Command Prompt** (cmd) or **PowerShell**.
2.  Navigate to your project's backend folder:
    ```cmd
    cd C:\Path\To\Your\anjali_project\backend
    ```
3.  Restore and build the project:
    ```cmd
    dotnet build
    ```
4.  Run the server:
    ```cmd
    dotnet run
    ```
    *Keep this window open. It should say "Now listening on: http://localhost:5254"*

### Step B: Prepare the Frontend
1.  Open a **SECOND** Command Prompt window.
2.  Navigate to your project's frontend folder:
    ```cmd
    cd C:\Path\To\Your\anjali_project\frontend
    ```
3.  Install the required libraries (this is the most important step):
    ```cmd
    npm install
    ```
4.  Run the portal:
    ```cmd
    npm start
    ```
    *Wait for it to say "Compiled successfully."*

---

## ✅ 3. Verification

Once both windows are running:
1.  Open your browser.
2.  Go to: **`http://localhost:4200`**
3.  You should see the "Timesheet Management System" login page.

---

## 🛠️ Troubleshooting (If it still fails)

*   **"npm not found"**: You must restart your Command Prompt after installing Node.js.
*   **"dotnet not found"**: You must restart your Command Prompt after installing the .NET SDK.
*   **Port in use (5254 or 4200)**: If a port is already taken, try restarting your computer to clear any stuck processes.
*   **Permission denied**: Right-click your Command Prompt and select **"Run as Administrator."**
