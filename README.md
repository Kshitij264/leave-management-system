# Mini Leave Management System

This is the backend API for a mini leave management system, built for a technical assignment. The system provides a RESTful API to manage employees and their leave requests, including applying for, approving, and tracking leaves.

## Live URL

The deployed API is live and can be accessed at: **https://leave-management-system-hcld.onrender.com/**

## System Architecture

The application follows a simple 3-tier architecture, consisting of a client, a backend server, and a database.

![High-Level Design Diagram](./hld.png)

## Setup and Installation

1.  Clone the repository: `git clone https://github.com/Kshitij264/leave-management-system`
2.  Navigate to the project directory: `cd leave-management-system`
3.  Install dependencies: `npm install`
4.  Create a `.env` file in the root directory. Add your personal MongoDB Atlas connection string to this file. **This file should not be shared.**
    ```
    # .env file
    DATABASE_URL=mongodb+srv://your_username:your_password@cluster0...
    ```
5.  Start the server: `npm start`

## Assumptions Made

* [cite_start]All employees are given a fixed number of 20 leaves annually upon creation. [cite: 19]
* Leave duration is calculated in full calendar days (including weekends/holidays).
* The system implements one generic type of leave for this MVP.
* The initial leave balance is not prorated based on the employee's joining date.

## API Endpoint Documentation

### 1. Add a New Employee
* [cite_start]**Description:** Creates a new employee record and automatically generates their initial leave balance. [cite: 17]
* **Method:** `POST`
* **URL:** `/api/employees`
* **Sample Body:**
    ```json
    {
      "name": "Jane Doe",
      "email": "jane.doe@example.com",
      "department": "Marketing",
      "joiningDate": "2024-09-01"
    }
    ```
* **Sample Success Response (201 Created):**
    ```json
    {
        "name": "Jane Doe",
        "email": "jane.doe@example.com",
        "department": "Marketing",
        "joiningDate": "2024-09-01T00:00:00.000Z",
        "_id": "68a2b5e0a4f6d3f7e0a1b2c3",
        "createdAt": "2025-08-19T13:30:00.123Z",
        "updatedAt": "2025-08-19T13:30:00.123Z",
        "__v": 0
    }
    ```

### 2. Apply for Leave
* [cite_start]**Description:** Submits a new leave request for an employee. [cite: 18]
* **Method:** `POST`
* **URL:** `/api/leaves`
* **Sample Body:**
    ```json
    {
      "employeeId": "68a2b5e0a4f6d3f7e0a1b2c3",
      "startDate": "2025-11-10",
      "endDate": "2025-11-12",
      "reason": "Personal time off."
    }
    ```
* **Sample Success Response (201 Created):**
    ```json
    {
        "employeeId": "68a2b5e0a4f6d3f7e0a1b2c3",
        "startDate": "2025-11-10T00:00:00.000Z",
        "endDate": "2025-11-12T00:00:00.000Z",
        "reason": "Personal time off.",
        "status": "pending",
        "_id": "68a2b6f1a4f6d3f7e0a1b2d4",
        "createdAt": "2025-08-19T13:32:01.456Z",
        "updatedAt": "2025-08-19T13:32:01.456Z",
        "__v": 0
    }
    ```

### 3. Approve or Reject Leave
* **Description:** Updates the status of a pending leave request. [cite_start]If approved, the employee's leave balance is updated. [cite: 18]
* **Method:** `PUT`
* **URL:** `/api/leaves/:id/status` (replace `:id` with a leave request ID)
* **Sample Body:**
    ```json
    {
      "status": "approved"
    }
    ```
* **Sample Success Response (200 OK):**
    ```json
    {
        "_id": "68a2b6f1a4f6d3f7e0a1b2d4",
        "employeeId": "68a2b5e0a4f6d3f7e0a1b2c3",
        "startDate": "2025-11-10T00:00:00.000Z",
        "endDate": "2025-11-12T00:00:00.000Z",
        "reason": "Personal time off.",
        "status": "approved",
        "createdAt": "2025-08-19T13:32:01.456Z",
        "updatedAt": "2025-08-19T13:35:10.789Z",
        "__v": 0
    }
    ```

### 4. Fetch Leave Balance
* [cite_start]**Description:** Retrieves the current leave balance for an employee. [cite: 19]
* **Method:** `GET`
* **URL:** `/api/employees/:id/balance` (replace `:id` with an employee ID)
* **Body:** (No body required)
* **Sample Success Response (200 OK):**
    ```json
    {
        "total": 20,
        "taken": 3,
        "available": 17
    }
    ```

## Edge Cases Handled

* [cite_start]Applying for leave before the employee's joining date. [cite: 30]
* [cite_start]Applying for more days of leave than are available in the balance. [cite: 31]
* [cite_start]Submitting overlapping leave requests for the same employee. [cite: 32]
* [cite_start]Requests for a non-existent employee. [cite: 33]
* [cite_start]Invalid date ranges (end date before start date). [cite: 34]
* Creating a new employee with an email that already exists.

## Additional Edge Cases to Consider

* **Public Holidays & Weekends:** Excluding non-working days from leave duration calculations.
* **Proration:** Prorating leave balances for employees who join mid-year.
* **Leave Types:** Supporting different leave types (e.g., Sick, Casual) with separate balances.
* **Leave Cancellation:** Implementing a workflow for employees to cancel pending or approved leaves.

## Potential Improvements

* **Role-Based Access Control:** Implement different roles (e.g., Employee, HR) with specific permissions.
* **Email Notifications:** Send automated emails for leave application, approval, and rejection.
* **Reporting:** Add endpoints for HR to generate reports on leave data.