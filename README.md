# NextPark

Landing page para un sistema de gestion de parqueaderos urbanos. La experiencia se centra en un hero con video, transiciones suaves y secciones informativas sobre la propuesta de valor.

## Contenido

- [Descripcion](#descripcion)
- [Funcionalidades](#funcionalidades)
- [Tecnologias](#tecnologias)
- [Requisitos](#requisitos)
- [Instalacion](#instalacion)
- [Supabase](#supabase)
- [Scripts](#scripts)
- [Estructura](#estructura)
- [Personalizacion](#personalizacion)

## Descripcion

NextPark es un sistema web tipo SaaS para la gestion integral de parqueaderos. La plataforma permite que una empresa centralice la operacion de uno o varios parqueaderos desde un unico ecosistema digital, sin instalaciones locales ni procesos manuales. Al estar en la nube, el sistema se puede usar desde celular, tableta o computador, con una interfaz rapida, moderna e intuitiva para personal operativo y administrativo.

La solucion esta organizada por roles con permisos diferenciados. El vigilante registra entradas y salidas, genera tickets de cobro y consulta disponibilidad de celdas por nivel, sin acceso a datos financieros. El administrador gestiona tarifas, personal, reportes e indicadores del negocio, con analisis por periodos en planes avanzados.

La plataforma incorpora inteligencia artificial generativa para interpretar patrones de ocupacion, detectar horas pico, anticipar comportamientos y sugerir mejoras en tarifas, distribucion de espacios y asignacion de recursos. Ademas, incluye facturacion digital, dashboards con graficas e indicadores, y un modo multi-sede para gestionar varias ubicaciones desde una sola cuenta.

## Funcionalidades

- SaaS multi-sede para administrar varios parqueaderos desde una sola cuenta.
- Roles y permisos: vigilante operativo y administrador con control financiero.
- Control de ingresos y salidas con tickets digitales y facturacion.
- Disponibilidad en tiempo real por nivel o piso.
- Panel de control con graficas de ingresos, ocupacion y tendencias.
- Analitica por periodos (ultimo mes, 3 meses, 6 meses y ultimo ano en planes premium).
- Notificaciones automaticas por umbrales de ocupacion.
- Recomendaciones con IA generativa para optimizar tarifas y recursos.

## Tecnologias

- Next.js (App Router)
- React
- TypeScript
- Tailwind CSS

## Requisitos

- Node.js 18 o superior
- npm (o tu gestor de paquetes preferido)

## Instalacion

```bash
npm install
```

## Supabase

1. Crea un archivo `.env.local` usando `.env.example` como plantilla.
2. Agrega `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` desde tu proyecto en Supabase.
3. El modal de login usa `supabase.auth.signInWithPassword` en `app/components/LoginModal.tsx`.

## Scripts

```bash
npm run dev
npm run build
npm run start
npm run lint
```

## Estructura

```text
app/
  layout.tsx
  page.tsx
  components/
	Navbar.tsx
	VideoCarousel.tsx
	VideoCarousel.module.css
public/
  videos/
```

## Personalizacion

- Edita los textos y secciones en `app/page.tsx`.
- Ajusta el carrusel en `app/components/VideoCarousel.tsx`.
- Reemplaza los videos en `public/videos/` manteniendo los nombres o actualiza la lista en `app/page.tsx`.
