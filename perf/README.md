# Performance Tests — Yum Recipes

Load tests using [autocannon](https://github.com/mcollina/autocannon).

**Requires the app to be running on `http://localhost:80`** (either Docker Compose or K3d).

---

## Run

```bash
# From root
npm run test:perf

# From perf/
npm test
```

---

## What It Tests

| Test | Method | Endpoint |
|---|---|---|
| Recipes API | GET | `/api/recipes` |
| Shopping List API | GET | `/api/shopping-list` |
| Frontend | GET | `/` |

Each test runs for **10 seconds** with **10 concurrent connections**.

---

## Thresholds

Tests fail if:
- Average latency > **500ms**
- Requests/sec < **10**

---

## Latest Results

> Run against K3d cluster (Nginx ingress) on MacBook, 2026-04-30

### Summary

| Test | Req/sec | Avg latency | p99 latency | Result |
|---|---|---|---|---|
| GET /api/recipes | 177 | 55ms | 497ms | PASS |
| GET /api/shopping-list | 214 | 45ms | 309ms | PASS |
| Frontend / (static files) | 958 | 9ms | 90ms | PASS |

Frontend is significantly faster than the API endpoints as it serves static files directly from Nginx without hitting MongoDB.

---

### GET /api/recipes

```
┌─────────┬──────┬───────┬────────┬────────┬──────────┬──────────┬────────┐
│ Stat    │ 2.5% │ 50%   │ 97.5%  │ 99%    │ Avg      │ Stdev    │ Max    │
├─────────┼──────┼───────┼────────┼────────┼──────────┼──────────┼────────┤
│ Latency │ 4 ms │ 19 ms │ 184 ms │ 497 ms │ 55.74 ms │ 86.63 ms │ 977 ms │
└─────────┴──────┴───────┴────────┴────────┴──────────┴──────────┴────────┘
┌───────────┬───────┬───────┬────────┬────────┬────────┬────────┬───────┐
│ Stat      │ 1%    │ 2.5%  │ 50%    │ 97.5%  │ Avg    │ Stdev  │ Min   │
├───────────┼───────┼───────┼────────┼────────┼────────┼────────┼───────┤
│ Req/Sec   │ 45    │ 45    │ 171    │ 251    │ 177.1  │ 62.26  │ 45    │
├───────────┼───────┼───────┼────────┼────────┼────────┼────────┼───────┤
│ Bytes/Sec │ 90 kB │ 90 kB │ 342 kB │ 502 kB │ 354 kB │ 125 kB │ 90 kB │
└───────────┴───────┴───────┴────────┴────────┴────────┴────────┴───────┘
2k requests in 10.02s, 3.54 MB read
```

---

### GET /api/shopping-list

```
┌─────────┬──────┬───────┬────────┬────────┬──────────┬──────────┬────────┐
│ Stat    │ 2.5% │ 50%   │ 97.5%  │ 99%    │ Avg      │ Stdev    │ Max    │
├─────────┼──────┼───────┼────────┼────────┼──────────┼──────────┼────────┤
│ Latency │ 2 ms │ 10 ms │ 201 ms │ 309 ms │ 45.87 ms │ 81.14 ms │ 984 ms │
└─────────┴──────┴───────┴────────┴────────┴──────────┴──────────┴────────┘
┌───────────┬─────────┬─────────┬────────┬────────┬────────┬─────────┬─────────┐
│ Stat      │ 1%      │ 2.5%    │ 50%    │ 97.5%  │ Avg    │ Stdev   │ Min     │
├───────────┼─────────┼─────────┼────────┼────────┼────────┼─────────┼─────────┤
│ Req/Sec   │ 94      │ 94      │ 162    │ 403    │ 214.2  │ 97.18   │ 94      │
├───────────┼─────────┼─────────┼────────┼────────┼────────┼─────────┼─────────┤
│ Bytes/Sec │ 72.7 kB │ 72.7 kB │ 125 kB │ 312 kB │ 166 kB │ 75.1 kB │ 72.7 kB │
└───────────┴─────────┴─────────┴────────┴─────────┴────────┴─────────┴─────────┘
2k requests in 10.01s, 1.66 MB read
```

---

### Frontend / (static files)

```
┌─────────┬──────┬──────┬───────┬───────┬────────┬──────────┬────────┐
│ Stat    │ 2.5% │ 50%  │ 97.5% │ 99%   │ Avg    │ Stdev    │ Max    │
├─────────┼──────┼──────┼───────┼───────┼────────┼──────────┼────────┤
│ Latency │ 0 ms │ 1 ms │ 88 ms │ 90 ms │ 9.9 ms │ 25.19 ms │ 104 ms │
└─────────┴──────┴──────┴───────┴───────┴────────┴──────────┴────────┘
┌───────────┬────────┬────────┬────────┬────────┬────────┬────────┬────────┐
│ Stat      │ 1%     │ 2.5%   │ 50%    │ 97.5%  │ Avg    │ Stdev  │ Min    │
├───────────┼────────┼────────┼────────┼────────┼────────┼────────┼────────┤
│ Req/Sec   │ 748    │ 748    │ 883    │ 1,149  │ 958.7  │ 131.43 │ 748    │
├───────────┼────────┼────────┼────────┼────────┼────────┼────────┼────────┤
│ Bytes/Sec │ 618 kB │ 618 kB │ 730 kB │ 949 kB │ 792 kB │ 109 kB │ 618 kB │
└───────────┴────────┴────────┴────────┴────────┴────────┴────────┴────────┘
10k requests in 10.01s, 7.92 MB read
```
