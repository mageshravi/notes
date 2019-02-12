var staticCacheName = 'notes-static-v1.3.1';    // this is the cache version. do not confuse with the app version

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

var filesToRefresh = [
  '/static/js/app.min.js',
]

self.addEventListener('install', function (ev) {
  console.log('[ServiceWorker] Install')
  ev.waitUntil(
    caches.open(staticCacheName).then(function (cache) {
      console.log('[ServiceWorker] Caching app shell');
      return cache.addAll(filesToCache)
    })
  )
});

self.addEventListener('activate', function (ev) {
  console.log('[ServiceWorker] Activate')
  ev.waitUntil(
    caches.keys().then(function (keysList) {
      return Promise.all(
        keysList.map(function (key) {
          if (key !== staticCacheName) {
            console.log('[ServiceWorker] Removing old cache', key)
            return caches.delete(key)
          }
        })
      )
    }),

    // process the files-to-refresh list
    caches.open(staticCacheName).then(cache => {
      // delete from cache
      return Promise.all(
        filesToRefresh.map(async function (key) {
          var isDeleted = await cache.delete(key)
          var isAdded = true

          try {
            // make sure to include the nocache param with <static-cache-version> as value.
            // this ensures fetching from network instead of cache
            var response = await fetch(key + '?nocache=' + staticCacheName)
            cache.put(key, response)
          } catch (error) {
            isAdded = false
          }

          console.log('[ServiceWorker] filesToRefresh', key, '=> deleted:', isDeleted, 'added:', isAdded)

          return new Promise((resolve, reject) => {
            if (isDeleted && isAdded) {
              // let clients know to refresh page
              sendMessageToAllClients({action: 'page:reload'})
              resolve(true)
            } else {
              reject('deleted: ' + isDeleted + ', added: ' + isAdded)
            }
          })
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

    // "nocache" condition
    // requests with ?nocache=static-cache-version param
    var nocacheRegex = new RegExp('\\?nocache=' + staticCacheName)
    if (nocacheRegex.test(requestUrl.pathname)) {
      // network, falling back to cache
      ev.respondWith(async function () {
        try {
          var networkResponse = await fetch(ev.request)
          return networkResponse
        } catch (error) {
          console.log('[ServiceWorker] fetch failed: ', reason)
          var cacheResponse = await caches.match(requestUrl.pathname)
          return cacheResponse
        }
      }())

      return
    }

    // static files
    if (requestUrl.pathname.match(/^\/static\//)) {
      // cache, falling back to network.
      ev.respondWith(async function () {
        const staticCache = await caches.open(staticCacheName)
        const response = await staticCache.match(requestUrl.pathname)
        return response || fetch(ev.request)
      }())
    }
  }
})

/**
 * Posts message to a specific client
 * @param {Window} client The client to send message to
 * @param {Object} msg The message
 */
function sendMessageToClient(client, msg) {
  return new Promise((resolve, reject) => {
    let msgChannel = new MessageChannel()

    msgChannel.port1.onmessage = (ev) => {
      if (ev.data.error) {
        reject(ev.data.error)
      } else {
        resolve(ev.data)
      }
    }

    client.postMessage(msg, [msgChannel.port2])
  })
}

/**
 * Posts message to all clients
 * @param {Object} msg The message
 */
function sendMessageToAllClients(msg) {
  clients.matchAll().then(clients => {
    clients.forEach(client => {
      sendMessageToClient(client, msg).then(msg => {
        console.log('[ServiceWorker] Client received message:', msg)
      })
    })
  })
}

// handle messages sent from clients
self.addEventListener('message', event => {
  switch (event.data.action) {
    case 'skipWaiting':
      self.skipWaiting()

      // let clients know to refresh page
      sendMessageToAllClients({action: 'page:reload'})
      break

    case 'push-subscription:success':
      self.registration.showNotification(
        'You are awesome',
        {
          body: 'Push notifications have been enabled on this device',
          icon: '/static/wicons/notes/128x128.png'
        }
      )
      break

    case 'note:created:sync-complete':
      self.registration.showNotification(
        event.data.notification.title,
        event.data.notification.options
      )
      break
  }
})

/**
 * Gets the first non-admin client from the connected clients list
 */
function getFirstNonAdminClient() {
  return clients.matchAll()
    .then(clientsList => {
      let promise = new Promise((resolve, reject) => {
        if (clientsList.length <= 0) {
          reject('no clients found')
        }

        // get client that is not associated with admin panel i.e., /admin/
        const adminUrlPattern = /\/admin\//
        let nonAdminClient
        for (let i = 0; i < clientsList.length; i++) {
          let curClient = clientsList[i]
          if (!adminUrlPattern.test(nonAdminClient)) {
            nonAdminClient = curClient
          }
        }

        if (nonAdminClient) {
          resolve(nonAdminClient)
        } else {
          reject('no non-admin clients found')
        }
      })
      return promise
    })
}

// handle messages sent from server
self.addEventListener('push', (event) => {
  const eventInfo = event.data.text()
  const data = JSON.parse(eventInfo)

  console.log('[ServiceWorker] Push message received: ', data)

  const title = data.head || 'New notification'
  const body = data.body || 'This is default content. Your notification didn\'t have one'
  const icon = data.icon || '/static/wicons/notes/128x128.png'

  let notificationData = {
    title: title,
    options: {
      body: body,
      icon: icon,
      data: {
        ...(data.url && {url: data.url})
      }
    }
  }

  // display notification
  event.waitUntil(
    self.registration.showNotification(
      notificationData.title,
      notificationData.options
    )
  )

  switch (data.type) {
    case 'note:created':
    case 'note:updated':
    case 'note:deleted':
      // fall-through intentional
      if (!'noteData' in data) {
        return
      }

      // we do not want multiple clients to start syncing data
      // send message to first client only. If no tabs/windows are open, then message is not sent.
      getFirstNonAdminClient()
        .then(nonAdminClient => {
          sendMessageToClient(
            nonAdminClient,
            {
              action: data.type,
              noteData: data.noteData
            }
          )
          .then(msg => {
            console.log('[ServiceWorker] Message sent to client: ', msg)
          })
          .catch(err => {
            console.log('[ServiceWorker] Error sending message to client', err)
          })
        })
      break

    case 'folder:created':
    case 'folder:updated':
    case 'folder:deleted':
      // fall-through intentional
      if (!'folderData' in data) {
        return
      }

      // we do not want multiple clients to start syncing data
      // send message to first client only. If no tabs/windows are open, then message is not sent.
      getFirstNonAdminClient()
        .then(nonAdminClient => {
          sendMessageToClient(
            nonAdminClient,
            {
              action: data.type,
              folderData: data.folderData
            }
          )
          .then(msg => {
            console.log('[ServiceWorker] Message sent to client: ', msg)
          })
          .catch(err => {
            console.log('[ServiceWorker] Error sending message to client', err)
          })
        })
      break

    case 'tag:created':
    case 'tag:updated':
    case 'tag:deleted':
      // fall-through intentional
      if (!'tagData' in data) {
        return
      }

      // we do not want multiple clients to start syncing data
      // send message to first client only. If no tabs/windows are open, then message is not sent.
      getFirstNonAdminClient()
        .then(nonAdminClient => {
          sendMessageToClient(
            nonAdminClient,
            {
              action: data.type,
              tagData: data.tagData
            }
          )
          .then(msg => {
            console.log('[ServiceWorker] Message sent to client: ', msg)
          })
          .catch(err => {
            console.log('[ServiceWorker] Error sending message to client', err)
          })
        })
      break

    default:
      console.log('Unknown push data: ', data)
  }
})

self.addEventListener('notificationclick', function (event) {
  event.notification.close()
  event.waitUntil(
    clients.matchAll({
      type: "window"
    }).then(clientsList => {
      for (var i=0; i < clientsList.length; i++) {
        let client = clientsList[i]
        let clientUrl = new URL(client.url)
        if (clientUrl.pathname == event.notification.data.url && 'focus' in client) {
          return client.focus()
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(event.notification.data.url)
      }
    })
  )
})
