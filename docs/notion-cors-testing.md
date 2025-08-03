# Notion Integration CORS Testing Guide

## Overview

This guide helps you test and troubleshoot the Notion integration CORS setup in your Nimbus MVP project.

## ✅ Current CORS Solution

Your project uses a **Netlify Function proxy** to bypass CORS restrictions when calling the Notion API from the browser.

### Architecture:
```
Browser → Netlify Function (/.netlify/functions/notion-proxy) → Notion API
```

## 🚀 Updated Files

### 1. Modern Netlify Function
- **File**: `netlify/functions/notion-proxy.mts` (NEW - TypeScript)
- **Old File**: `netlify/notion-proxy.js` (can be removed)
- **Features**:
  - Modern TypeScript format
  - Proper CORS headers
  - Enhanced error handling
  - Type safety

### 2. Configuration Files
- **File**: `netlify.toml` (NEW)
- **Features**:
  - Function directory configuration
  - Global CORS headers for functions
  - Build configuration

### 3. Dependencies
- **File**: `package.json` (UPDATED)
- **Added**: `@netlify/functions` for TypeScript support

## 🧪 Testing Steps

### Step 1: Deploy Changes
```bash
# Install new dependencies
npm install

# Deploy to Netlify
git add .
git commit -m "Update Notion CORS setup with modern TypeScript function"
git push origin main
```

### Step 2: Test CORS in Browser Console
Open your deployed Nimbus app and test the proxy function:

```javascript
// Test 1: Check if function exists
fetch('/.netlify/functions/notion-proxy', {
  method: 'OPTIONS'
})
.then(response => {
  console.log('OPTIONS response:', response.status);
  console.log('CORS headers:', [...response.headers.entries()]);
});

// Test 2: Test with your Notion token
const testNotionAPI = async () => {
  const response = await fetch('/.netlify/functions/notion-proxy', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      method: 'GET',
      endpoint: '/users/me',
      token: 'YOUR_NOTION_TOKEN_HERE'
    })
  });
  
  const result = await response.json();
  console.log('Notion API test:', result);
};

// Run the test
testNotionAPI();
```

### Step 3: Test Notion Integration UI
1. Go to `/integration` page in your app
2. Enter your Notion integration token
3. Add database URLs
4. Click "Validate Configuration"
5. Check browser developer console for errors

## 🔧 Troubleshooting

### Issue 1: Function Not Found (404)
**Symptoms**: `/.netlify/functions/notion-proxy` returns 404

**Solutions**:
1. Ensure `netlify.toml` is in root directory
2. Check Netlify build logs for function compilation errors
3. Verify `netlify/functions/notion-proxy.mts` exists

### Issue 2: CORS Still Blocked
**Symptoms**: Browser shows CORS error despite proxy

**Solutions**:
1. Check network tab - requests should go to `/.netlify/functions/notion-proxy`
2. Verify `notion-import-service.ts` is using proxy (should log "Making proxy request")
3. Check function logs in Netlify dashboard

### Issue 3: Token Validation Fails
**Symptoms**: "Invalid Notion token" error

**Solutions**:
1. Verify token format: should start with `secret_` or `ntn_`
2. Check token permissions in Notion integration settings
3. Ensure databases are shared with the integration

### Issue 4: Database Access Denied
**Symptoms**: 403 errors when accessing databases

**Solutions**:
1. Share each database with your Notion integration
2. Use correct database URLs (not page URLs)
3. Check integration permissions in Notion

## 📋 Verification Checklist

- [ ] `netlify/functions/notion-proxy.mts` exists
- [ ] `netlify.toml` is configured
- [ ] `@netlify/functions` is in package.json
- [ ] Function deploys without errors
- [ ] OPTIONS request returns proper CORS headers
- [ ] POST request to function works
- [ ] Notion token validation succeeds
- [ ] Database import preview works
- [ ] Full import workflow completes

## 🔍 Debug Console Commands

Add these to your browser console for debugging:

```javascript
// Check current environment
console.log('Environment:', {
  isDevelopment: window.location.hostname === 'localhost',
  proxyUrl: '/.netlify/functions/notion-proxy',
  currentUrl: window.location.href
});

// Test function availability
fetch('/.netlify/functions/notion-proxy', { method: 'OPTIONS' })
  .then(r => console.log('Function available:', r.ok))
  .catch(e => console.error('Function not available:', e));

// Monitor NotionImportService calls
const originalMakeRequest = window.NotionImportService?.prototype?.makeProxyRequest;
if (originalMakeRequest) {
  window.NotionImportService.prototype.makeProxyRequest = function(...args) {
    console.log('Notion proxy call:', args);
    return originalMakeRequest.apply(this, args);
  };
}
```

## 📞 Support

If you encounter issues:

1. **Check Netlify Function Logs**: Netlify Dashboard > Functions > notion-proxy > View logs
2. **Check Browser Network Tab**: Look for failed requests to `/.netlify/functions/notion-proxy`
3. **Check Notion Integration**: Ensure databases are shared and token is valid
4. **Local Testing**: Use `netlify dev` for local development with function emulation

## 🔄 Migration Notes

If you had the old JavaScript version working:

1. **URL stays the same**: `/.netlify/functions/notion-proxy`
2. **API stays the same**: Your service classes don't need updates
3. **Better errors**: New version provides clearer error messages
4. **Type safety**: TypeScript prevents common runtime errors

The new setup maintains backward compatibility while providing modern tooling and better debugging.
