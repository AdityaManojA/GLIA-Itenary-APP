# 🗓️ IAN 2025 Conference App

![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)

A dynamic, real-time event schedule application built for the **XLIII Annual Meeting of the Indian Academy of Neurosciences (IAN 2025)**. This app provides a seamless experience for attendees to view the conference schedule and a secure, easy-to-use dashboard for administrators to manage events.

![App Screenshot](https://via.placeholder.com/800x450.png?text=Add+A+Screenshot+Of+Your+App+Here)
*(Suggestion: Take a screenshot of your running application and replace the link above!)*

## ✨ Features

-   **🗓️ Real-time Schedule:** View the full conference schedule, grouped by date.
-   **⏰ Happening Now:** A special tab that automatically shows events currently in session or starting within the next hour.
-   **🔐 Secure Admin Panel:** A separate, password-protected route for conference organizers.
-   **➕ Easy Event Management:** Admins can add new events, including details like title, speaker, designation, venue, and start/end times.
-   **🖼️ Image Uploads:** Admins can upload speaker images, which are displayed on the schedule.
-   **⚛️ Built with React:** A modern, component-based frontend for a fast user experience.
-   **🔥 Firebase Powered:** Uses Firebase for the backend, including Firestore database, Authentication, and Storage.

## 🛠️ Tech Stack

-   **Frontend:** [React.js](https://reactjs.org/)
-   **Backend & Database:** [Firebase](https://firebase.google.com/) (Firestore, Firebase Authentication, Cloud Storage)
-   **Styling:** Plain CSS

## 🚀 Getting Started

Follow these instructions to get a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

You need to have [Node.js](https://nodejs.org/) and [npm](https://www.npmjs.com/) installed on your computer.

### Installation & Setup

1.  **Clone the repository**
    ```sh
    git clone [https://github.com/your-github-username/your-repo-name.git](https://github.com/your-github-username/your-repo-name.git)
    cd your-repo-name
    ```

2.  **Install NPM packages**
    ```sh
    npm install
    ```

3.  **Set up Firebase**
    This project requires a Firebase project to handle the backend.

    * Go to the [Firebase Console](https://console.firebase.google.com/) and create a new project.
    * In your new project, enable the following services:
        * **Firestore Database**
        * **Authentication** (enable the "Email/Password" sign-in method)
        * **Storage**
    * Go to your Project Settings and in the "General" tab, scroll down to "Your apps". Click on the web icon `</>` to register a new web app.
    * Firebase will provide you with a `firebaseConfig` object. Copy these keys.

4.  **Create an environment file**
    * In the root of the project, create a new file named `.env`.
    * Copy the contents of `.env.example` (if you have one) or use the template below and fill it in with your keys from the previous step.

    ```env
    # .env file

    REACT_APP_FIREBASE_API_KEY="YOUR_API_KEY_HERE"
    REACT_APP_FIREBASE_AUTH_DOMAIN="YOUR_AUTH_DOMAIN_HERE"
    REACT_APP_FIREBASE_PROJECT_ID="YOUR_PROJECT_ID_HERE"
    REACT_APP_FIREBASE_STORAGE_BUCKET="YOUR_STORAGE_BUCKET_HERE"
    REACT_APP_FIREBASE_MESSAGING_SENDER_ID="YOUR_SENDER_ID_HERE"
    REACT_APP_FIREBASE_APP_ID="YOUR_APP_ID_HERE"
    ```

### Running the Application

Once the setup is complete, you can run the app with:

```sh
npm start
```

This will run the app in development mode. Open [http://localhost:3000](http://localhost:3000) to view it in your browser. The page will reload when you make changes.

## 📜 License

This project is licensed under the MIT License. See the text below for more information.

---

### MIT License

Copyright (c) 2025 [Your Name Here]

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
