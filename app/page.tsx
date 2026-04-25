import { Orbitron } from 'next/font/google';
import VideoCarousel from './components/VideoCarousel';

const orbitron = Orbitron({ subsets: ['latin'], weight: ['400', '700', '900'] });

export default function Home() {
  // Lista de videos para el carrusel automático (sin interacción manual)
  const videos = [
    { id: 1, title: "DRONE VIEW", url: "/videos/ferrari_parking.mp4", label: "Vista Aérea" },
    { id: 2, title: "ROBOT ACTION", url: "/videos/ferrari_salida.mp4", label: "Automatización" },
  ];

  return (
      <div className={`bg-black text-white ${orbitron.className}`}>

        {/* SECCIÓN HERO - Estilo Ferrari */}
        <section id="inicio" className="relative h-screen w-full overflow-hidden">
          <VideoCarousel videos={videos} />

          {/* Overlay Gradiente para mejorar legibilidad */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black" />
          {/* Contenido Hero */}
          <div className="relative z-10 flex h-full flex-col justify-center px-8 md:px-10">
            <h1 className="max-w-4xl text-5xl font-black leading-tight tracking-tighter md:text-6xl">
              SISTEMA DE GESTION DE PARQUEADEROS <br />
            </h1>
            <p className="mt-8 max-w-xl text-lg font-light tracking-widest text-gray-300">
              <strong className="font-bold">NextPark:</strong> TU ESPACIO URBANO, OPTIMIZADO PARA EL MAÑANA.
            </p>

            <div className="mt-12">
              <button className="group relative overflow-hidden border border-white px-10 py-4 transition-all hover:bg-white">
              <span className="relative z-10 text-sm font-bold tracking-widest group-hover:text-black">
                EXPLORAR SOLUCIONES
              </span>
              </button>
            </div>
          </div>


          {/* Indicador de Scroll */}
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce">
            <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 13l-7 7-7-7m14-8l-7 7-7-7" />
            </svg>
          </div>
        </section>

        {/* SECCIÓN QUIÉNES SOMOS - Contraste Blanco */}
        <section id="nosotros" className="bg-white py-28 text-black">
          <div className="container mx-auto grid grid-cols-1 items-center gap-16 px-8 md:grid-cols-2">
            <div>
              <h2 className="text-sm font-bold tracking-[0.4em] text-gray-500 uppercase">Innovación</h2>
              <h3 className="mt-4 text-4xl font-black md:text-6xl uppercase leading-none">
                Ingeniería <br /> de precisión <br /> en cada plaza.
              </h3>
              <p className="mt-6 text-lg leading-relaxed text-gray-700">
                En <strong>NextPark</strong>, diseñamos un ecosistema digital para que las empresas administren
                parqueaderos de forma centralizada, segura y escalable. Nuestra propuesta combina operación en tiempo
                real, analítica avanzada y automatización para elevar la experiencia de clientes y equipos internos.
              </p>
              <div className="mt-8 h-1 w-20 bg-black" />
            </div>
            <div className="relative overflow-hidden rounded-3xl border border-gray-200 bg-gray-50 p-10">
              <img src="/globe.svg" alt="Ecosistema digital" className="h-28 w-28" />
              <p className="mt-6 text-base uppercase tracking-[0.35em] text-gray-500">Ecosistema en la nube</p>
              <p className="mt-4 text-lg text-gray-700">
                Una sola plataforma para múltiples sedes, con acceso desde cualquier dispositivo.
              </p>
            </div>
          </div>
        </section>

        {/* SECCIÓN DESCRIPCIÓN DEL PROYECTO */}
        <section id="descripcion" className="bg-black py-24 text-white">
          <div className="container mx-auto flex flex-col gap-12 px-8">
            <header className="max-w-3xl">
              <h2 className="text-sm font-bold tracking-[0.4em] text-gray-400 uppercase">Proyecto</h2>
              <h3 className="mt-4 text-4xl font-black md:text-5xl uppercase leading-none">
                Plataforma SaaS para la gestión integral de parqueaderos.
              </h3>
              <p className="mt-6 text-lg leading-relaxed text-gray-300">
                NextPark permite centralizar operación, usuarios, ingresos y disponibilidad desde un único tablero,
                eliminando procesos manuales y software local. La solución es 100% web y funciona en celular, tableta
                o computador con una interfaz clara para personal operativo y administrativo.
              </p>
            </header>

            <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
                <h4 className="text-sm font-bold uppercase tracking-[0.3em] text-gray-400">Centralización</h4>
                <p className="mt-4 text-lg text-gray-200">
                  Gestiona uno o varios parqueaderos en un mismo ecosistema digital, con información actualizada y
                  operaciones sincronizadas.
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
                <h4 className="text-sm font-bold uppercase tracking-[0.3em] text-gray-400">Acceso inmediato</h4>
                <p className="mt-4 text-lg text-gray-200">
                  Experiencia rápida y moderna desde cualquier dispositivo con conexión a internet.
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
                <h4 className="text-sm font-bold uppercase tracking-[0.3em] text-gray-400">Escalabilidad</h4>
                <p className="mt-4 text-lg text-gray-200">
                  Diseñado para crecer con la empresa, sin fricción operativa ni límites de expansión.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* SECCIÓN ROLES */}
        <section className="bg-white py-24 text-black">
          <div className="container mx-auto grid grid-cols-1 gap-12 px-8 md:grid-cols-2">
            <div className="rounded-3xl border border-gray-200 bg-gray-50 p-8">
              <h3 className="text-2xl font-black uppercase">Vigilante</h3>
              <p className="mt-4 text-lg text-gray-700">
                Acceso a las funciones operativas esenciales para mantener el flujo del parqueadero.
              </p>
              <ul className="mt-6 space-y-3 text-gray-700">
                <li>Registro de entradas y salidas.</li>
                <li>Generación de ticket y cobro.</li>
                <li>Consulta de disponibilidad por nivel o piso.</li>
              </ul>
            </div>
            <div className="rounded-3xl border border-gray-900 bg-black p-8 text-white">
              <h3 className="text-2xl font-black uppercase">Administrador</h3>
              <p className="mt-4 text-lg text-gray-300">
                Control total del negocio con analítica, configuración de tarifas y reportes financieros.
              </p>
              <ul className="mt-6 space-y-3 text-gray-300">
                <li>Gestión de tarifas y tipos de vehículo.</li>
                <li>Administración de personal de vigilancia.</li>
                <li>Reportes financieros y análisis por periodos.</li>
              </ul>
            </div>
          </div>
        </section>

        {/* SECCIÓN INTELIGENCIA Y DATOS */}
        <section className="bg-black py-24 text-white">
          <div className="container mx-auto grid grid-cols-1 items-center gap-16 px-8 md:grid-cols-2">
            <div className="space-y-6">
              <h2 className="text-3xl font-black uppercase md:text-4xl">IA generativa y analítica</h2>
              <p className="text-lg leading-relaxed text-gray-300">
                La plataforma interpreta patrones de ocupación, detecta horas pico y anticipa comportamientos
                futuros. Con IA generativa, entrega recomendaciones automáticas sobre tarifas, optimización de
                espacios y asignación de recursos, convirtiendo datos en decisiones accionables.
              </p>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                  <p className="text-sm font-bold uppercase tracking-[0.3em] text-gray-400">Dashboard</p>
                  <p className="mt-3 text-gray-200">Gráficas de ingresos, ocupación y tendencias.</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                  <p className="text-sm font-bold uppercase tracking-[0.3em] text-gray-400">Predicción</p>
                  <p className="mt-3 text-gray-200">Alertas y recomendaciones para momentos críticos.</p>
                </div>
              </div>
            </div>
            <div className="rounded-3xl border border-white/10 bg-white/5 p-10">
              <img src="/file.svg" alt="Analítica de datos" className="h-28 w-28" />
              <p className="mt-6 text-base uppercase tracking-[0.35em] text-gray-400">Data-driven</p>
              <p className="mt-4 text-lg text-gray-200">
                Reportes del último mes, 3 meses, 6 meses y el último año en el plan premium.
              </p>
            </div>
          </div>
        </section>

        {/* SECCIÓN OPERACIÓN AVANZADA */}
        <section className="bg-white py-24 text-black">
          <div className="container mx-auto flex flex-col gap-12 px-8">
            <header className="max-w-3xl">
              <h2 className="text-sm font-bold tracking-[0.4em] text-gray-500 uppercase">Operación avanzada</h2>
              <h3 className="mt-4 text-4xl font-black uppercase leading-none">Automatización y control total</h3>
            </header>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              <div className="rounded-3xl border border-gray-200 bg-gray-50 p-6">
                <h4 className="text-lg font-bold">Facturación digital</h4>
                <p className="mt-3 text-gray-700">
                  Generación de comprobantes digitales para mayor formalidad y transparencia.
                </p>
              </div>
              <div className="rounded-3xl border border-gray-200 bg-gray-50 p-6">
                <h4 className="text-lg font-bold">Modo multi-sede</h4>
                <p className="mt-3 text-gray-700">
                  Gestión centralizada o independiente de múltiples ubicaciones.
                </p>
              </div>
              <div className="rounded-3xl border border-gray-200 bg-gray-50 p-6">
                <h4 className="text-lg font-bold">Notificaciones inteligentes</h4>
                <p className="mt-3 text-gray-700">
                  Alertas automáticas al alcanzar umbrales de ocupación.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* SECCIÓN ÚNETENOS */}
        <section id="unetenos" className="bg-black py-24 text-white">
          <div className="container mx-auto grid grid-cols-1 items-center gap-12 px-8 md:grid-cols-2">
            <div>
              <h2 className="text-sm font-bold tracking-[0.4em] text-gray-400 uppercase">Únetenos</h2>
              <h3 className="mt-4 text-4xl font-black uppercase leading-none md:text-5xl">
                Elige el plan ideal para tu operación.
              </h3>
              <p className="mt-6 text-lg leading-relaxed text-gray-300">
                Abre una nueva ventana con los planes disponibles y continúa con el proceso de pago de forma segura.
              </p>
            </div>
            <div className="rounded-3xl border border-white/10 bg-white/5 p-10">
              <p className="text-sm font-bold uppercase tracking-[0.3em] text-gray-400">Planes SaaS</p>
              <p className="mt-4 text-lg text-gray-200">
                Básico, Pro y Premium con analítica avanzada, multi-sede y recomendaciones de IA.
              </p>
              <a
                href="/planes"
                target="_blank"
                rel="noreferrer"
                className="mt-8 inline-flex items-center justify-center border border-white px-8 py-3 text-sm font-bold tracking-widest transition-colors hover:bg-white hover:text-black"
              >
                VER PLANES
              </a>
            </div>
          </div>
        </section>

        {/* FOOTER SIMPLE */}
        <footer className="border-t border-white/10 py-10 text-center text-[10px] tracking-[0.3em] text-gray-500">
          © 2026 NEXTPARK SYSTEMS ENGINE. TODOS LOS DERECHOS RESERVADOS.
        </footer>
      </div>
  );
}