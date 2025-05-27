# Deploying to Render

This guide will help you deploy the Nutrition App to Render.

## Prerequisites

1. A GitHub account
2. A Render account (free tier available)
3. Your code pushed to a GitHub repository

## Deployment Steps

### Option 1: Using Render Dashboard (Recommended)

1. **Push your code to GitHub**
   - Create a new repository on GitHub
   - Push all the project files to your repository

2. **Create a PostgreSQL Database on Render**
   - Go to [Render Dashboard](https://dashboard.render.com)
   - Click "New +" and select "PostgreSQL"
   - Choose a name like "nutrition-app-db"
   - Select the Free plan
   - Click "Create Database"
   - Note down the connection details

3. **Deploy the Web Service**
   - Click "New +" and select "Web Service"
   - Connect your GitHub repository
   - Configure the service:
     - **Name**: nutrition-app
     - **Environment**: Node
     - **Build Command**: `npm install`
     - **Start Command**: `npm start`
   - Add Environment Variables:
     - `NODE_ENV`: `production`
     - `DATABASE_URL`: (Copy from your PostgreSQL database's "External Database URL")
     - `SESSION_SECRET`: (Generate a random string, e.g., use a password generator)

4. **Deploy**
   - Click "Create Web Service"
   - Render will automatically build and deploy your app
   - The database tables will be created automatically on first run

### Option 2: Using render.yaml (Infrastructure as Code)

1. **Push the render.yaml file** (included in the project) to your repository root

2. **Connect to Render**
   - Go to Render Dashboard
   - Click "New +" and select "Blueprint"
   - Connect your GitHub repository
   - Render will automatically detect the render.yaml file and create both the database and web service

## Environment Variables

The following environment variables will be automatically configured:

- `NODE_ENV`: Set to "production"
- `DATABASE_URL`: Automatically provided by Render PostgreSQL
- `SESSION_SECRET`: Automatically generated secure key
- `PORT`: Automatically set by Render

## Post-Deployment

1. **Access your app**: Your app will be available at `https://your-app-name.onrender.com`

2. **Test the functionality**:
   - Create a new account
   - Login and test all features
   - Verify database connectivity

## Important Notes

- **Free Tier Limitations**: 
  - The free tier spins down after 15 minutes of inactivity
  - Database has a 1GB limit
  - 750 hours per month of runtime

- **Custom Domain**: You can add a custom domain in the Render dashboard

- **SSL**: HTTPS is automatically enabled

- **Logs**: View application logs in the Render dashboard

## Troubleshooting

1. **Database Connection Issues**:
   - Verify the DATABASE_URL environment variable
   - Check the database logs in Render dashboard

2. **App Won't Start**:
   - Check the build and deploy logs
   - Ensure all dependencies are in package.json

3. **Session Issues**:
   - Verify SESSION_SECRET is set
   - Check that cookies are working with HTTPS

## Monitoring

- Use Render's built-in monitoring
- Check logs regularly for any errors
- Monitor database usage to stay within free tier limits

## Scaling

To upgrade from free tier:
- Go to your service settings
- Change the plan to a paid tier
- This will provide:
  - No spin-down
  - More resources
  - Better performance
