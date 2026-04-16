# Payload CMS – CEFA

Panel de administración de contenidos para la plataforma web de CEFA, construido con [Payload CMS](https://payloadcms.com/).

## Estructura

```
src/
  collections/        # Colecciones (Proyectos, Certificados, Media, Usuarios)
  globals/            # Globals (Header, Hero, Mission, Vision, Innovation, ...)
  hooks/              # Hooks de traducción automática (LibreTranslate)
  endpoints/          # Endpoint de sincronización manual
  seed.ts             # Script de población inicial de datos
  payload.config.ts   # Configuración principal de Payload
```

## Globals disponibles

| Slug | Descripción |
| :--- | :--- |
| `header` | Logos y etiquetas de navegación |
| `hero` | Sección principal (video Vimeo, imagen, textos, estadísticas) |
| `mission` | Sección de misión |
| `vision` | Sección de visión con galería de imágenes |
| `innovation` | Sección de innovación |
| `products-section` | Sección de productos |
| `quote` | Cita destacada |
| `clients` | Logos de clientes |
| `contact` | Sedes y formulario de contacto |
| `awards` | Reconocimientos |
| `certifications-content` | Contenido de la página de certificaciones |
| `rd-content` | Contenido de la página de I+D |
| `history-content` | Contenido de la página de historia |
| `careers` | Sección de empleo |
| `faq` | Preguntas frecuentes |
| `seo` | Metadatos SEO por defecto |

## Traducciones Automáticas

Al guardar contenido en **Español**, el hook `autoTranslate` llama a LibreTranslate para traducir automáticamente los campos localizados a **inglés**, **alemán** y **polaco**.

## Publicación

El botón **"Publicar Web"** en el dashboard envía un webhook al Orchestrator (`http://orchestrator:4000/webhook/publish`), que ejecuta el build de Astro y despliega el sitio estático.
