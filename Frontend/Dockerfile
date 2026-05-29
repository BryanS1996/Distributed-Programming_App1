# frontend/Dockerfile

# Etapa 1: Compilar la aplicación
FROM node:24-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Etapa 2: Servidor Nginx con proxy
FROM nginx:alpine
# Copiar los archivos estáticos de React
COPY --from=build /app/dist /usr/share/nginx/html

# Copiar tu archivo de configuración de Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]