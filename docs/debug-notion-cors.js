// CORS Testing and Debugging Tool for Notion Integration
// Add this to your browser console to test CORS compatibility

class NotionCORSDebugger {
  constructor() {
    this.proxyUrl = '/.netlify/functions/notion-proxy';
    this.results = [];
  }

  async runAllTests() {
    console.log('🚀 Starting Notion CORS Compatibility Tests...\n');
    
    const tests = [
      { name: 'Function Availability', test: () => this.testFunctionAvailability() },
      { name: 'CORS Headers', test: () => this.testCORSHeaders() },
      { name: 'Function Response Format', test: () => this.testFunctionResponseFormat() },
      { name: 'Notion API Proxy', test: () => this.testNotionAPIProxy() },
      { name: 'Environment Detection', test: () => this.testEnvironmentDetection() },
      { name: 'Browser Compatibility', test: () => this.testBrowserCompatibility() }
    ];

    for (const { name, test } of tests) {
      try {
        console.log(`\n🧪 Testing: ${name}`);
        const result = await test();
        this.results.push({ name, status: 'PASS', details: result });
        console.log(`✅ ${name}: PASSED`);
      } catch (error) {
        this.results.push({ name, status: 'FAIL', details: error.message });
        console.error(`❌ ${name}: FAILED - ${error.message}`);
      }
    }

    this.printSummary();
    return this.results;
  }

  async testFunctionAvailability() {
    const response = await fetch(this.proxyUrl, { method: 'OPTIONS' });
    
    if (!response.ok) {
      throw new Error(`Function not available: ${response.status} ${response.statusText}`);
    }
    
    return {
      status: response.status,
      statusText: response.statusText,
      url: this.proxyUrl
    };
  }

  async testCORSHeaders() {
    const response = await fetch(this.proxyUrl, { method: 'OPTIONS' });
    
    const corsHeaders = {
      'access-control-allow-origin': response.headers.get('access-control-allow-origin'),
      'access-control-allow-methods': response.headers.get('access-control-allow-methods'),
      'access-control-allow-headers': response.headers.get('access-control-allow-headers')
    };

    // Check required CORS headers
    if (!corsHeaders['access-control-allow-origin']) {
      throw new Error('Missing Access-Control-Allow-Origin header');
    }
    
    if (!corsHeaders['access-control-allow-methods']?.includes('POST')) {
      throw new Error('POST method not allowed in CORS headers');
    }
    
    if (!corsHeaders['access-control-allow-headers']?.includes('Content-Type')) {
      throw new Error('Content-Type not allowed in CORS headers');
    }

    return corsHeaders;
  }

  async testFunctionResponseFormat() {
    const testPayload = {
      method: 'GET',
      endpoint: '/invalid-test-endpoint',
      token: 'test-token'
    };

    const response = await fetch(this.proxyUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testPayload)
    });

    if (!response.ok) {
      throw new Error(`Function request failed: ${response.status}`);
    }

    const result = await response.json();
    
    // Check response format
    if (typeof result.success !== 'boolean') {
      throw new Error('Response missing success field');
    }
    
    if (typeof result.status !== 'number') {
      throw new Error('Response missing status field');
    }
    
    if (!result.data) {
      throw new Error('Response missing data field');
    }

    return {
      hasCorrectFormat: true,
      responseKeys: Object.keys(result),
      statusReturned: result.status
    };
  }

  async testNotionAPIProxy() {
    // Test with invalid token to check proxy behavior
    const testPayload = {
      method: 'GET',
      endpoint: '/users/me',
      token: 'invalid_token_test'
    };

    const response = await fetch(this.proxyUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testPayload)
    });

    const result = await response.json();
    
    // Should get a 401 response from Notion API
    if (result.success === true) {
      throw new Error('Expected authentication failure with invalid token');
    }
    
    if (result.status !== 401) {
      throw new Error(`Expected 401 status, got ${result.status}`);
    }

    return {
      proxyWorking: true,
      notionAPIReachable: true,
      authErrorHandled: result.status === 401
    };
  }

  testEnvironmentDetection() {
    const isClient = typeof window !== 'undefined';
    const isServer = typeof window === 'undefined';
    
    if (!isClient) {
      throw new Error('Should be running in browser environment');
    }

    return {
      environment: 'browser',
      windowAvailable: !!window,
      fetchAvailable: !!fetch,
      locationHost: window.location.host,
      userAgent: navigator.userAgent.substring(0, 50) + '...'
    };
  }

  testBrowserCompatibility() {
    const features = {
      fetch: !!window.fetch,
      promises: !!window.Promise,
      json: !!window.JSON,
      headers: !!window.Headers,
      cors: true // Modern browsers all support CORS
    };

    const missing = Object.keys(features).filter(key => !features[key]);
    
    if (missing.length > 0) {
      throw new Error(`Missing browser features: ${missing.join(', ')}`);
    }

    return features;
  }

  printSummary() {
    console.log('\n📊 CORS Test Summary:');
    console.log('='.repeat(50));
    
    const passed = this.results.filter(r => r.status === 'PASS').length;
    const failed = this.results.filter(r => r.status === 'FAIL').length;
    
    console.log(`✅ Passed: ${passed}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`📋 Total:  ${this.results.length}`);
    
    if (failed > 0) {
      console.log('\n🔍 Failed Tests:');
      this.results
        .filter(r => r.status === 'FAIL')
        .forEach(r => console.log(`   - ${r.name}: ${r.details}`));
    }
    
    if (failed === 0) {
      console.log('\n🎉 All tests passed! Notion CORS integration should work.');
    } else {
      console.log('\n⚠️  Some tests failed. Check the issues above.');
    }
  }
}

// Integration service specific tests
class NotionServiceDebugger {
  constructor(token = null) {
    this.token = token;
  }

  async testServiceIntegration() {
    console.log('\n🔧 Testing NotionImportService Integration...');
    
    if (!this.token) {
      console.log('⚠️ No token provided. Testing service without token...');
    }

    try {
      // Test service instantiation
      const service = new window.NotionImportService?.(this.token || 'test-token');
      
      if (!service) {
        throw new Error('NotionImportService not available in window object');
      }

      console.log('✅ Service instantiation: SUCCESS');
      
      // Test proxy detection
      const useProxy = typeof window !== 'undefined';
      console.log(`✅ Proxy detection: ${useProxy ? 'ENABLED' : 'DISABLED'}`);
      
      // Test token validation (if token provided)
      if (this.token && this.token !== 'test-token') {
        try {
          const isValid = await service.validateToken();
          console.log(`✅ Token validation: ${isValid ? 'VALID' : 'INVALID'}`);
        } catch (error) {
          console.log(`⚠️ Token validation error: ${error.message}`);
        }
      }
      
      return true;
    } catch (error) {
      console.error(`❌ Service integration error: ${error.message}`);
      return false;
    }
  }
}

// Manual test functions
window.testNotionCORS = async () => {
  const debugger = new NotionCORSDebugger();
  return await debugger.runAllTests();
};

window.testNotionService = async (token = null) => {
  const debugger = new NotionServiceDebugger(token);
  return await debugger.testServiceIntegration();
};

console.log('🔧 Notion CORS Debug Tools Loaded!');
console.log('📝 Usage:');
console.log('   testNotionCORS() - Test CORS configuration');
console.log('   testNotionService("your_token") - Test service integration');
console.log('   testNotionService() - Test service without token');
