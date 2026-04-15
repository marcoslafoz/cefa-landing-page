# CEFA Landing Page

Landing page corporativa de **Celulosa Fabril S.A. (CEFA)**, construida con Astro 6 + Tailwind CSS v4. Disponible en español (default), inglés, alemán y polaco.

**URL de producción:** https://cefa.es

---

## Desarrollo local

**Requisitos:** Node.js ≥ 22.12.0

```bash
npm install
npm run dev        # http://localhost:4321
```

El flag `--host` está activo por defecto, accesible desde la red local.

---

## Build y despliegue

```bash
npm run build      # genera dist/
npm run preview    # previsualizar el build antes de subir
```

El output es estático (`dist/`). Subir el contenido de `dist/` al servidor/hosting.

> Antes de desplegar a producción, revisar que `astro.config.mjs` tenga `site: 'https://cefa.es'` correcto, ya que afecta al sitemap y las URLs canónicas.

---

## Actualizar documentos legales

Los documentos legales (Aviso Legal, Política de Privacidad, Política de Cookies) se gestionan como una **Content Collection** y están escritos en Markdown (.md).

**Directorio:** `src/content/legal/{idioma}/`

Cada carpeta de idioma contiene tres archivos:

- `legal.md` — Aviso Legal
- `privacy.md` — Política de Privacidad
- `cookies.md` — Política de Cookies

### Cómo modificar un documento:

1. Ve a `src/content/legal/` y entra en la carpeta del idioma que quieras editar (`es`, `en`, `de` o `pl`).
2. Edita el archivo `.md` correspondiente.
3. El contenido debe mantener el actual **frontmatter** (la sección entre `---` al principio del archivo):

```markdown
---
title: 'Título de la página'
description: 'Breve descripción para SEO'
---
```

4. El resto del archivo es Markdown estándar. Los cambios se verán reflejados automáticamente en la web.

---

## Actualizar certificaciones

**Archivo:** `src/data/certifications.json`

El archivo tiene tres secciones:

- `qualityCerts` — Certificaciones de calidad (ISO, IATF, VDA, etc.)
- `envCerts` — Certificaciones medioambientales

Estructura de cada certificación:

```json
{
  "name": "IATF 16949",
  "year": "2016",
  "org": "International",
  "image": "/images/certifications/nombre-imagen.jpg",
  "type": "image"
}
```

**Para añadir una certificación:**

1. Subir la imagen del certificado a `public/images/certifications/`
2. Añadir la entrada en la sección correspondiente de `certifications.json`

**Para actualizar el PDF de política de gestión:**

1. Reemplazar el archivo en `public/images/certifications/politica-de-gestion.pdf`

---

## Actualizar galería de la sección Misión

**Archivo:** `src/data/mission-gallery.json`

El carrusel de imágenes de la sección "Misión" se gestiona desde este JSON. Las imágenes se muestran en el orden en que aparecen en el array.

Estructura de cada entrada:

```json
{
  "src": "/images/mission/nombre-imagen.webp",
  "alt": "Descripción de la imagen para accesibilidad"
}
```

**Para añadir una foto:**

1. Subir la imagen a `public/images/mission/` (formato `.webp` recomendado, resolución mínima 1440×1120 px)
2. Añadir la entrada en `mission-gallery.json`

**Para reordenar o eliminar fotos:**

Editar directamente el array en `mission-gallery.json`. El primer elemento es la imagen que aparece al cargar la página.

---

## Actualizar proyectos de I+D

**Archivo:** `src/data/projects.json`

El archivo tiene dos secciones:

- `aragonProjects` — Proyectos financiados por Aragón / FEDER
- `euProjects` — Proyectos de ámbito europeo (IDAE, FEDER REACT-UE, etc.)

Estructura de cada proyecto:

```json
{
  "title": "Nombre del proyecto",
  "image": "/images/projects/nombre-imagen.png"
}
```

**Para añadir un proyecto:**

1. Subir la imagen acreditativa a `public/images/projects/`
2. Añadir la entrada al principio del array correspondiente (los más recientes primero)

---

## Traducciones (i18n)

Los textos de la web están en `src/i18n/`:

| Archivo   | Idioma            |
| --------- | ----------------- |
| `es.json` | Español (default) |
| `en.json` | Inglés            |
| `de.json` | Alemán            |
| `pl.json` | Polaco            |

Para modificar un texto: buscar la clave en `es.json` y actualizar el mismo campo en los demás idiomas.

> `translations.ts` reexporta los JSON y tipifica las claves — no necesita tocarse salvo que se añadan nuevas secciones.

---

## Añadir un nuevo idioma

1. Crear `src/i18n/<locale>.json` con todas las claves
2. Añadir el locale en `astro.config.mjs` → `i18n.locales` y en `sitemap.locales`
3. Duplicar las páginas de `src/pages/en/` en `src/pages/<locale>/`
4. Importar el nuevo JSON en `src/i18n/translations.ts`

---

## Estructura del proyecto

```
src/
├── components/         # Componentes de la web
│   └── ui/             # Componentes genéricos reutilizables
├── content/            # Colecciones de contenido (Markdown)
│   └── legal/          # Documentos legales por idioma
├── data/               # Datos editables sin tocar componentes
│   ├── certifications.json
│   ├── projects.json
│   ├── brands.json
│   ├── locations.json
│   └── mission-gallery.json
├── i18n/               # Traducciones por idioma
├── pages/              # Rutas (una carpeta por idioma)
│   ├── index.astro
│   ├── certifications.astro
│   ├── projects.astro
│   ├── en/
│   ├── de/
│   └── pl/
└── styles/
    └── global.css

public/
├── images/
│   ├── certifications/ # Imágenes y PDFs de certificados
│   ├── mission/        # Fotos del carrusel de la sección Misión
│   └── projects/       # Imágenes de proyectos I+D
└── 3dmodel/
```

---

## Scripts disponibles

| Comando            | Descripción                              |
| ------------------ | ---------------------------------------- |
| `npm run dev`      | Servidor de desarrollo (puerto 4321)     |
| `npm run build`    | Build de producción → `dist/`            |
| `npm run preview`  | Preview del build en local               |
| `npm run lint`     | Linter (ESLint)                          |
| `npm run lint:fix` | Corregir errores de lint automáticamente |
| `npm run format`   | Prettier + actualizar Tailwind           |
