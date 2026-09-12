---
name: GitHub connector sync
description: Constraints for syncing this workspace to GitHub through the Replit connector.
---

GitHub blob uploads through the Replit connector are rate-limited to roughly 10 requests per second per Repl.

**Why:** A parallel upload burst was rejected before the tree and branch commit were created.

**How to apply:** Upload blobs with low concurrency and retry HTTP 429 responses with backoff; create an initial repository file before using the Git database blob API on an empty repository.