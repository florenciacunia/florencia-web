# Sitio de Florencia Acuña

Sitio estático (HTML, CSS y JS, sin build) para publicar en Vercel desde GitHub, con formulario conectado a Supabase.

## 1. Personalizar (archivo `config.js`)
- `LINKEDIN_URL`: tu perfil de LinkedIn. Si queda vacío, los botones de LinkedIn se ocultan.
- `BOOKING_URL`: enlace de Calendly o Cal.com para el diagnóstico gratis.
- `CONTACT_EMAIL`: mail público (opcional).
- `SUPABASE_URL` y `SUPABASE_ANON_KEY`: en Supabase → Project Settings → API.

Tu foto: guardala como `assets/florencia.jpg` (proporción 4:5, por ejemplo 800×1000). Mientras no esté, se ve el monograma "FA".

## 2. Supabase
1. Creá un proyecto (plan gratuito).
2. SQL Editor → pegá `supabase/schema.sql` → Run.
3. Los mensajes del formulario aparecen en Table Editor → `contact_requests`.

El sitio solo puede insertar mensajes. Nadie desde afuera puede leerlos.

## 3. GitHub y Vercel
1. Subí esta carpeta a un repositorio nuevo de GitHub.
2. En Vercel: Add New → Project → elegí el repositorio. Framework: "Other". No hace falta build command.
3. Cada `git push` republica el sitio.

## 4. LinkedIn
Perfil → Editar → Información de contacto → Sitio web: pegá la URL de Vercel.
Para medir visitas de LinkedIn usá la URL con `?utm_source=linkedin`. El sitio muestra un saludo a quien llega de ahí y guarda el origen en cada mensaje.

## 5. Antes de publicar
Los textos de "Sobre mí", los principios de "Cómo trabajamos juntos" y la lista de servicios son una propuesta: editalos en `index.html` para que digan solo lo que vas a ofrecer. La demo del hero usa datos de ejemplo y está rotulada como tal.
