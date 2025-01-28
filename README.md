# Micro Task and Earning Platform - Backend  

## Live Site URL:
[Live Site URL](https://micro-earning-platform-server.vercel.app)

## Features:
1. **Role-Based Authorization:**  
   - Middleware for Worker, Buyer, and Admin roles ensures secure access.  
   - Unauthorized users are redirected with appropriate status codes (401, 400, or 403).  

2. **Secure Authentication:**  
   - Passwords are securely hashed using bcrypt.  
   - JWT-based authentication with tokens stored in local storage for secure sessions.  

3. **Dynamic Notifications System:**  
   - Notifications for task approvals, rejections, and withdrawal requests.  
   - Includes message details, actions, and timestamps stored in the database.

4. **User Management:**  
   - Registration with role assignment (Worker/Buyer) and default coin allocation.  
   - Admin can update user roles or remove users from the database.  

5. **Task Management:**  
   - Buyers can create, update, and delete tasks with full validation.  
   - Workers can submit tasks with proof, and submissions are tracked by status (pending/approved/rejected).  

6. **Payment System:**  
   - Stripe-based coin purchasing for Buyers.  
   - Withdrawal requests processed at a 20-coin-per-dollar rate for Workers.  

7. **Database Design:**  
   - MongoDB collections for users, tasks, submissions, notifications, and withdrawals.  
   - Efficient querying using MongoDB’s aggregation framework for data-intensive routes.  

8. **Image Upload Integration:**  
   - Image uploads for tasks and user profiles managed via ImgBB API.  

9. **Pagination and Filtering:**  
   - Backend routes support pagination for submissions and filtering tasks by status, deadlines, and other parameters.  

10. **Environment Variable Security:**  
    - Firebase configuration keys, MongoDB connection strings, and Stripe keys are securely stored using `.env` files.
