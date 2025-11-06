# Fase 4: PWA e Push Notifications

## Contexto

O sistema web funciona perfeitamente, mas as notificações são apenas por email. Esta fase transforma o app em **PWA** (Progressive Web App) com **push notifications** nativas.

## Objetivo

1. Configurar PWA (installable web app)
2. Implementar Service Worker
3. Adicionar Push Notifications via Firebase Cloud Messaging
4. Solicitar permissões do usuário
5. Enviar notificações quando alertas ocorrem

## Arquivos a Criar

```
public/
├── sw.js                    # Service Worker
├── manifest.json            # PWA Manifest
└── icons/                   # App icons
    ├── icon-72x72.png
    ├── icon-96x96.png
    ├── icon-128x128.png
    ├── icon-144x144.png
    ├── icon-152x152.png
    ├── icon-192x192.png
    ├── icon-384x384.png
    └── icon-512x512.png

src/
├── lib/firebase.ts          # Firebase config
├── hooks/usePushNotifications.ts
└── components/NotificationPrompt.tsx
```

## Passo 1: Configurar Firebase

### 1.1 Criar Projeto Firebase

1. Acesse console.firebase.google.com
2. Criar novo projeto "alzheimer-care"
3. Ativar Cloud Messaging
4. Copiar configuração web

### 1.2 Instalar SDK

```bash
npm install firebase
```

### 1.3 Configurar Firebase

```typescript
// src/lib/firebase.ts
import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
export const messaging = getMessaging(app);

export async function requestPermissionAndGetToken() {
  try {
    const permission = await Notification.requestPermission();

    if (permission === 'granted') {
      const token = await getToken(messaging, {
        vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
      });

      console.log('[FCM] Token:', token);
      return token;
    } else {
      console.log('[FCM] Permissão negada');
      return null;
    }
  } catch (error) {
    console.error('[FCM] Erro ao obter token:', error);
    return null;
  }
}

export function onMessageListener() {
  return new Promise((resolve) => {
    onMessage(messaging, (payload) => {
      resolve(payload);
    });
  });
}
```

## Passo 2: PWA Manifest

```json
// public/manifest.json
{
  "name": "Alzheimer Care",
  "short_name": "AlzCare",
  "description": "Sistema de monitoramento inteligente para pacientes com Alzheimer",
  "start_url": "/dashboard",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#10b981",
  "orientation": "portrait",
  "icons": [
    {
      "src": "/icons/icon-72x72.png",
      "sizes": "72x72",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-96x96.png",
      "sizes": "96x96",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-128x128.png",
      "sizes": "128x128",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-144x144.png",
      "sizes": "144x144",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-152x152.png",
      "sizes": "152x152",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-384x384.png",
      "sizes": "384x384",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-512x512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any maskable"
    }
  ]
}
```

## Passo 3: Service Worker

```javascript
// public/sw.js

// Importar Firebase Messaging no Service Worker
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

// Configurar Firebase
firebase.initializeApp({
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
});

const messaging = firebase.messaging();

// Lidar com notificações em background
messaging.onBackgroundMessage((payload) => {
  console.log('[SW] Background message:', payload);

  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-72x72.png',
    vibrate: [200, 100, 200],
    data: payload.data,
    actions: [
      {
        action: 'open',
        title: 'Ver no Mapa'
      },
      {
        action: 'dismiss',
        title: 'Dispensar'
      }
    ]
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

// Lidar com cliques na notificação
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'open') {
    const urlToOpen = new URL('/map', self.location.origin).href;

    event.waitUntil(
      clients.matchAll({ type: 'window', includeUncontrolled: true })
        .then((windowClients) => {
          // Verificar se já existe uma janela aberta
          for (let client of windowClients) {
            if (client.url === urlToOpen && 'focus' in client) {
              return client.focus();
            }
          }

          // Senão, abrir nova janela
          if (clients.openWindow) {
            return clients.openWindow(urlToOpen);
          }
        })
    );
  }
});

// Cache básico (opcional)
const CACHE_NAME = 'alzheimer-care-v1';
const urlsToCache = [
  '/',
  '/dashboard',
  '/map',
  '/manifest.json'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => response || fetch(event.request))
  );
});
```

## Passo 4: Hook de Push Notifications

```typescript
// src/hooks/usePushNotifications.ts

import { useEffect, useState } from 'react';
import { requestPermissionAndGetToken, onMessageListener } from '@/lib/firebase';
import { useUser } from '@clerk/nextjs';

export function usePushNotifications() {
  const { user } = useUser();
  const [fcmToken, setFcmToken] = useState<string | null>(null);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default');

  useEffect(() => {
    if ('Notification' in window) {
      setNotificationPermission(Notification.permission);
    }
  }, []);

  const requestPermission = async () => {
    const token = await requestPermissionAndGetToken();

    if (token) {
      setFcmToken(token);
      setNotificationPermission('granted');

      // Salvar token no backend
      await saveFCMToken(token);
    }
  };

  const saveFCMToken = async (token: string) => {
    try {
      await fetch('/api/users/fcm-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      });
    } catch (error) {
      console.error('Error saving FCM token:', error);
    }
  };

  useEffect(() => {
    // Listener para mensagens quando app está em foreground
    onMessageListener().then((payload: any) => {
      console.log('[FCM] Foreground message:', payload);

      // Mostrar notificação customizada
      new Notification(payload.notification.title, {
        body: payload.notification.body,
        icon: '/icons/icon-192x192.png',
      });
    });
  }, []);

  return {
    fcmToken,
    notificationPermission,
    requestPermission,
  };
}
```

## Passo 5: Componente de Prompt

```typescript
// src/components/NotificationPrompt.tsx

'use client';

import { usePushNotifications } from '@/hooks/usePushNotifications';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Bell, X } from 'lucide-react';
import { useState } from 'react';

export function NotificationPrompt() {
  const { notificationPermission, requestPermission } = usePushNotifications();
  const [dismissed, setDismissed] = useState(false);

  if (notificationPermission === 'granted' || dismissed) {
    return null;
  }

  return (
    <Card className="fixed bottom-4 right-4 p-4 max-w-sm z-50 shadow-lg">
      <div className="flex items-start gap-4">
        <Bell className="h-6 w-6 text-emerald-600 mt-1" />

        <div className="flex-1">
          <h3 className="font-semibold mb-1">Ativar Notificações</h3>
          <p className="text-sm text-gray-600 mb-3">
            Receba alertas instantâneos quando o paciente sair das zonas seguras
          </p>

          <div className="flex gap-2">
            <Button onClick={requestPermission} size="sm">
              Ativar
            </Button>
            <Button
              onClick={() => setDismissed(true)}
              size="sm"
              variant="ghost"
            >
              Agora Não
            </Button>
          </div>
        </div>

        <button onClick={() => setDismissed(true)}>
          <X className="h-4 w-4 text-gray-400" />
        </button>
      </div>
    </Card>
  );
}
```

## Passo 6: Atualizar Layout

```typescript
// src/app/layout.tsx

import { NotificationPrompt } from '@/components/NotificationPrompt';

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
      <html lang="pt-BR">
        <head>
          <link rel="manifest" href="/manifest.json" />
          <meta name="theme-color" content="#10b981" />
        </head>
        <body>
          {children}
          <NotificationPrompt />
        </body>
      </html>
    </ClerkProvider>
  );
}
```

## Passo 7: API para Enviar Push

```typescript
// src/app/api/notifications/send/route.ts

import { NextRequest, NextResponse } from 'next/server';
import admin from 'firebase-admin';

// Inicializar Firebase Admin (server-side)
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });
}

export async function POST(request: NextRequest) {
  try {
    const { token, title, body, data } = await request.json();

    const message = {
      notification: {
        title,
        body,
      },
      data,
      token,
    };

    const response = await admin.messaging().send(message);

    return NextResponse.json({ success: true, messageId: response });
  } catch (error) {
    console.error('Error sending notification:', error);
    return NextResponse.json({ success: false, error }, { status: 500 });
  }
}
```

## Passo 8: Integrar com Alertas

```typescript
// src/lib/services/alert-manager.ts

// Adicionar ao sendAlert()
async function sendPushNotification(userId: string, alert: Alert) {
  // Buscar FCM tokens do usuário
  const { data: tokens } = await supabase
    .from('user_fcm_tokens')
    .select('token')
    .eq('user_id', userId);

  if (!tokens || tokens.length === 0) return;

  // Enviar para cada token
  for (const { token } of tokens) {
    await fetch('/api/notifications/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        token,
        title: 'Alerta - Alzheimer Care',
        body: alert.message,
        data: {
          type: 'geofence_alert',
          device_id: alert.device_id,
        },
      }),
    });
  }
}
```

## Checklist

- [ ] Criar projeto Firebase
- [ ] Instalar dependências
- [ ] Configurar Firebase
- [ ] Criar manifest.json
- [ ] Gerar ícones PWA (usar https://realfavicongenerator.net/)
- [ ] Criar Service Worker
- [ ] Criar hook usePushNotifications
- [ ] Criar NotificationPrompt
- [ ] Criar tabela user_fcm_tokens no Supabase
- [ ] Criar API de envio de push
- [ ] Integrar com alert-manager
- [ ] Testar notificações (foreground e background)
- [ ] Testar instalação como PWA
- [ ] Validar ícones e cores

## Tempo Estimado

- **Firebase Setup**: 2 horas
- **PWA Config**: 3 horas
- **Service Worker**: 4 horas
- **Push Implementation**: 5 horas
- **Testing**: 2 horas

**Total: ~16 horas (2 dias)**

## Próxima Fase

Ver: `FASE_5_ANALYTICS.md`
