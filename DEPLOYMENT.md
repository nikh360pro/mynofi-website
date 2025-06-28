# Mynofi Website Deployment Guide

This guide provides step-by-step instructions for deploying the Mynofi website using GitHub and Netlify.

## 🚀 Quick Deployment Setup

### Prerequisites
- GitHub account
- Netlify account
- Node.js (v18+) installed locally

### 1. GitHub Repository Setup
```bash
# If repository doesn't exist yet, create it on GitHub first
# Then connect your local repository:
git remote add origin https://github.com/[YOUR-USERNAME]/mynofi-website.git
git branch -M main
git push -u origin main
```

### 2. Environment Variables Setup
```bash
# Copy the example environment file
npm run env:setup

# Edit .env.local with your Supabase credentials
# Get these from: https://supabase.com/dashboard/project/[project-id]/settings/api
```

### 3. Netlify Deployment

#### Option A: Automatic Deployment (Recommended)
1. Connect your GitHub repository to Netlify:
   - Go to [Netlify Dashboard](https://app.netlify.com)
   - Click "Add new site" → "Import an existing project"
   - Choose GitHub and select your repository
   - Build settings will be auto-detected from `netlify.toml`

#### Option B: Manual Deployment
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Authenticate with Netlify
npm run deploy:auth

# Initialize site
npm run deploy:init

# Deploy preview
npm run deploy:preview

# Deploy to production
npm run deploy:prod
```

## 🔧 Configuration

### Environment Variables in Netlify
Set these in your Netlify dashboard under Site settings → Environment variables:

```
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### GitHub Secrets (for GitHub Actions)
Add these secrets in your GitHub repository settings:

```
NETLIFY_AUTH_TOKEN=your-netlify-auth-token
NETLIFY_SITE_ID=your-netlify-site-id
```

## 🛠️ Available Scripts

### Development
```bash
npm start                    # Serve from root (both root and dist files)
npm run serve:dist          # Serve only from dist/ (production simulation)
npm run test:serve          # Alias for serve:dist
```

### Deployment
```bash
npm run deploy:auth         # Authenticate with Netlify
npm run deploy:init         # Initialize/link Netlify site
npm run deploy:preview      # Deploy preview (draft)
npm run deploy:prod         # Deploy to production
npm run deploy:status       # Check deployment status
npm run deploy:open         # Open live site
```

### Utilities
```bash
npm run env:setup           # Copy .env.example to .env.local
npm run validate:links      # Start Netlify dev server for testing
```

## 🔄 Deployment Workflow

### Automatic Deployment
1. **Push to `main` branch** → Triggers production deployment
2. **Create Pull Request** → Triggers preview deployment
3. **GitHub Actions** validates files and security
4. **Netlify** deploys to respective environment

### Manual Deployment
1. Make changes to your code
2. Test locally: `npm run test:serve`
3. Commit and push: `git push origin main`
4. Or deploy directly: `npm run deploy:prod`

## 🔒 Security Features

### Implemented Security Measures
- ✅ **Sensitive file exclusion** via `.gitignore`
- ✅ **Security headers** in `netlify.toml`
- ✅ **Environment variable template** (`.env.example`)
- ✅ **GitHub Actions security scanning**
- ✅ **No hardcoded credentials** in repository
- ✅ **Content Security Policy** configured

### Security Headers Applied
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Content-Security-Policy` with Supabase allowlist

## 📊 Performance Optimization

### Caching Strategy
- **Static Assets**: 1 year cache (`/assets/*`)
- **API Routes**: 1 hour cache (`/api/*`)
- **Service Worker**: Browser-controlled caching

### Build Optimization
- Files are **pre-built** and optimized
- No build step required during deployment
- Faster deployment times
- Consistent builds across environments

## 🐛 Troubleshooting

### Common Issues

#### 1. 404 Errors on Page Refresh
**Solution**: Ensure `_redirects` file exists in `dist/` with:
```
/* /index.html 200
```

#### 2. Supabase Connection Issues
**Solution**: Verify environment variables:
```bash
npm run deploy:status
# Check environment variables in Netlify dashboard
```

#### 3. Build Failures
**Solution**: Files are pre-built, check `dist/` directory:
```bash
ls -la dist/
# Ensure index.html and assets exist
```

#### 4. GitHub Actions Failures
**Solution**: Check secrets are set correctly:
- `NETLIFY_AUTH_TOKEN`
- `NETLIFY_SITE_ID`

### Getting Help
- Check deployment logs in Netlify dashboard
- Review GitHub Actions logs for CI/CD issues
- Verify environment variables match `.env.example`

## 🔄 Update Process

### For Code Changes
1. Make changes to source files
2. Rebuild if necessary (files are pre-built)
3. Commit and push to GitHub
4. Deployment happens automatically

### For Configuration Changes
1. Update `netlify.toml` for Netlify settings
2. Update `.env.example` for new environment variables
3. Update this documentation for new steps
4. Commit and deploy

## 📚 Additional Resources

- [Netlify Documentation](https://docs.netlify.com/)
- [Supabase Documentation](https://supabase.com/docs)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Vite Build Guide](https://vitejs.dev/guide/build.html)

## 🎯 Best Practices

1. **Always test locally** before deploying
2. **Use preview deployments** for testing changes
3. **Keep environment variables secure**
4. **Monitor deployment logs** for issues
5. **Use semantic commit messages**
6. **Update documentation** when adding features

---

**Need help?** Check the troubleshooting section or review the GitHub Actions logs for detailed error information.