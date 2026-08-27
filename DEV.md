# Desarrollo con Docker

Este proyecto tiene dos modos:

- `docker-compose.yml`: build de produccion con Nginx
- `docker-compose.dev.yml`: desarrollo con Vite y recarga automatica

## Levantar desarrollo

Primero libera el puerto `5173` si tienes el contenedor de produccion arriba:

```bash
docker compose down
```

Luego inicia el modo desarrollo:

```bash
docker compose -f docker-compose.dev.yml up --build
```

Abre:

```text
http://localhost:5173
```

## Que cambia en este modo

- `src/`, `public/` y el resto del proyecto se montan como volumen
- Vite corre dentro del contenedor
- Los cambios de CSS, TSX y assets se reflejan sin rebuild completo

## Detener

```bash
docker compose -f docker-compose.dev.yml down
```
