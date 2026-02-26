/**
 * Performance tests using autocannon
 * Requires the app to be running on http://localhost:80
 *
 * Run: npm test (from perf/) or npm run test:perf (from root)
 *
 * Each test runs for 10 seconds with 10 concurrent connections.
 * Results show: requests/sec, latency (avg/p99), throughput.
 */

const autocannon = require('autocannon');

const BASE_URL = 'http://localhost:80';

const tests = [
  {
    title: 'GET /api/recipes',
    url: `${BASE_URL}/api/recipes`,
    method: 'GET',
  },
  {
    title: 'GET /api/shopping-list',
    url: `${BASE_URL}/api/shopping-list`,
    method: 'GET',
  },
  {
    title: 'Frontend / (static files)',
    url: `${BASE_URL}/`,
    method: 'GET',
  },
];

async function runTest(config) {
  return new Promise((resolve, reject) => {
    const instance = autocannon(
      {
        title: config.title,
        url: config.url,
        method: config.method,
        connections: 10,
        duration: 10,
        headers: { 'Content-Type': 'application/json' },
      },
      (err, result) => {
        if (err) return reject(err);
        resolve(result);
      }
    );
    autocannon.track(instance, { renderProgressBar: true });
  });
}

async function main() {
  console.log('\n=== Yum Recipes — Performance Tests ===\n');
  console.log(`Target: ${BASE_URL}`);
  console.log('Duration: 10s per test | Connections: 10\n');

  const results = [];

  for (const test of tests) {
    console.log(`\n--- ${test.title} ---`);
    const result = await runTest(test);
    results.push({ title: test.title, result });
  }

  console.log('\n=== Summary ===\n');
  console.log(
    'Test'.padEnd(35),
    'Req/sec'.padEnd(12),
    'Avg latency'.padEnd(15),
    'p99 latency'
  );
  console.log('-'.repeat(75));

  let failed = false;
  for (const { title, result } of results) {
    const rps = result.requests.average;
    const avg = result.latency.average;
    const p99 = result.latency.p99;

    // Fail if avg latency > 500ms or req/sec < 10
    const pass = avg < 500 && rps >= 10;
    if (!pass) failed = true;

    console.log(
      title.padEnd(35),
      `${rps}`.padEnd(12),
      `${avg}ms`.padEnd(15),
      `${p99}ms`,
      pass ? '✓' : '✗ FAIL'
    );
  }

  console.log('\n' + '='.repeat(75));

  if (failed) {
    console.error('\nPerformance tests FAILED — avg latency > 500ms or req/sec < 10');
    process.exit(1);
  } else {
    console.log('\nAll performance tests passed.');
  }
}

main().catch((err) => {
  console.error('Error running performance tests:', err.message);
  process.exit(1);
});
