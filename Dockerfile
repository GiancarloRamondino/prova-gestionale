# Immagine base ufficiale Node.js 20 su Alpine Linux
FROM node:20-alpine

# Imposta la cartella di lavoro all'interno del container
WORKDIR /app

# Copia i file delle dipendenze
COPY package*.json ./

# Installa le dipendenze del progetto
RUN npm install

# Copia il codice sorgente dell'applicazione
COPY . .

# Espone la porta del frontend Vite (3000) e del backend Express (3001)
EXPOSE 3000 3001

# Avvia sia il server Express che il frontend Vite in parallelo tramite concurrently
CMD ["npm", "start"]
