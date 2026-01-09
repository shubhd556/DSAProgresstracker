# 🚀 DSA Progress Tracker - NeetCode 150

A personal, web-based tracker designed to help developers organize and visualize their journey through the **NeetCode 150** problem set. This application gamifies the preparation process with a points system and provides detailed statistics on your progress.

**Live Demo:** [https://personaldsatracker.netlify.app/](https://personaldsatracker.netlify.app/)

![Project Screenshot](https://via.placeholder.com/1200x600?text=DSA+Progress+Tracker+Screenshot)
*(Note: Replace the link above with an actual screenshot of your dashboard once you have one!)*

## ✨ Features

* **NeetCode 150 Integration:** Pre-loaded with the complete list of 150 curated DSA problems.
* **Progress Tracking:** Mark problems as "Completed" to update your stats instantly.
* **Gamification (Glory Points):** Earn points for every problem solved to keep motivation high.
* **Local Storage Support:** All data is saved directly in your browser—no login or database required.
* **Smart Filtering & Search:**
    * Search by problem title.
    * Filter by Topic (Arrays, Trees, DP, etc.).
    * Filter by Difficulty (Easy, Medium, Hard).
    * Filter by Status (Completed/Not Completed).
* **Statistics Dashboard:** Visual breakdown of your progress by total count, difficulty, and specific topics.
* **Data Management:** Functionality to **Import**, **Export**, and **Reset** your progress (useful for backing up data or moving between devices).

## 🛠️ Tech Stack

* **Frontend:** HTML5, CSS3, JavaScript (Vanilla)
* **Data Handling:** JSON (Local Data), Browser LocalStorage API
* **Deployment:** Netlify

## 📂 Project Structure

```bash
DSAProgresstracker/
├── data/              # Contains the problem dataset (JSON/JS)
├── app.js             # Main application logic (DOM manipulation, LocalStorage, Filtering)
├── index.html         # Main HTML structure
├── styles.css         # Styling and layout
└── README.md          # Project documentation



🚀 Getting Started
To run this project locally on your machine, follow these steps:

Prerequisites
You only need a modern web browser (Chrome, Firefox, Edge, etc.) to run this application.

Installation
Clone the repository:

Bash

git clone [https://github.com/shubhd556/DSAProgresstracker.git](https://github.com/shubhd556/DSAProgresstracker.git)
Navigate to the project directory:

Bash

cd DSAProgresstracker
Launch the App: Simply open the index.html file in your web browser.

Optionally, you can use the "Live Server" extension in VS Code for a better development experience.

💡 How to Use
Select a Topic: Use the dropdowns to filter for specific topics (e.g., "Two Pointers").

Solve a Problem: Click the problem link to visit LeetCode.

Mark as Done: Check the box next to the problem name. Your "Glory Points" and progress bars will update automatically.

Save/Move Data: Use the Export button to download a .json file of your progress. Use Import to upload that file on a different device.

🤝 Contributing
Contributions are welcome! If you have suggestions for new features (like adding the Blind 75 list or dark mode), feel free to fork the repo and submit a pull request.

Fork the Project

Create your Feature Branch (git checkout -b feature/AmazingFeature)

Commit your Changes (git commit -m 'Add some AmazingFeature')

Push to the Branch (git push origin feature/AmazingFeature)

Open a Pull Request

📄 License
Distributed under the MIT License. See LICENSE for more information.

Made with ❤️ by Shubham
