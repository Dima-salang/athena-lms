# Athena LMS

Athena LMS is a modern, secure, and intuitive Learning Management System designed to streamline the educational assessment process. It empowers teachers to create diverse assessments, automates grading for efficiency, and provides students with a seamless testing experience.

## 🚀 Key Features

*   **Role-Based Access Control (RBAC):** Secure and distinct portals for **Students**, **Teachers**, and **Admins**.
*   **Advanced Test Management:**
    *   Create comprehensive exams with mixed question types: **Multiple Choice, True/False, Identification, and Essay**.
    *   Set strict time limits, due dates, and "infinite time" options.
    *   Organize assessments by Subjects and Sections.
*   **Smart Grading System:**
    *   **Automatic Grading:** Instant scoring for objective questions.
    *   **Manual Reviews:** Teachers can grade essays and manually override scores for any answer.
    *   **Recalculation:** One-click score updates after adjusting grading criteria.
*   **Student Experience:**
    *   **Interactive Dashboard:** View pending tests, past submissions, and performance history.
    *   **Secure Testing Environment:** Timed exams with auto-submission on deadline.
    *   **Real-time Autosave:** Answers are saved automatically as you type—never lose work.
    *   **Instant Feedback:** View detailed results and correct answers.
*   **Admin Tools:** Manage users, subjects, sections, and teacher assignments effortlessly.

## 🛠️ Technology Stack

### Backend
*   **Language:** Java 17+
*   **Framework:** Spring Boot 3
*   **Database:** PostgreSQL (with Hibernate/JPA & Blaze Persistence)
*   **Logging:** SLF4J with Logback
*   **Build Tool:** Maven

### Frontend
*   **Framework:** React 19
*   **Build Tool:** Vite
*   **Language:** TypeScript
*   **Styling:** Tailwind CSS 4
*   **UI Components:** Shadcn UI (@radix-ui)
*   **Routing:** React Router v7
*   **State Management:** React Hooks & Context

## ⚙️ Getting Started

Follow these steps to set up the project locally.

### Prerequisites
*   **Java JDK 17** or higher
*   **Node.js 18** or higher
*   **PostgreSQL** installed and running

### 1. Backend Setup

1.  Navigate to the project root:
    ```bash
    cd athena-lms
    ```
2.  Configure your database connection in `src/main/resources/application.properties` (create or update if necessary):
    ```properties
    spring.datasource.url=jdbc:postgresql://localhost:5432/athena_db
    spring.datasource.username=your_username
    spring.datasource.password=your_password
    spring.jpa.hibernate.ddl-auto=update
    ```
3.  Run the application using the Maven wrapper:
    ```bash
    ./mvnw spring-boot:run
    ```
    The backend server will start on `http://localhost:8080`.

### 2. Frontend Setup

1.  Navigate to the frontend directory:
    ```bash
    cd src/frontend/athena-lms
    ```
2.  Install dependencies:
    ```bash
    npm install
    # or
    yarn install
    ```
3.  Start the development server:
    ```bash
    npm run dev
    ```
    The frontend will be available at `http://localhost:5173` (or the port shown in your terminal).

## 📖 Usage Guide

### For Teachers
1.  **Login** with your teacher credentials.
2.  Navigate to **"Create Test"** to build a new assessment.
3.  Assign the test to a specific **Section** and **Subject**.
4.  Track student progress in the **Dashboard** and view detailed submission reports.

### For Students
1.  **Login** to view your dashboard.
2.  Click **"Take Test"** on any available assessment.
3.  Complete the questions within the time limit. Your answers **autosave** periodically.
4.  Submit to view your score immediately (for objective parts).

### For Admins
1.  **Login** to the Admin Panel.
2.  Manage **Users** (Students/Teachers), **Sections**, and **Subjects**.
3.  Assign teachers to specific sections.

## 🛡️ Security

Athena LMS uses standard password encryption (BCrypt) and role-based security checks for all API endpoints. Logging is implemented for critical actions like test creation, submission, and grading to ensure auditability.

## 🤝 Contributing

Contributions are welcome! Please fork the repository and submit a Pull Request with your changes.

