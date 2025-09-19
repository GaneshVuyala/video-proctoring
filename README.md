
# 🎥 AI Video Proctoring System

A full-stack web application designed to monitor candidates during **online interviews**. It uses **real-time computer vision in the browser** to detect suspicious activities such as unauthorized objects, multiple faces, or loss of focus. All detected events are logged and compiled into a **final integrity report** for interviewers.

## ✨ Features

  - **Real-Time Proctoring**
    Uses **TensorFlow.js** and **MediaPipe** to run CV models directly in the browser.
  - **Event Detection**
    Flags events such as:
      - Looking away
      - Candidate absence
      - Multiple faces detected
      - Detection of phones or books
  - **User Roles**
      - **Candidates** → Take the test/interview
      - **Interviewers** → Review results and reports
  - **Authentication**
    Secure login and registration system with **JWT** for session management.
  - **Video Recording**
    Captures candidate sessions and uploads them to **Cloudinary**.
  - **Interviewer Dashboard**
    A central place to review integrity reports, recorded videos, and candidate session history.

## 🛠️ Tech Stack

  - **Frontend:** React, Vite, TypeScript, Tailwind CSS
  - **Backend:** Node.js, Express.js
  - **Database:** MongoDB
  - **Computer Vision:** TensorFlow.js (COCO-SSD), MediaPipe (Face Mesh)
  - **Video Storage:** Cloudinary
  - **Authentication:** JWT, bcryptjs

-----

## ⚙️ Setup Instructions

### ✅ Prerequisites

  - Node.js (v20.19.0 or higher)
  - npm or yarn
  - Git
  - MongoDB database (local or Atlas)
  - Cloudinary account (for video storage)

-----

## 🚀 Getting Started

### 1\. Clone the Repository

```bash
git clone <your-repository-url>
cd <your-repository-folder>
```

### 2\. Backend Setup

Navigate to the server directory and install dependencies:

```bash
cd server
npm install
```

Create a `.env` file inside the `server` folder and add your secret keys:

**File**: `server/.env`

```env
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_super_secret_random_string
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

Run the backend server:

```bash
npm run dev
```

➡️ Backend will be available at: `http://localhost:5001`

### 3\. Frontend Setup

Open a new terminal, navigate to the client directory, and install dependencies:

```bash
cd client
yarn install
```

Run the frontend development server:

```bash
yarn dev
```

➡️ Frontend will be available at: `http://localhost:5173`

### 4\. Create Users

Open the application in your browser and use the **Register** form to create an **Interviewer** account and a **Candidate** account to test the different user flows.

-----

## 📊 Project Overview

This system provides:

  - ✅ Fair interviews with AI-based proctoring
  - ✅ Event-based logging for suspicious activity
  - ✅ Transparency through video evidence and integrity reports
