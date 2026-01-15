# Environment Variables Configuration

## 🔐 Render Backend Environment Variables

Set these in Render Dashboard → Your Service → Environment:

```
MONGO_URI=mongodb+srv://easyXpense:Jagdeep2607@easyxpense.uafnhae.mongodb.net/easyxpense_db?retryWrites=true&w=majority
FLASK_ENV=production
PORT=10000
```

### Variable Details:

**MONGO_URI** (Required)
- Full MongoDB Atlas connection string
- Database name: `easyxpense_db`
- Already includes authentication credentials

**FLASK_ENV** (Required)
- Value: `production`
- Controls logging level and CORS settings

**PORT** (Optional)
- Value: `10000` (or leave default)
- Render automatically sets this

---

## 🌐 Netlify Frontend Environment Variables

Set these in Netlify Dashboard → Site Settings → Environment Variables:

```
REACT_APP_API_URL=https://easyxpense.onrender.com
REACT_APP_NAME=EasyXpense
REACT_APP_VERSION=1.0.0
```

### Variable Details:

**REACT_APP_API_URL** (Required)
- Backend API base URL
- Must NOT have trailing slash
- Value: `https://easyxpense.onrender.com`

**REACT_APP_NAME** (Optional)
- Application name
- Value: `EasyXpense`

**REACT_APP_VERSION** (Optional)
- Application version
- Value: `1.0.0`

---

## 📋 MongoDB Atlas Configuration

### Network Access
- Go to: Network Access → IP Whitelist
- Add: `0.0.0.0/0` (Allow from anywhere)
- Description: "Allow Render access"

### Database Access
- Username: `easyXpense`
- Password: `Jagdeep2607`
- Role: "Read and write to any database"

### Database Name
- Database: `easyxpense_db`
- Collections (auto-created):
  - `friends`
  - `expenses`
  - `settlements`

---

## ✅ Verification

### Test Backend Connection
```bash
curl https://easyxpense.onrender.com/health
```
Expected: `{"status":"healthy","database":"connected"}`

### Test Frontend
Visit: https://easyxpense.netlify.app/test
Expected: All tests show ✅

---

## 🚀 Quick Setup Commands

### Set Render Variables (via CLI)
```bash
render env set MONGO_URI="mongodb+srv://easyXpense:Jagdeep2607@easyxpense.uafnhae.mongodb.net/easyxpense_db?retryWrites=true&w=majority"
render env set FLASK_ENV=production
```

### Set Netlify Variables (via CLI)
```bash
netlify env:set REACT_APP_API_URL https://easyxpense.onrender.com
netlify env:set REACT_APP_NAME EasyXpense
netlify env:set REACT_APP_VERSION 1.0.0
```

---

## 📝 Notes

- All environment variables are already configured in the code
- Backend uses `python-dotenv` to load `.env` file in development
- Frontend uses `process.env.REACT_APP_*` variables
- Production deployments use platform-specific environment variables
- Never commit `.env` files to Git (already in `.gitignore`)
