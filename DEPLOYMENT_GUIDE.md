# 🚀 Deployment Guide - Coaching Management System

## Current Status

✅ **Backend Deployed** on Render
- URL: https://coachsaasproject-kab5.onrender.com
- GitHub: Published

✅ **Frontend Ready** for Vercel deployment
- GitHub: Published
- Environment: Configured

---

## Step 1: Deploy Frontend on Vercel

### Option A: Using Vercel CLI (Recommended)

#### 1. Install Vercel CLI
```bash
npm install -g vercel
```

#### 2. Navigate to Frontend Directory
```bash
cd frontend
```

#### 3. Login to Vercel
```bash
vercel login
```
- Opens browser to authenticate with GitHub/GitLab/Bitbucket

#### 4. Deploy
```bash
vercel
```
- Follow prompts:
  - Framework: **React**
  - Project name: coaching-app (or your choice)
  - Root directory: `.`
  - Build command: `npm run build`
  - Output directory: `build`

#### 5. Set Environment Variables
```bash
vercel env add REACT_APP_API_URL
```
Enter: `https://coachsaasproject-kab5.onrender.com/api`

Then deploy again:
```bash
vercel
```

---

### Option B: Using Vercel Web Dashboard

#### 1. Go to Vercel Dashboard
- Visit: https://vercel.com/dashboard

#### 2. Click "Add New Project"
- Select **Import Git Repository**
- Choose your GitHub repo: `sarthaknk08/CoachSaasProject`
- Click **Import**

#### 3. Configure Project Settings
- **Project Name**: coaching-app-frontend
- **Framework Preset**: React
- **Root Directory**: ./frontend
- **Build Command**: `npm run build`
- **Output Directory**: build
- **Install Command**: `npm install`

#### 4. Add Environment Variables
In **Settings → Environment Variables**, add:
```
REACT_APP_API_URL=https://coachsaasproject-kab5.onrender.com/api
```

Select environments:
- ✅ Production
- ✅ Preview
- ✅ Development

#### 5. Deploy
- Click **Deploy**
- Wait for build to complete (~2-3 minutes)
- Get your Vercel URL (e.g., `https://coaching-app-frontend.vercel.app`)

---

## Step 2: Test the Deployment

### 1. Open Frontend in Browser
```
https://your-vercel-url.vercel.app
```

### 2. Test Admin Login
- Email: `admin@example.com`
- Password: `admin123`
- Expected: Redirects to `/admin` dashboard

### 3. Test Student Login
- Email: `student@example.com` (if exists)
- Password: `password123`
- Expected: Redirects to `/student` dashboard

### 4. Verify API Calls
- Open DevTools (F12)
- Check **Console** tab for no errors
- Check **Network** tab - all API calls should return status `200` or `201`

---

## Step 3: Update Backend Environment Variables

### Important: CORS Configuration

Make sure your backend has CORS configured to accept requests from Vercel:

**backend/server.js** should have:
```javascript
const cors = require('cors');

const allowedOrigins = [
  'http://localhost:3000',
  'https://your-vercel-url.vercel.app',
  'https://coaching-app-frontend.vercel.app',
  // Add your custom domain here when you get one
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));
```

---

## Step 4: Custom Domain Setup (Optional)

### Add Custom Domain to Vercel

#### 1. In Vercel Dashboard
- Go to **Settings → Domains**
- Click **Add Domain**
- Enter your domain (e.g., `coaching.yourdomain.com`)

#### 2. Configure DNS
- Copy DNS records from Vercel
- Go to your domain provider (GoDaddy, Namecheap, etc.)
- Add/Update DNS records
- Wait 24-48 hours for propagation

#### 3. Update Backend CORS
Add your custom domain to the CORS allowed origins

---

## Step 5: Monitor Deployment

### 1. View Logs
```bash
vercel logs
```

### 2. Monitor Backend
- Visit: https://dashboard.render.com
- Select your backend service
- Check **Logs** for errors

### 3. Set Up Alerts (Optional)
- Vercel: https://vercel.com/docs/integrations
- Render: https://render.com/docs/alerts

---

## Troubleshooting

### Issue: API calls failing (404/500 errors)

**Solution**: 
1. Verify backend URL in environment variables:
   ```bash
   vercel env list
   ```
2. Check CORS configuration on backend
3. Verify backend is running on Render:
   ```
   https://coachsaasproject-kab5.onrender.com/
   ```

### Issue: Build fails on Vercel

**Solution**:
1. Check build logs in Vercel dashboard
2. Verify `npm run build` works locally:
   ```bash
   cd frontend
   npm run build
   ```
3. Check for missing dependencies in package.json

### Issue: Styling/Assets not loading

**Solution**:
1. Verify public directory structure
2. Check for absolute paths (use relative paths)
3. Verify Tailwind CSS is properly built
4. Check vercel.json configuration

---

## Production Checklist

- [ ] Frontend deployed on Vercel
- [ ] Backend running on Render
- [ ] Environment variables set on Vercel
- [ ] CORS configured on backend
- [ ] Login functionality tested
- [ ] All API endpoints responding
- [ ] No console errors in production
- [ ] Mobile responsive design verified
- [ ] Performance optimized (check Lighthouse)
- [ ] Custom domain configured (optional)

---

## File Structure for Deployment

```
CoachSaasProject/
├── frontend/
│   ├── .env.example          ← Copy to .env.local
│   ├── .gitignore
│   ├── vercel.json           ← Optional config
│   ├── package.json
│   ├── public/
│   └── src/
├── backend/
│   ├── .env                  ← Already set on Render
│   ├── .gitignore
│   ├── server.js
│   ├── package.json
│   └── ...
└── README.md
```

---

## Environment Variables Summary

### Frontend (Vercel)
```
REACT_APP_API_URL=https://coachsaasproject-kab5.onrender.com/api
```

### Backend (Render - Already Set)
```
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
PORT=5000
NODE_ENV=production
```

---

## Next Steps After Deployment

1. **Monitor Performance**
   - Check Vercel Analytics dashboard
   - Monitor Render backend logs
   - Set up error tracking (Sentry, LogRocket)

2. **Add Features**
   - Email notifications (SendGrid, Mailgun)
   - SMS alerts (Twilio)
   - Analytics (Google Analytics, Mixpanel)

3. **Security Improvements**
   - Enable 2FA for GitHub
   - Set up automated backups
   - Configure rate limiting
   - Add request validation

4. **Optimization**
   - Image optimization (next/image)
   - Code splitting
   - Bundle analysis
   - Database indexing

---

## Support & Resources

- **Vercel Docs**: https://vercel.com/docs
- **Render Docs**: https://render.com/docs
- **React Deployment**: https://create-react-app.dev/deployment/
- **MongoDB Atlas**: https://www.mongodb.com/docs/

---

## Quick Commands Reference

```bash
# Deploy frontend
vercel

# Check deployment status
vercel --list

# View logs
vercel logs

# Set environment variable
vercel env add REACT_APP_API_URL

# Rollback to previous deployment
vercel rollback

# Check backend
curl https://coachsaasproject-kab5.onrender.com/

# Test student login endpoint
curl -X POST https://coachsaasproject-kab5.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"student@example.com","password":"password123"}'
```

---

**Your application is now ready for production!** 🎉

*Last Updated: January 14, 2026*
