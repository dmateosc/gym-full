
// Simple utility to track API calls for development/debugging
class ApiCallTracker {
  private static calls: Map<string, number> = new Map();

  static track(endpoint: string) {
    const count = this.calls.get(endpoint) || 0;
    this.calls.set(endpoint, count + 1);
    console.log(`🌐 API Call #${count + 1} to: ${endpoint}`);
  }

  static getCallCount(endpoint: string): number {
    return this.calls.get(endpoint) || 0;
  }

  static getAllCalls(): Map<string, number> {
    return new Map(this.calls);
  }

  static reset() {
    this.calls.clear();
    console.log('🧹 API call tracker reset');
  }

  static logSummary() {
    console.log('📊 API Call Summary:');
    if (this.calls.size === 0) {
      console.log('  No API calls tracked');
      return;
    }
    
    for (const [endpoint, count] of this.calls.entries()) {
      console.log(`  ${endpoint}: ${count} calls`);
    }
  }
}

export default ApiCallTracker;
