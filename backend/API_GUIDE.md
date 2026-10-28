# Guida di implementazione Shopify Backend

## Panoramica

Questo backend integra completamente Shopify con il tuo sistema di call center e-commerce, permettendo di:
- Sincronizzare prodotti, ordini e clienti da Shopify
- Gestire ordini tramite API
- Tenere sincronizzato il database locale con Shopify
- Configurare webhooks per aggiornamenti in tempo reale

## Struttura Backend

```
backend/
├── shopify.js                    # Client Shopify principale
├── server.js                     # Server Express principale
├── config/
│   └── shopifyConfig.js         # Configurazione Shopify avanzata
├── routes/
│   ├── shopifyRoutes.js         # Rotte API Shopify
│   └── syncRoutes.js            # Rotte di sincronizzazione
├── controllers/
│   └── shopifyController.js     # Logica controller
├── services/
│   └── shopifyService.js        # Servizi Shopify riutilizzabili
├── utils/
│   └── syncShopify.js           # Utilità di sincronizzazione
├── middleware/
│   └── shopifyAuth.js           # Middleware autenticazione
└── .env                         # Variabili di ambiente
```

## Configurazione

### Step 1: Aggiorna file .env

```env
SHOPIFY_SHOP=Il-nome-del-tuo-store
SHOPIFY_CLIENT_ID=xxxxxxxxxxxxx
SHOPIFY_CLIENT_SECRET=shpss_xxxxx
SHOPIFY_ACCESS_TOKEN=shpat_xxxxx
SHOPIFY_API_KEY=xxxxx (opzionale)
```

### Step 2: Installa dipendenze

```bash
npm install
```

### Step 3: Avvia il server

```bash
npm run server
# oppure in desenvolvimento con live reload
npm run dev
```

## API Endpoints Disponibili

### Prodotti

#### Recuperare tutti i prodotti
```
GET /api/shopify/products
```

Response:
```json
[
  {
    "id": 12345,
    "title": "Nome Prodotto",
    "vendor": "Fornitore",
    "body_html": "Descrizione",
    "handle": "nome-prodotto",
    "variants": [...],
    "image": {...}
  }
]
```

#### Recuperare un singolo prodotto
```
GET /api/shopify/products/:id
```

#### Creare un prodotto
```
POST /api/shopify/products
Content-Type: application/json

{
  "title": "Nuovo Prodotto",
  "vendor": "Mio Negozio",
  "body_html": "<strong>Descrizione</strong>",
  "product_type": "Gioielli",
  "variants": [
    {
      "option1": "Oro",
      "price": "99.99",
      "sku": "ORO-001"
    }
  ]
}
```

#### Aggiornare un prodotto
```
PUT /api/shopify/products/:id
Content-Type: application/json

{
  "title": "Titolo Aggiornato",
  "body_html": "Descrizione aggiornata"
}
```

#### Eliminare un prodotto
```
DELETE /api/shopify/products/:id
```

### Ordini

#### Recuperare tutti gli ordini
```
GET /api/shopify/orders
```

Response:
```json
[
  {
    "id": 12345,
    "order_number": 1001,
    "customer": {...},
    "line_items": [...],
    "total_price": "199.99",
    "financial_status": "paid",
    "fulfillment_status": "fulfilled"
  }
]
```

#### Recuperare un singolo ordine
```
GET /api/shopify/orders/:id
```

#### Creare un ordine
```
POST /api/shopify/orders
Content-Type: application/json

{
  "line_items": [
    {
      "variant_id": 12345,
      "quantity": 2,
      "price": "99.99"
    }
  ],
  "customer": {
    "first_name": "Marco",
    "last_name": "Rossi",
    "email": "marco@example.com",
    "phone": "+393351234567"
  },
  "shipping_address": {
    "first_name": "Marco",
    "last_name": "Rossi",
    "address1": "Via Roma 10",
    "city": "Palermo",
    "province": "PA",
    "zip": "90100",
    "country": "IT"
  },
  "note": "Note ordine"
}
```

#### Aggiornare un ordine
```
PUT /api/shopify/orders/:id
Content-Type: application/json

{
  "note": "Ordine spedito",
  "fulfillment_status": "fulfilled"
}
```

### Clienti

#### Recuperare tutti i clienti
```
GET /api/shopify/customers
```

Response:
```json
[
  {
    "id": 12345,
    "email": "marco@example.com",
    "first_name": "Marco",
    "last_name": "Rossi",
    "phone": "+393351234567",
    "orders_count": 5,
    "total_spent": "499.99"
  }
]
```

#### Creare un cliente
```
POST /api/shopify/customers
Content-Type: application/json

{
  "first_name": "Marco",
  "last_name": "Rossi",
  "email": "marco@example.com",
  "phone": "+393351234567",
  "addresses": [
    {
      "address1": "Via Roma 10",
      "city": "Palermo",
      "province": "PA",
      "zip": "90100",
      "country": "IT",
      "default": true
    }
  ]
}
```

### Inventario

#### Recuperare livelli di inventario
```
GET /api/shopify/inventory
```

#### Aggiornare inventario
```
PUT /api/shopify/inventory/:id
Content-Type: application/json

{
  "inventoryItemId": 12345,
  "locationId": 67890,
  "quantity": 100
}
```

### Sincronizzazione Dati

#### Sincronizzare prodotti
```
POST /api/sync/sync
Content-Type: application/json

{
  "type": "products"
}
```

#### Sincronizzare ordini
```
POST /api/sync/sync
Content-Type: application/json

{
  "type": "orders"
}
```

#### Sincronizzare clienti
```
POST /api/sync/sync
Content-Type: application/json

{
  "type": "customers"
}
```

#### Sincronizzazione completa
```
POST /api/sync/sync
Content-Type: application/json

{
  "type": "all"
}
```

## Integrazione nel Frontend

### Esempio React - Fetchare Prodotti

```javascript
import { useEffect, useState } from 'react';

export function ProductList() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost:3001/api/shopify/products')
      .then(res => res.json())
      .then(data => {
        setProducts(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching products:', err);
        setLoading(false);
      });
  }, []);

  if (loading) return <div>Caricamento...</div>;

  return (
    <div>
      {products.map(product => (
        <div key={product.id} className="product-card">
          <h3>{product.title}</h3>
          <p>{product.vendor}</p>
          <p>€{product.variants[0]?.price}</p>
        </div>
      ))}
    </div>
  );
}
```

### Esempio React - Creare Ordine

```javascript
async function createOrder(orderData) {
  try {
    const response = await fetch('http://localhost:3001/api/shopify/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(orderData)
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const order = await response.json();
    console.log('Ordine creato:', order);
    return order;
  } catch (error) {
    console.error('Errore nella creazione ordine:', error);
    throw error;
  }
}
```

## Webhooks Shopify

### Configurare i Webhooks

1. Accedi al tuo Shopify Admin
2. Vai a Settings → Notifications
3. Aggiungi webhook con questi eventi:
   - Product created → `http://your-domain/api/shopify/webhooks/product-created`
   - Order created → `http://your-domain/api/shopify/webhooks/order-created`
   - Order updated → `http://your-domain/api/shopify/webhooks/order-updated`

### Webhook per Sincronizzazione

I webhook di sincronizzazione aggiornano il database locale automaticamente:

- `POST /api/sync/webhooks/product-updated`
- `POST /api/sync/webhooks/order-created-sync`
- `POST /api/sync/webhooks/customer-created-sync`

## Troubleshooting

### Errore: "SHOPIFY_SHOP is not configured"
**Soluzione**: Verifica che le variabili di ambiente in `.env` siano corrette

### Errore: 401 Unauthorized
**Soluzione**: L'Access Token non è valido. Genera un nuovo token da Shopify Admin

### Errore: 429 Too Many Requests
**Soluzione**: Sei stato rate-limited. Il backend implementa retry automatici

### Errore: "Shop not found"
**Soluzione**: Verifica il nome dello shop in SHOPIFY_SHOP (es: "licata-gioielli.myshopify.com")

## Performance e Best Practices

1. **Sincronizzazione**: Sincronizza con Shopify ogni ora per mantenere i dati aggiornati
2. **Caching**: Implementa caching in Redis/Memcached per prodotti e clienti frequenti
3. **Rate Limiting**: Shopify permette 2 call/sec. Il backend gestisce questo automaticamente
4. **Error Handling**: Sempre gestisci gli errori nel tuo frontend
5. **Logging**: Tutti gli errori sono loggati in console server

## Ambiente di Produzione

1. Usa variabili di ambiente sicure (AWS Secrets, etc.)
2. Implementa HTTPS per tutte le API
3. Abilita CORS solo per i tuoi domini
4. Aggiungi rate limiting al frontend
5. Monitora gli errori con tools come Sentry

## Supporto

Per documentazione completa Shopify API:
https://shopify.dev/api/admin-rest/2024-07
