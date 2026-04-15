# CEFA – Proyecto Corporativo (Astro + Payload CMS)

Este repositorio contiene la arquitectura completa de la plataforma web de **Celulosa Fabril S.A. (CEFA)**.

## Arquitectura

El proyecto está compuesto por 5 servicios principales gestionados con Docker Compose:

1.  **Astro Frontend** (`cefa-landing-page`): Sitio estático de alto rendimiento (SSG).
2.  **Payload CMS** (`payloadcms`): Panel de administración y API de contenidos.
3.  **Orchestrator**: Servicio intermedio que recibe webhooks del CMS y dispara el build de Astro.
4.  **Nginx**: Servidor web que sirve el sitio estático final.
5.  **LibreTranslate**: Servicio local para la traducción automática de contenidos.

---

## Desarrollo Local

**Requisitos:** Docker y Docker Desktop.

### 1. Iniciar el entorno parcial (Payload + DB)
Si solo quieres trabajar en el CMS:
```bash
docker compose up payload mongo libretranslate -d
```

### 2. Iniciar el entorno completo
Para ver la web funcionando y el orquestador:
```bash
docker compose up -d
```
Acceso:
- **Web**: http://localhost (vía Nginx)
- **CMS**: http://localhost:3000/admin (vía Payload)
- **Orquestador**: http://localhost:4000 (vía Orchestrator)

---

## Gestión de Contenidos (Payload CMS)

Todo el contenido de la web se gestiona ahora desde el **Payload CMS**. 

### Cómo actualizar la web:
1. Accede al panel en `http://localhost:3000/admin`.
2. Modifica los datos en las **Colecciones** (Productos, Proyectos, Certificados) o **Globals** (Header, Mission, Innovation, etc.).
3. Al guardar los cambios en **Español**, el sistema traducirá automáticamente el contenido a los demás idiomas.
4. Pulsa el botón **"Publicar Web"** en el dashboard principal para generar una nueva versión estática de la página.

---

## Sincronización Manual (Frontend)

Para el desarrollo local del frontend sin depender de la red de Docker, puedes sincronizar los datos del CMS localmente:

```bash
cd cefa-landing-page
npm run sync:cms
```
Esto descargará todos los JSONs de contenido y las imágenes a `src/data/cms/` y `public/cms-media/`.

---

## Scripts Disponibles (cefa-landing-page)

| Comando | Descripción |
| :--- | :--- |
| `npm run dev` | Servidor de desarrollo de Astro (puerto 4321) |
| `npm run sync:cms` | Sincroniza datos desde el CMS a archivos locales |
| `npm run build` | Genera el sitio estático en `dist/` |
| `npm run lint` | Ejecuta el linter |
| `npm run format` | Formatea el código con Prettier |
