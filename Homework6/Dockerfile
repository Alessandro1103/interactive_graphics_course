# Imposta l'immagine base su Ubuntu
FROM ubuntu:latest

# Aggiorna i pacchetti e installa Nginx
RUN apt-get update && apt-get install -y nginx

# Rimuovi il file di configurazione di default e aggiungi il tuo (opzionale)
RUN rm /etc/nginx/sites-enabled/default
COPY nginx.conf /etc/nginx/sites-available/

# Link simbolico per abilitare la tua configurazione
RUN ln -s /etc/nginx/sites-available/nginx.conf /etc/nginx/sites-enabled/nginx.conf

# Copia i tuoi file HTML nel percorso di root di Nginx
COPY . /var/www/html

# Espone la porta 80
EXPOSE 80

# Comando per avviare Nginx in foreground
CMD ["nginx", "-g", "daemon off;"]
