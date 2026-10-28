# 🚀 Guida Completa: Setup Shopify Backend

Questo documento ti guida passo per passo nel setup completo del backend Shopify per il tuo sistema di gestionale.

## 📋 Prerequisiti

- Node.js v16+ installato
- npm o yarn
- Un account Shopify Developer
- Un Shopify Store

## 🔑 Step 1: Ottenere le Credenziali Shopify

### 1.1 Accedi a Shopify Admin
1. Vai a https://admin.shopify.com
2. Accedi con il tuo account

### 1.2 Crea una Develop App
1. Nel menu laterale, vai a **Settings** (Impostazioni)
2. Seleziona **Apps and integrations** (App e integrazioni)
3. Clicca su **Develop apps** (Sviluppa app)
4. Se richiesto, abilita la modalità di sviluppo
5. Clicca **Create an app**

### 1.3 Configura l'App
1. Dai un nome all'app (es: "Call Center Integration")
2. Nel riquadro **Admin API access scopes**, abilita questi permessi:
   - `read_products` e `write_products`
   - `read_orders` e `write_orders`
   - `read_customers` e `write_customers`
   - `read_inventory` e `write_inventory`
3. Salva le modifiche
4. Clicca **Install app**

### 1.4 Genera l'Access Token
1. Nella pagina dell'app, vai a **Configuration**
2. Scorri fino a **Admin API access tokens**
3. Clicca **Create token**
4. Copia il token generato (apparirà solo una volta!)

### 1.5 Copia le Credenziali
Nella pagina dell'app, troverai:
- **Client ID**: da Settings > Configuration
- **Client Secret**: da Settings > Configuration
- **Access Token**: che hai appena generato
- **Shop Name**: Dipende dall'URL (es: https://licata-gioielli.myshopify.com → licata-gioielli)

## ⚙️ Step 2: Configurare il Backend

### 2.1 Aggiorna il file .env
1. Apri `backend/.env`
2. Riempi le variabili con i dati ottenuti:

```env
SHOPIFY_SHOP=licata-gioielli
SHOPIFY_CLIENT_ID=your_shopify_client_id
SHOPIFY_CLIENT_SECRET=your_shopify_client_secret
SHOPIFY_ACCESS_TOKEN=shpat_xxxxxxxxxxxxx
```

3. Salva il file

### 2.2 Installa le Dipendenze
```bash
npm install
```

## ✅ Step 3: Testare la Connessione

### 3.1 Esegui il Test
```bash
npm run test:shopify
```

Dovresti vedere output simile a:
```
✓ Connected to Shopify
  Shop: Licata Gioielli
  Domain: licata-gioielli.myshopify.com
  Plan: Shopify Plus

✓ Fetched 45 products
✓ Fetched 12 orders
✓ Fetched 8 customers
```

### 3.2 Se il test fallisce
- **Errore: "SHOPIFY_SHOP is not configured"**
  → Controlla che .env sia nel folder backend/
  
- **Errore: 401 Unauthorized**
  → L'Access Token non è valido o non hai i permessi giusti
  
- **Errore: Shop not found**
  → Verifica il nome dello shop (deve essere il subdomain)

## 🚀 Step 4: Avviare il Server

### 4.1 Opzione 1: Solo Backend
```bash
npm run server
```

### 4.2 Opzione 2: Backend + Frontend
```bash
npm start
```

Il server sarà disponibile su: `http://localhost:3001`

## 📱 Step 5: Usare l'API dal Frontend

### 5.1 Importa gli Hooks
```javascript
import { useShopify } from './hooks/useShopify';

function MyComponent() {
  const { getProducts, getOrders } = useShopify();
  
  // Usa gli hook per accedere all'API
}
```

### 5.2 Esempi di Utilizzo

**Recuperare Prodotti:**
```javascript
const products = await getProducts();
console.log(products);
```

**Creare un Ordine:**
```javascript
const order = await createOrder({
  line_items: [
    { variant_id: 123, quantity: 2, price: '99.99' }
  ],
  customer: {
    first_name: 'Marco',
    last_name: 'Rossi',
    email: 'marco@example.com',
    phone: '+393351234567'
  }
});
```

## 🔄 Step 6: Configurare Webhooks (Opzionale)

I webhooks permettono a Shopify di notificare il tuo backend quando avvengono eventi.

### 6.1 Crea Webhook in Shopify
1. Nel Shopify Admin, vai a **Settings** > **Notifications**
2. Scorri fino a **Webhooks**
3. Clicca **Create webhook**
4. Per ogni evento che vuoi monitorare:
   - Seleziona l'evento (es: "Product created", "Order created")
   - Nella sezione **Endpoint URL**, inserisci:
     ```
     https://your-domain.com/api/sync/webhooks/product-created
     https://your-domain.com/api/sync/webhooks/order-created
     ```
   - Clicca **Save**

### 6.2 Eventi Disponibili
- **Product created**: `POST /api/shopify/webhooks/product-created`
- **Product updated**: `POST /api/sync/webhooks/product-updated`
- **Order created**: `POST /api/shopify/webhooks/order-created`
- **Order updated**: `POST /api/shopify/webhooks/order-updated`
- **Customer created**: `POST /api/sync/webhooks/customer-created-sync`

## 📊 Step 7: Sincronizzare Dati

### 7.1 Sincronizzazione Manuale
Puoi sincronizzare i dati manualmente tramite API:

```bash
# Sincronizza solo prodotti
curl -X POST http://localhost:3001/api/sync/sync \
  -H "Content-Type: application/json" \
  -d '{"type":"products"}'

# Sincronizza tutto
curl -X POST http://localhost:3001/api/sync/sync \
  -H "Content-Type: application/json" \
  -d '{"type":"all"}'
```

### 7.2 Sincronizzazione Automatica
I dati vengono sincronizzati automaticamente quando ricevi webhooks da Shopify.

## 🐛 Troubleshooting

### Problema: "Cannot find module '@shopify/shopify-api'"
**Soluzione**: Esegui `npm install` nella root del progetto

### Problema: "ECONNREFUSED" quando cerco di connettermi
**Soluzione**: Assicurati che il server sia avviato con `npm run server`

### Problema: "401 Unauthorized" su tutte le richieste
**Soluzione**: 
1. Verifica che SHOPIFY_ACCESS_TOKEN sia corretto
2. Verifica che i permessi della app siano abilitati
3. Rigenera il token in Shopify Admin

### Problema: I dati non si sincronizzano
**Soluzione**:
1. Esegui `npm run test:shopify` per verificare la connessione
2. Controlla i log della console per errori
3. Verifica che i webhook siano configurati correttamente

### Problema: CORS errors nel browser
**Soluzione**: Il backend è già configurato con CORS. Se hai ancora errori:
1. Assicurati che il server sia in esecuzione su http://localhost:3001
2. Verifica che la URL nel frontend sia corretta

## 📚 Risorse Utili

- **Shopify API Docs**: https://shopify.dev/api/admin-rest
- **Shopify CLI**: https://shopify.dev/docs/apps/tools/cli
- **Shopify Developer Community**: https://shopify.dev/community

## ✨ Prossimi Passi

1. **Integra componenti React**: Usa gli hook da `src/hooks/useShopify.js`
2. **Personalizza il Database**: Aggiungi campi personalizzati a database.json
3. **Automatizza Sincronizzazione**: Configura webhooks per aggiornamenti in tempo reale
4. **Migliora Performance**: Aggiungi caching per prodotti frequenti
5. **Deploy in Produzione**: Configura variabili di ambiente sicure

## 💡 Tips Importanti

- **Sicurezza**: Non condividere mai SHOPIFY_CLIENT_SECRET o SHOPIFY_ACCESS_TOKEN
- **Rate Limit**: Shopify permette 2 richieste al secondo
- **Error Handling**: Sempre gestisci gli errori nel tuo frontend
- **Logging**: Monitorare i log per debug e problemi

---

**Hai domande? Controlla i file:**
- `backend/SHOPIFY_README.md` - Documentazione API
- `backend/API_GUIDE.md` - Guida dettagliata degli endpoint
- `backend/test.js` - Test di connessione
