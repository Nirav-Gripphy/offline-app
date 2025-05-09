const CACHE_NAME = "next-offline-v1";

// Resources to cache - paths relative to the root of your app
const urlsToCache = [
  "/",
  "/favicon.ico",
  "/next.svg",
  "/vercel.svg",
  "/file.svg",
  "/window.svg",
  "/globe.svg",
  // Other static assets can be added here
];

// Install service worker and cache initial resources
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => {
        console.log("Opened cache");
        // Cache each resource individually to avoid failing the whole batch
        return Promise.allSettled(
          urlsToCache.map((url) =>
            cache.add(url).catch((error) => {
              console.warn(`Failed to cache ${url}:`, error);
              // Continue despite this individual failure
              return Promise.resolve();
            })
          )
        );
      })
      .catch((error) => {
        console.error("Cache installation failed:", error);
      })
  );
});

// Clean up old caches when service worker is activated
self.addEventListener("activate", (event) => {
  console.log("Service worker activated");
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log("Deleting old cache:", cacheName);
            return caches.delete(cacheName);
          }
          return Promise.resolve();
        })
      );
    })
  );
});

// Intercept fetch requests and serve from cache when offline
self.addEventListener("fetch", (event) => {
  // Only handle GET requests
  if (event.request.method !== "GET") return;

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      // Return cached response if found
      if (cachedResponse) {
        return cachedResponse;
      }

      // Clone the request because it's a stream and can only be consumed once
      const fetchRequest = event.request.clone();

      // Try to fetch the resource
      return fetch(fetchRequest)
        .then((response) => {
          // Don't cache if not a valid response
          if (
            !response ||
            response.status !== 200 ||
            response.type !== "basic"
          ) {
            return response;
          }

          // Clone the response because it's a stream and can only be consumed once
          const responseToCache = response.clone();

          // Open cache and store the fetched response
          caches
            .open(CACHE_NAME)
            .then((cache) => {
              cache.put(event.request, responseToCache);
            })
            .catch((error) => {
              console.warn("Failed to cache response:", error);
            });

          return response;
        })
        .catch(() => {
          // If main page fails, show offline page if available
          if (event.request.mode === "navigate") {
            return caches.match("/").catch(() => {
              return new Response(
                "You are offline. Please check your connection.",
                {
                  headers: { "Content-Type": "text/plain" },
                }
              );
            });
          }

          // For other requests, return a simple error response
          return new Response("Network error happened", {
            status: 408,
            headers: { "Content-Type": "text/plain" },
          });
        });
    })
  );
});

// Log installation
self.addEventListener("install", () => {
  console.log("Service worker installed");
});
