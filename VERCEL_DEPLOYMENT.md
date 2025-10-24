# Vercel Deployment Configuration

## Environment Variables Required

Your application can run in two modes:

### Option 1: Skip Mode (No Database - Recommended for Demo)

Add this environment variable in Vercel:

```
NEXT_PUBLIC_SKIP_AUTH=true
```

**Steps:**
1. Go to your Vercel project dashboard
2. Click on **Settings** → **Environment Variables**
3. Add new variable:
   - Name: `NEXT_PUBLIC_SKIP_AUTH`
   - Value: `true`
   - Environments: Production, Preview, Development (check all)
4. Click **Save**
5. Redeploy your application

With this configuration:
- ✅ No database required
- ✅ Login bypass enabled
- ✅ Demo data automatically loaded
- ✅ Fully functional UI for demonstration

### Option 2: Full Mode (With Supabase Database)

Add these environment variables in Vercel:

```
NEXT_PUBLIC_SUPABASE_URL=your-project-url.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

**Steps:**
1. Get credentials from Supabase Dashboard: https://supabase.com/dashboard/project/_/settings/api
2. Go to Vercel project → **Settings** → **Environment Variables**
3. Add both variables
4. Redeploy

## Current Build Error

The build is failing because:
- Supabase credentials are not configured in Vercel
- Skip mode environment variable is missing

**Quick Fix:**
Add `NEXT_PUBLIC_SKIP_AUTH=true` to Vercel environment variables and redeploy.

## How to Add Environment Variables in Vercel

### Via Dashboard:
1. Open https://vercel.com/dashboard
2. Select your project
3. Go to **Settings** tab
4. Click **Environment Variables** in left sidebar
5. Click **Add New**
6. Enter variable name and value
7. Select which environments (Production/Preview/Development)
8. Click **Save**
9. Go to **Deployments** and click **Redeploy** on the latest deployment

### Via Vercel CLI:
```bash
# Set environment variable
vercel env add NEXT_PUBLIC_SKIP_AUTH

# When prompted, enter: true
# Select: Production, Preview, Development

# Redeploy
vercel --prod
```

## Verification

After setting the environment variable and redeploying:

1. Build should complete successfully
2. No Supabase connection errors
3. Application loads with skip mode active
4. You can access via `/emergency` or `/login` with skip buttons

## Notes

- Environment variables starting with `NEXT_PUBLIC_` are exposed to the browser
- Changes to environment variables require a **redeploy** to take effect
- You can verify environment variables in the deployment logs
