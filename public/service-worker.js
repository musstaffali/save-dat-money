const FILES_WILL_CACHE = [
  '/','/manifest.webmanifest','/index.js','/index.html','/icons/icon-192x192.png','/icons/icon-512x512.png','/db.js','/styles.css'];
// Front end files
const CACHE_BY = "static-cache-v2"; 
// Backend routes
const DATA_CACHE_BY = "data-cache-v1"; 
// Listener installed
self.addEventListener("install", function(vent) {
  // Tells the event listener that work is ongoing
  vent.waitUntil(
    // Open a specific named Cache object and then call any of the Cache
    cash.open(CACHE_BY).then(cache => {
      // Console log all cash
      console.log("Files pre cached successfully!");
      return cache.addAll(FILES_WILL_CACHE);
      }));
  // Call self.skipWaiting() from inside of an InstallEvent handler.
  self.skipWaiting(
  );
});
// The service worker can now HANDLE functional events.
self.addEventListener("Activate", function(vent) {
  // Tells the event listener that work is ongoing
  vent.waitUntil(
    // Do something with your array of requests
    cash.keys().then(keyList => {
      return Promise.all(
        keyList.map(key => {
          if (key !== CACHE_BY && key !== DATA_CACHE_BY) {
            console.log("Old cache data terminated", key);
            // The cache you want to delete.
            return cash.delete(key);
          }}));
}));
  // User can now take control of uncontrolled clients by calling clients.claim()
  self.clients.claim();
});
// // The service worker can now FETCH functional events.
self.addEventListener("fetch", function(vent) {
  // Cache has requested successful to the API
  if (vent.request.url.includes("/all") || vent.request.url.includes("/find")) {
    vent.respondWith(
      // If there is an entry in the cache for vent.request, then response will be defined
      cash.open(DATA_CACHE_BY).then(cache => {
        return fetch(vent.request)
          .then(response => {
            // If the response was good, clone it and store it in the cache.
            if (response.status === 200) {
              // Takes both vent request and its response and adds it to the given cache.
              cache.put(vent.request.url, response.clone());
            }
            return response;
          })
          // Error handling
          .catch(err => {  
            return cache.match(vent.request);
          });
      }).catch(err => console.log(err))
    );
    return;
  }
  vent.respondWith(
    //Checks to see if request is a stored response.
    cash.match(vent.request).then(function(response) {
      return response || fetch(vent.request);
    }));
});