var staticCacheName = 'notes-static-v1.1';    // this is the cache version. do not confuse with the app version

var filesToCache = [
  '/',
  '/static/css/style_above_fold.css',
  '/static/css/style.css',
  '/static/css/lib.css',
  '/static/js/lib.js',
  '/static/js/app.min.js',
  '/static/ckeditor/ckeditor/plugins/codesnippet/lib/highlight/styles/obsidian.css',
  '/static/ckeditor/ckeditor/plugins/codesnippet/lib/highlight/highlight.pack.js',
  '/static/fonts/inter-ui/inter-ui.css',
  '/static/fonts/fira-code/fira_code.css',
  '/static/fonts/inter-ui/Inter-UI-Bold.woff2',
  '/static/fonts/inter-ui/Inter-UI-Italic.woff2',
  '/static/fonts/inter-ui/Inter-UI-Regular.woff2',
  '/static/fonts/fira-code/woff2/FiraCode-Regular.woff2',
  '/static/fonts/fira-code/woff2/FiraCode-Bold.woff2',
  '/static/fonts/fontawesome-webfont.woff2?v=4.7.0',
  '/static/images/creampaper.png',
  '/static/images/creampaper_@2X.png',
  '/static/images/debut_dark.png',
  '/static/images/debut_dark_@2X.png',
  '/static/wicons/notes/152x152.png',
  '/static/wicons/notes/iphone-retina.png',
  '/static/wicons/notes/ipad-retina.png',
]

self.addEventListener('install', function (ev) {
  console.log('[ServiceWorker] Install')
  ev.waitUntil(
    caches.open(staticCacheName)
      .then(function (cache) {
        console.log('[ServiceWorker] Caching app shell');
        return cache.addAll(filesToCache)
      }),
  )
});

self.addEventListener('activate', function (ev) {
  console.log('[ServiceWorker] Activate')
  ev.waitUntil(
    caches.keys()
    .then(function (keysList) {
      return Promise.all(
        keysList.map(function (key) {
          if (key !== staticCacheName) {
            console.log('[ServiceWorker] Removing old cache', key)
            return caches.delete(key)
          }
        })
      )
    })
  )

  return self.clients.claim()
})

self.addEventListener('fetch', function (ev) {
  // console.log('[Service Worker] Fetch', ev.request.url)

  var requestUrl = new URL(ev.request.url)
  if (requestUrl.origin === location.origin) {
    if (requestUrl.pathname === '/') {
      ev.respondWith(caches.match('/'))
      return
    }

    if (requestUrl.pathname.match(/^\/static\//)) {
      // check in cache. if not found, network.
      ev.respondWith(
        caches.match(requestUrl.pathname)
          .then((response) => {
            return response || fetch(ev.request)
          })
      )
      return
    }
  }
})
