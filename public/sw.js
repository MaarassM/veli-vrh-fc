// Service worker — web push obavijesti o rezultatima NK Veli Vrh
self.addEventListener('push', (event) => {
  if (!event.data) return
  let payload = {}
  try {
    payload = event.data.json()
  } catch {
    payload = { title: 'NK Veli Vrh', body: event.data.text() }
  }

  event.waitUntil(
    self.registration.showNotification(payload.title || 'NK Veli Vrh', {
      body: payload.body || '',
      icon: '/images/icon-192.png',
      badge: '/images/icon-192.png',
      data: { url: payload.url || '/utakmice' },
    })
  )
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  const url = (event.notification.data && event.notification.data.url) || '/utakmice'
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      for (const client of windowClients) {
        if ('focus' in client) {
          client.navigate(url)
          return client.focus()
        }
      }
      return clients.openWindow(url)
    })
  )
})
