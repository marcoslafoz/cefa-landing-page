# CEFA – Plataforma Web Corporativa

Este repositorio contiene la arquitectura completa de la plataforma web de **Celulosa Fabril S.A. (CEFA)**, parte del grupo Motherson.

## Arquitectura

El proyecto está compuesto por 5 servicios gestionados con Docker Compose:

| Servicio | Directorio | Descripción |
| :--- | :--- | :--- |
| **Astro Frontend** | `cefa-landing-page` | Sitio estático de alto rendimiento (SSG/SSR) |
| **Payload CMS** | `payloadcms` | Panel de administración y API de contenidos |
| **Orchestrator** | `cefa-landing-page/orchestrator.cjs` | Recibe webhooks del CMS y dispara el build de Astro |
| **Nginx** | — | Sirve el sitio estático final |
| **LibreTranslate** | `libretranslate` | Servicio local para traducción automática de contenidos |

---

## Requisitos

- Docker y Docker Desktop

---

## Desarrollo Local

### Solo CMS y base de datos

```bash
docker compose up payload mongo libretranslate -d
```

Acceso: `http://localhost:3000/admin`

### Entorno completo

```bash
docker compose up -d
```

| Servicio | URL |
| :--- | :--- |
| Web | http://localhost |
| CMS Admin | http://localhost:3000/admin |
| Orchestrator | http://localhost:4000 |

---

## Gestión de Contenidos

Todo el contenido se gestiona desde el panel de **Payload CMS**.

1. Accede a `http://localhost:3000/admin`.
2. Modifica los datos en las **Colecciones** (Proyectos, Certificados) o **Globals** (Header, Hero, Mission, Vision, Innovation, etc.).
3. Al guardar en **Español**, el sistema traduce automáticamente el contenido a inglés, alemán y polaco.
4. Pulsa **"Publicar Web"** en el dashboard del CMS para generar y desplegar una nueva versión estática.

### Campo de Video (Hero)

En el global **Hero**, puedes configurar:
- **First Frame of Video**: imagen estática que se muestra mientras el video carga.
- **Vimeo Video URL**: URL del vídeo de Vimeo (ej. `https://vimeo.com/1181594121`). El sistema extrae el ID automáticamente y construye la URL del reproductor.

---

## Sincronización Manual del Frontend

Para desarrollar el frontend localmente sin depender del entorno Docker:

```bash
cd cefa-landing-page
npm run sync:cms
```

Descarga todos los JSON de contenido y las imágenes a `src/data/cms/` y `public/cms-media/`.

---

## Scripts Disponibles (cefa-landing-page)

| Comando | Descripción |
| :--- | :--- |
| `npm run dev` | Servidor de desarrollo de Astro (puerto 4321) |
| `npm run sync:cms` | Sincroniza datos desde el CMS a archivos locales |
| `npm run build` | Genera el sitio estático en `dist/` |
| `npm run lint` | Ejecuta ESLint |
| `npm run lint:fix` | Ejecuta ESLint con corrección automática |
| `npm run format` | Formatea el código con Prettier |

---

## Calidad de Código

El repositorio incluye un hook de pre-commit que formatea automáticamente los archivos modificados antes de cada commit:

- **Archivos `.ts`, `.tsx`, `.js`, `.mjs`**: ESLint + Prettier
- **Archivos `.astro`, `.json`, `.css`, `.md`**: Prettier

El hook se activa automáticamente al hacer `git commit` desde cualquier directorio del repositorio.
