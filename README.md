BlogApp — Full-Stack Blog Application
A production-ready blog platform with secure authentication, image uploads & full CRUD operations

 Live Demo
ServiceURL Frontend (Vercel)https://blog-app-blond-omega.vercel.app

 Note: Backend is hosted on Render free tier — it may take 30-60 seconds to wake up on first request.


 Table of Contents

Features
Tech Stack
Project Structure
Getting Started
Environment Variables
API Endpoints
Screenshots
What I Learned


 Features

 Secure Authentication — JWT-based login/register with bcrypt password hashing
 Full CRUD — Create, read, update, delete blog posts
 Image Uploads — Cloudinary integration for cover images with auto-optimization
 Search — Real-time post search by title and content
 Tags — Tag-based categorization and filtering
 User Profiles — Personal dashboard showing your posts
 Authorization — Only authors can edit or delete their own posts
 Responsive Design — Works on mobile, tablet, and desktop
 Error Handling — Centralized error middleware with proper HTTP status codes
 Toast Notifications — Real-time feedback on all user actions


 Tech Stack
Frontend
TechnologyPurposeReact 18UI library with hooksReact Router v6Client-side routingAxiosHTTP requests to backend APIReact Context APIGlobal auth state managementReact ToastifyToast notificationsCSS3Custom styling with CSS variables
Backend
TechnologyPurposeNode.jsJavaScript runtimeExpress.jsWeb framework & REST APIMongoDBNoSQL databaseMongooseMongoDB ODM (Object Data Modeling)JWTStateless authentication tokensbcryptjsPassword hashingCloudinaryCloud image storage & optimizationMulterFile upload handlingexpress-validatorRequest validation middlewareCORSCross-Origin Resource Sharing
