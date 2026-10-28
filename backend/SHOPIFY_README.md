# Shopify Backend Integration

Backend integration per collegare l'app a Shopify Store.

## Setup

### 1. Installare dipendenze
```bash
npm install
```

### 2. Configurare variabili di ambiente

Nel file `.env` aggiungi:
```
SHOPIFY_SHOP=Subdomain del tuo store (es: licata-gioielli o licata-gioielli.myshopify.com)
SHOPIFY_CLIENT_ID=Il tuo Client ID da Shopify
SHOPIFY_CLIENT_SECRET=Il tuo Client Secret da Shopify
SHOPIFY_ACCESS_TOKEN=Token di accesso per l'API (generato da Shopify)
SHOPIFY_API_KEY=Chiave API per validazione webhooks (opzionale)
```

Consiglio: crea prima `backend/.env` copiando `backend/.env.example`, poi sostituisci i placeholder con valori reali.

### 3. Avviare il server
```bash
npm run server
# oppure
node server.js
```

Il server sarà disponibile su `http://localhost:3001`

## API Endpoints

### Products
- `GET /api/shopify/products` - Recupera tutti i prodotti
- `GET /api/shopify/products/:id` - Recupera un prodotto specifico
- `POST /api/shopify/products` - Crea un nuovo prodotto
- `PUT /api/shopify/products/:id` - Aggiorna un prodotto
- `DELETE /api/shopify/products/:id` - Elimina un prodotto

### Orders
- `GET /api/shopify/orders` - Recupera tutti gli ordini
- `GET /api/shopify/orders/:id` - Recupera un ordine specifico
- `POST /api/shopify/orders` - Crea un nuovo ordine
- `PUT /api/shopify/orders/:id` - Aggiorna un ordine

### Customers
- `GET /api/shopify/customers` - Recupera tutti i clienti
- `GET /api/shopify/customers/:id` - Recupera un cliente specifico
- `POST /api/shopify/customers` - Crea un nuovo cliente
- `PUT /api/shopify/customers/:id` - Aggiorna un cliente

### Inventory
- `GET /api/shopify/inventory` - Recupera i livelli di inventario
- `PUT /api/shopify/inventory/:id` - Aggiorna un livello di inventario

### Shop Info
- `GET /api/shopify/shop` - Recupera informazioni del negozio
- `GET /api/shopify/collections` - Recupera tutte le collezioni

### Webhooks
- `POST /api/shopify/webhooks/product-created` - Webhook per prodotto creato
- `POST /api/shopify/webhooks/order-created` - Webhook per ordine creato
- `POST /api/shopify/webhooks/order-updated` - Webhook per ordine aggiornato

## Struttura dei file

```
backend/
├── shopify.js                 # Configurazione client Shopify
├── routes/
│   └── shopifyRoutes.js      # Definizione di tutte le rotte
├── controllers/
│   └── shopifyController.js  # Logica dei controller per le rotte
├── services/
│   └── shopifyService.js     # Servizi riutilizzabili
├── middleware/
│   └── shopifyAuth.js        # Middleware per autenticazione
└── .env                      # Variabili di ambiente
```

## Esempi di utilizzo

### Ottenere prodotti
```javascript
fetch('http://localhost:3001/api/shopify/products')
  .then(res => res.json())
  .then(data => console.log(data))
```

### Creare un cliente
```javascript
fetch('http://localhost:3001/api/shopify/customers', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    first_name: 'Marco',
    last_name: 'Rossi',
    email: 'marco@example.com',
    phone: '+393351234567'
  })
})
  .then(res => res.json())
  .then(data => console.log(data))
```

### Aggiornare ordine
```javascript
fetch('http://localhost:3001/api/shopify/orders/12345', {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    fulfillment_status: 'fulfilled',
    note: 'Ordine spedito'
  })
})
  .then(res => res.json())
  .then(data => console.log(data))
```

## Autenticazione Shopify

Per ottenere il token di accesso:
1. Accedi al tuo admin Shopify
2. Vai a Settings → Apps and integrations → Develop apps
3. Crea una nuova app
4. Configura i permessi necessari
5. Installa l'app
6. Copia l'Access Token

## Note Importanti

- L'API utilizza la libreria `shopify-api-node` per interagire con Shopify
- Tutti gli errori vengono loggati in console
- Implementa la gestione degli errori nel tuo frontend
- Per webhooks, verifica sempre la firma HMAC

## Troubleshooting

**Errore: "Unauthorized"**
- Verifica che le variabili di ambiente siano corrette
- Controlla che l'Access Token sia ancora valido

**Errore: "Shop not found"**
- Verifica il nome dello shop in SHOPIFY_SHOP
- Deve corrispondere esattamente al nome del negozio Shopify

**Errore di connessione**
- Verifica che il server sia avviato su porta 3001
- Controlla la connessione internet
