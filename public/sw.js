// Obavijesti su uklonjene — ovaj service worker samo uklanja sam sebe
// kod posjetitelja koji su ranije instalirali stariju verziju.
self.addEventListener('install', () => self.skipWaiting())
self.addEventListener('activate', (event) => {
  event.waitUntil(
    self.registration.unregister().then(() => self.clients.matchAll()).then((clients) => {
      clients.forEach((client) => client.navigate(client.url))
    })
  )
})
