# Quick Deploy to Vercel - 3 Steps ⚡

## Step 1: Prepare Frontend (2 minutes)

```bash
# Navigate to frontend
cd frontend

# Install dependencies (if not done)
npm install

# Test build locally
npm run build

# If successful, you're ready!
```

## Step 2: Deploy to Vercel (3 minutes)

### Method A: Fastest (Using GitHub)
1. Go to: https://vercel.com/new
2. Click **"Import Git Repository"**
3. Select your GitHub repo: `sarthaknk08/CoachSaasProject`
4. Choose **"./frontend"** as root directory
5. Click **Deploy**
6. When done, click **Settings → Environment Variables**
7. Add: `REACT_APP_API_URL` = `https://coachsaasproject-kab5.onrender.com/api`
8. Redeploy: Click **Deployments → Redeploy**

### Method B: Using CLI
```bash
# Global install (one time)
npm install -g vercel

# Login to Vercel
vercel login

# Deploy
vercel

# Set environment variable
vercel env add REACT_APP_API_URL
# Enter: https://coachsaasproject-kab5.onrender.com/api

# Redeploy with env var
vercel
```

## Step 3: Test & Verify (2 minutes)

```bash
# Get your Vercel URL from deployment page
# Visit: https://your-app.vercel.app

# Test Login
# Admin: admin@example.com / admin123
# Student: student@example.com / password123

# Check Console (F12) for errors
# Check Network tab - all API calls should work
```

---

## Your URLs

- **Frontend**: https://your-app.vercel.app (you'll get this after deployment)
- **Backend**: https://coachsaasproject-kab5.onrender.com
- **GitHub**: https://github.com/sarthaknk08/CoachSaasProject

---

## Done! 🎉

Your app is now live on Vercel!

Need help? See DEPLOYMENT_GUIDE.md for detailed instructions.
