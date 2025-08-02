# Twryd Frontend Deployment Guide for WHM Server

## Overview
This guide will help you deploy your Vite React application to a WHM server and resolve common deployment issues.

## Prerequisites
- WHM server with Apache
- mod_rewrite enabled
- .htaccess files allowed
- Node.js and npm installed locally

## Quick Deployment

### Option 1: Using the Deployment Script (Recommended)
```bash
# On Windows
deploy.bat

# On Linux/Mac
chmod +x deploy.sh
./deploy.sh
```

### Option 2: Manual Deployment
```bash
# 1. Install dependencies
npm install

# 2. Build the project
npm run build

# 3. Copy .htaccess to dist folder
cp .htaccess dist/

# 4. Upload dist/ contents to your WHM server
```

## Server Configuration

### 1. Apache Configuration
Ensure your WHM server has the following Apache modules enabled:
- mod_rewrite
- mod_headers
- mod_deflate
- mod_expires

### 2. .htaccess File
The `.htaccess` file in the root directory handles:
- Correct MIME types for JavaScript modules
- Client-side routing for SPA
- Compression and caching
- File type associations

### 3. File Permissions
Set proper file permissions on your server:
```bash
# Files
chmod 644 *.html *.css *.js *.json *.svg

# Directories
chmod 755 */

# .htaccess
chmod 644 .htaccess
```

## Troubleshooting

### Error: "Expected a JavaScript-or-Wasm module script but the server responded with a MIME type of ''"

**Cause**: Server doesn't recognize JavaScript modules with correct MIME type.

**Solution**:
1. Ensure `.htaccess` file is uploaded to your server
2. Verify mod_headers is enabled
3. Check that .htaccess files are allowed in your Apache configuration

### Error: "Failed to load resource: the server responded with a status of 404"

**Cause**: Missing files or incorrect file paths.

**Solution**:
1. Verify all files from `dist/` folder are uploaded
2. Check file paths in `index.html`
3. Ensure the `vite.svg` file exists in the public directory

### Error: "Internal Server Error (500)"

**Cause**: .htaccess syntax error or missing Apache modules.

**Solution**:
1. Check Apache error logs
2. Verify mod_rewrite is enabled
3. Test .htaccess syntax

### Error: "Page not found" on direct URL access

**Cause**: Client-side routing not working.

**Solution**:
1. Ensure .htaccess rewrite rules are working
2. Verify mod_rewrite is enabled
3. Check that the rewrite rules are not being overridden

## File Structure After Deployment

Your server should have this structure:
```
public_html/
├── .htaccess
├── index.html
├── assets/
│   ├── index-[hash].js
│   ├── index-[hash].css
│   └── [other assets]
└── [other static files]
```

## Environment Variables

If your app uses environment variables, create a `.env.production` file:
```env
VITE_API_URL=https://your-api-domain.com
VITE_APP_NAME=Twryd
```

## Performance Optimization

The deployment includes:
- Gzip compression
- Browser caching for static assets
- Code splitting for vendor libraries
- Optimized build output

## Security Considerations

1. **HTTPS**: Always use HTTPS in production
2. **Headers**: Consider adding security headers in .htaccess
3. **CORS**: Configure CORS if needed for API calls
4. **Environment Variables**: Never expose sensitive data in client-side code

## Monitoring

After deployment, monitor:
- Browser console for JavaScript errors
- Network tab for failed requests
- Server error logs
- Application performance

## Support

If you continue to experience issues:
1. Check WHM server error logs
2. Verify all files are uploaded correctly
3. Test with a simple HTML file first
4. Contact your hosting provider for Apache configuration support 