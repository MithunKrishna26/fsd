# Nutrition App with Authentication

A comprehensive nutrition tracking application with user authentication, profile management, search history, and PostgreSQL database integration.

## Features

- **User Authentication**: Secure login and signup system
- **Profile Management**: Edit personal information and dietary preferences
- **Meal Planning**: Add ingredients and analyze nutritional content
- **Search History**: Track and view previous meal analyses
- **Responsive Design**: Works on desktop and mobile devices
- **PostgreSQL Integration**: Secure data storage for users and their data

## Setup Instructions

### Prerequisites

- Node.js (v14 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

### Installation

1. **Clone or extract the project files**

2. **Install dependencies**
   \`\`\`bash
   npm install
   \`\`\`

3. **Set up PostgreSQL database**
   - Create a new database called `nutrition_app`
   - Run the schema file to create tables:
   \`\`\`bash
   psql -U postgres -d nutrition_app -f database/schema.sql
   \`\`\`

4. **Configure environment variables**
   - Copy `.env.example` to `.env`
   - Update the database credentials and other settings

5. **Start the application**
   \`\`\`bash
   npm start
   \`\`\`
   
   For development with auto-restart:
   \`\`\`bash
   npm run dev
   \`\`\`

6. **Access the application**
   - Open your browser and go to `http://localhost:3000`
   - Create a new account or login with existing credentials

## Project Structure

\`\`\`
nutrition-app-with-auth/
├── database/
│   ├── connection.js      # Database connection configuration
│   └── schema.sql         # Database schema and tables
├── public/
│   ├── css/
│   │   ├── reset.css      # CSS reset styles
│   │   └── style.css      # Main application styles
│   ├── js/
│   │   └── dashboard.js   # Frontend JavaScript functionality
│   ├── dashboard.html     # Main application page
│   ├── login.html         # Login page
│   ├── signup.html        # Registration page
│   ├── profile.html       # User profile management
│   └── search-history.html # Search history page
├── server.js              # Main server file
├── package.json           # Project dependencies
├── .env.example           # Environment variables template
└── README.md             # This file
\`\`\`

## Usage

### Creating an Account
1. Navigate to the signup page
2. Fill in your personal information
3. Create a username and password
4. Click "Sign Up" to create your account

### Logging In
1. Go to the login page
2. Enter your email and password
3. Click "Login" to access your dashboard

### Managing Your Profile
1. Click "Profile" in the navigation menu
2. Update your personal information, dietary preferences, and activity level
3. Click "Update Profile" to save changes

### Analyzing Meals
1. Go to the "Plan Your Meals" section on the dashboard
2. Enter a meal name
3. Add ingredients one by one with their quantities
4. Click "Analyze Meal" to see nutritional breakdown
5. View the pie chart and nutritional summary

### Viewing Search History
1. Click "History" in the navigation menu
2. View all your previous meal analyses
3. Use "Clear All History" to remove all records

## Database Schema

The application uses the following main tables:

- **users**: Store user account information and preferences
- **search_history**: Track user's meal analysis history
- **user_meals**: Store saved meal plans and recipes

## Security Features

- Password hashing using bcrypt
- Session-based authentication
- SQL injection protection with parameterized queries
- XSS protection with input sanitization

## Color Theme

The application maintains a consistent green-based color scheme:
- Main color: #1f4002 (dark green)
- Light accent: rgba(192, 207, 182, 0.2)
- Mid accent: #A8C0A3 (light green)
- Dark accent: rgb(26, 79, 17)
- Background: black with overlays

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.
