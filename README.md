#  BlogApp — Full-Stack MERN Blog Application

A production-ready full-stack blogging platform built using the MERN stack (MongoDB, Express.js, React.js, Node.js). The application features secure JWT authentication, role-based access control (Admin/User), Cloudinary image uploads, and complete CRUD functionality for blog management.

---

#  Live Demo

### Frontend (Vercel)

https://blog-app-blond-omega.vercel.app

### Backend API (Render)

https://blog-app-backend-zmgk.onrender.com

>  Note: Backend is hosted on Render free tier, so the first request may take 30–60 seconds to wake up.

---

#  Features

##  Authentication & Security

* JWT-based authentication
* User registration & login
* Role-based access control (Admin/User)
* Password hashing using bcryptjs
* Protected API routes
* Helmet security middleware
* MongoDB sanitization middleware

---

##  Blog Management

* Create blog posts
* Read all posts
* Update existing posts
* Delete blog posts
* Admin can manage all posts
* Users can manage their own posts

---

##  Image Uploads

* Cloudinary integration
* Optimized image storage
* Secure media handling
* Cover image upload support

---

##  Search & Tags

* Real-time search functionality
* Search by title or content
* Tag-based categorization and filtering

---

##  User Features

* User profile dashboard
* View personal blog posts
* Secure protected routes
* Authentication persistence using localStorage

---

##  UI & UX

* Fully responsive design
* Mobile-friendly interface
* Toast notifications for user actions
* Clean modern UI design

---

##  Backend Features

* RESTful API architecture
* Centralized error handling
* Request validation middleware
* Secure API communication
* Modular backend structure
* Production-ready deployment

---

#  Tech Stack

## Frontend

| Technology        | Purpose                         |
| ----------------- | ------------------------------- |
| React 18          | UI Library                      |
| React Router v6   | Client-side Routing             |
| Axios             | API Requests                    |
| React Context API | Authentication State Management |
| React Toastify    | Toast Notifications             |
| CSS3              | Custom Styling                  |

---

## Backend

| Technology             | Purpose                    |
| ---------------------- | -------------------------- |
| Node.js                | JavaScript Runtime         |
| Express.js             | Backend Framework          |
| MongoDB Atlas          | Cloud Database             |
| Mongoose               | MongoDB ODM                |
| JWT                    | Authentication Tokens      |
| bcryptjs               | Password Hashing           |
| Cloudinary             | Cloud Image Storage        |
| Multer                 | File Upload Handling       |
| express-validator      | Request Validation         |
| Helmet                 | Security Middleware        |
| express-mongo-sanitize | NoSQL Injection Protection |
| CORS                   | Cross-Origin Requests      |

---
