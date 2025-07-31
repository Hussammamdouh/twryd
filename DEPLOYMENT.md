# Vercel Deployment Guide for Twryd Frontend

This guide will help you deploy the Twryd frontend application to Vercel.

## Prerequisites

- A Vercel account (free tier available)
- Git repository with your code
- Node.js 18+ installed locally (for testing)

## Step 1: Prepare Your Project

### 1.1 Environment Variables

Create a `.env` file in your project root with the following variables:

```env
# API Configuration
VITE_API_BASE_URL=https://back.twryd.com

# Optional: Development overrides
VITE_DEV_MODE=true
VITE_ENABLE_DEBUG_LOGS=false
```

### 1.2 Verify Configuration Files

Ensure you have the following files in your project root:

- `vercel.json` - Vercel configuration
- `vite.config.mjs` - Vite configuration
- `package.json` - Dependencies and scripts

## Step 2: Deploy to Vercel

### Option A: Deploy via Vercel Dashboard (Recommended)

1. **Push your code to GitHub/GitLab/Bitbucket**
   ```bash
   git add .
   git commit -m "Prepare for Vercel deployment"
   git push origin main
   ```

2. **Connect to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Sign in with your GitHub/GitLab/Bitbucket account
   - Click "New Project"
   - Import your repository

3. **Configure Project Settings**
   - **Framework Preset**: Vite
   - **Root Directory**: `./` (or your frontend directory if different)
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

4. **Environment Variables**
   Add the following environment variables in Vercel:
   - `VITE_API_BASE_URL`: `https://back.twryd.com`
   - `VITE_DEV_MODE`: `false` (for production)
   - `VITE_ENABLE_DEBUG_LOGS`: `false` (for production)

5. **Deploy**
   - Click "Deploy"
   - Wait for the build to complete
   - Your app will be available at the provided URL

### Option B: Deploy via Vercel CLI

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Deploy**
   ```bash
   vercel
   ```

4. **Follow the prompts**
   - Link to existing project or create new
   - Confirm settings
   - Deploy

## Step 3: Post-Deployment Configuration

### 3.1 Custom Domain (Optional)

1. Go to your project dashboard in Vercel
2. Navigate to "Settings" → "Domains"
3. Add your custom domain
4. Configure DNS records as instructed

### 3.2 Environment Variables for Production

In your Vercel project settings, ensure these environment variables are set:

```env
VITE_API_BASE_URL=https://back.twryd.com
VITE_DEV_MODE=false
VITE_ENABLE_DEBUG_LOGS=false
```

### 3.3 Automatic Deployments

Vercel will automatically deploy when you push to your main branch. You can configure:
- Preview deployments for pull requests
- Branch-specific deployments
- Manual deployments

## Step 4: Verify Deployment

### 4.1 Check Build Logs

- Go to your Vercel dashboard
- Check the latest deployment
- Verify build completed successfully

### 4.2 Test Your Application

1. **Homepage**: Should load without errors
2. **Authentication**: Login/logout functionality
3. **API Integration**: Verify API calls work
4. **Responsive Design**: Test on mobile/desktop

### 4.3 Common Issues and Solutions

#### Build Failures
- Check build logs in Vercel dashboard
- Verify all dependencies are in `package.json`
- Ensure Node.js version compatibility

#### API Errors
- Verify `VITE_API_BASE_URL` is correct
- Check CORS configuration on backend
- Ensure API endpoints are accessible

#### Routing Issues
- Verify `vercel.json` configuration
- Check that all routes are properly handled

## Step 5: Monitoring and Maintenance

### 5.1 Analytics

Enable Vercel Analytics to monitor:
- Page views
- Performance metrics
- User behavior

### 5.2 Performance Optimization

- Enable Vercel Edge Functions if needed
- Configure caching strategies
- Optimize images and assets

### 5.3 Updates

To update your deployment:
1. Make changes to your code
2. Push to your main branch
3. Vercel will automatically redeploy

## Configuration Files

### vercel.json
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

### vite.config.mjs
```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
})
```

## Support

If you encounter issues:

1. Check Vercel documentation: [vercel.com/docs](https://vercel.com/docs)
2. Review build logs in Vercel dashboard
3. Test locally with `npm run build`
4. Check environment variables configuration

## Security Considerations

- Never commit `.env` files to version control
- Use environment variables for sensitive data
- Enable HTTPS (automatic with Vercel)
- Regularly update dependencies

---

Your Twryd frontend is now ready for production deployment on Vercel! 🚀 