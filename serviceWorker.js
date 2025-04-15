const CACHE_NAME = 'cores-formas-v3';
const ASSETS = [
  '/',
  '/index.html',
  '/styles.css',
  '/script.js',
  '/manifest.json',
  '/sounds/ding.mp3',
  '/sounds/error.mp3',
  'https://cdn.jsdelivr.net/npm/canvas-confetti@1.5.1/dist/confetti.browser.min.js'
];

// Instalação e armazenamento em cache dos arquivos
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Cache aberto');
        return cache.addAll(ASSETS)
          .catch(err => {
            console.error('Erro ao adicionar itens ao cache:', err);
            // Continua mesmo se alguns recursos falharem
            // para evitar que o SW não seja instalado
          });
      })
      .then(() => self.skipWaiting())
  );
});

// Ativação e limpeza de caches antigos
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.filter(cacheName => {
          return cacheName !== CACHE_NAME;
        }).map(cacheName => {
          console.log('Removendo cache antigo:', cacheName);
          return caches.delete(cacheName);
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Interceptação das requisições
self.addEventListener('fetch', event => {
  // Método de cache-first com fallback para network
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Cache hit - retorna a resposta
        if (response) {
          return response;
        }

        // Clonar a requisição
        const fetchRequest = event.request.clone();

        return fetch(fetchRequest)
          .then(response => {
            // Verificar se a resposta é válida
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // Clonar a resposta
            const responseToCache = response.clone();

            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              })
              .catch(err => {
                console.error('Erro ao armazenar em cache:', err);
              });

            return response;
          })
          .catch(err => {
            console.error('Erro na requisição fetch:', err);
            
            // Fallback para conteúdo HTML
            if (event.request.url.indexOf('.html') > -1 || 
                event.request.mode === 'navigate') {
              return caches.match('/index.html');
            }
          });
      })
  );
});
