'use client';

import Link from 'next/link';
import { useEffect, useState, useRef } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Orbitron } from 'next/font/google';
import type { User } from '@supabase/supabase-js';
import { supabase } from '../../lib/supabase/client';

const orbitron = Orbitron({ subsets: ['latin'], weight: ['400', '700', '900'] });

type PanelRole = 'loading' | 'admin' | 'vigilante' | 'none';

export default function PanelLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [panelRole, setPanelRole] = useState<PanelRole>('loading');
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const tenantId = searchParams.get('tenant');

  useEffect(() => {
    let isMounted = true;

    const loadSessionAndRole = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!isMounted) {
        return;
      }

      if (!session) {
        setUser(null);
        setPanelRole('none');
        router.push('/');
        return;
      }

      setUser(session.user);

      if (pathname.startsWith('/panel/vigilante')) {
        setPanelRole('vigilante');
        return;
      }

      if (tenantId) {
        const { data: tenantUser } = await supabase
          .from('tenant_users')
          .select('role')
          .eq('tenant_id', tenantId)
          .eq('user_id', session.user.id)
          .eq('active', true)
          .maybeSingle();

        if (!isMounted) {
          return;
        }

        setPanelRole(tenantUser?.role === 'admin' ? 'admin' : tenantUser?.role === 'vigilante' ? 'vigilante' : 'none');
        return;
      }

      const { data: tenantRoles } = await supabase
        .from('tenant_users')
        .select('role')
        .eq('user_id', session.user.id)
        .eq('active', true);

      if (!isMounted) {
        return;
      }

      const hasAdmin = tenantRoles?.some((entry) => entry.role === 'admin');
      const hasVigilante = tenantRoles?.some((entry) => entry.role === 'vigilante');

      if (hasAdmin) {
        setPanelRole('admin');
        return;
      }

      if (hasVigilante) {
        setPanelRole('vigilante');
        return;
      }

      setPanelRole('none');
    };

    void loadSessionAndRole();

    // Cerrar dropdown al hacer click fuera
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      isMounted = false;
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [pathname, router, tenantId]);

  useEffect(() => {
    if (panelRole !== 'vigilante') {
      return;
    }

    if (pathname.startsWith('/panel/admin') && !pathname.includes('/contabilidad')) {
      router.replace('/panel/vigilante');
    }
  }, [panelRole, pathname, router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  const adminMenuItems = [
    { label: 'Inicio', href: '/panel/admin/inicio', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
    { label: 'Gestion de parqueaderos', href: '/panel/admin/gestion', icon: 'M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4' },
    { label: 'Personal', href: '/panel/admin/personal', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z' },
    { label: 'Tarifas', href: '/panel/admin/tarifas', icon: 'M9 8h6m-5 0a3 3 0 110 6H9l3 3m-3-6h6m6 1a9 9 0 11-18 0 9 9 0 0118 0z' },
    { label: 'Contabilidad', href: '/panel/admin/contabilidad', icon: 'M3 3h18v18H3V3zm4 12h2V9H7v6zm4 0h2V6h-2v9zm4 0h2v-4h-2v4z' },
  ];

  const vigilanteMenuItems = [
    { label: 'Terminal operativa', href: '/panel/vigilante', icon: 'M3 12h18M3 6h18M3 18h18' },
    { label: 'Contabilidad', href: '/panel/admin/contabilidad', icon: 'M3 3h18v18H3V3zm4 12h2V9H7v6zm4 0h2V6h-2v9zm4 0h2v-4h-2v4z' },
  ];

  const menuItems = panelRole === 'vigilante' ? vigilanteMenuItems : adminMenuItems;
  const profileRoleLabel = panelRole === 'vigilante' ? 'Vigilante' : panelRole === 'admin' ? 'Administrador' : 'Sin rol';

  return (
    <div className="flex min-h-screen bg-[#FBFBFB]">
      {/* SIDEBAR - COLOR NEGRO ABSOLUTO */}
      <aside 
        className={`fixed inset-y-0 left-0 z-50 bg-black text-white transition-all duration-300 ease-in-out border-r border-white/5 ${
          isSidebarOpen ? 'w-72' : 'w-20'
        }`}
      >
        <div className="flex h-[73px] items-center px-6">
          <button 
            onClick={() => setSidebarOpen(!isSidebarOpen)}
            className="text-white hover:opacity-70 transition-opacity"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <span className={`${orbitron.className} ml-6 text-xs font-black tracking-[0.3em] overflow-hidden transition-all duration-300 ${isSidebarOpen ? 'w-auto opacity-100' : 'w-0 opacity-0'}`}>
            MENÚ
          </span>
        </div>

        <nav className="mt-8 space-y-2 px-3">
          {menuItems.map((item) => (
            <Link 
              key={item.href} 
              href={item.href} 
              className={`flex items-center gap-4 rounded-xl px-4 py-4 transition-all ${
                pathname === item.href
                  ? 'bg-white text-black'
                  : 'text-gray-500 hover:bg-white/5 hover:text-white'
              }`}
            >
              <svg className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={item.icon} />
              </svg>
              <span className={`text-[10px] font-black uppercase tracking-[0.2em] whitespace-nowrap transition-opacity duration-300 ${isSidebarOpen ? 'opacity-100' : 'hidden'}`}>
                {item.label}
              </span>
            </Link>
          ))}
        </nav>
      </aside>

      <div className={`flex flex-1 flex-col transition-all duration-300 ${isSidebarOpen ? 'ml-72' : 'ml-20'}`}>
        {/* NAVBAR - COLOR NEGRO ABSOLUTO (py-4) */}
        <header className={`${orbitron.className} sticky top-0 z-40 w-full border-b border-white/5 bg-black`}>
          <div className="flex items-center justify-between px-8 py-4">
            <Link href="/panel" className="text-lg font-bold tracking-widest text-gray-300 hover:text-white transition-colors">
              NextPark
            </Link>

            {/* PERFIL CON POPUP */}
            <div className="relative" ref={dropdownRef}>
              <button 
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center gap-4 group focus:outline-none"
              >
                <div className="text-right hidden sm:block">
                  <p className="text-[10px] font-black uppercase tracking-widest text-white group-hover:text-gray-300 transition-colors">
                    {user?.user_metadata?.full_name || user?.email?.split('@')[0]}
                  </p>
                  <p className="text-[8px] font-bold text-gray-500 uppercase tracking-tighter">{profileRoleLabel}</p>
                </div>
                <div className="h-10 w-10 rounded-full border border-white/10 bg-white/5 flex items-center justify-center text-[11px] font-black text-white group-hover:bg-white group-hover:text-black transition-all">
                  {user?.email?.charAt(0).toUpperCase() || 'U'}
                </div>
              </button>

              {/* DROPDOWN MENU */}
              {isProfileOpen && (
                <div className="absolute right-0 mt-3 w-56 rounded-2xl border border-white/10 bg-black p-2 shadow-2xl">
                  <div className="px-4 py-3 border-b border-white/5 mb-2">
                    <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Cuenta</p>
                    <p className="text-[11px] font-bold text-white truncate">{user?.email}</p>
                  </div>
                  <button className="w-full text-left px-4 py-3 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:bg-white/5 hover:text-white rounded-xl transition-all">
                    Perfil
                  </button>
                  <button className="w-full text-left px-4 py-3 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:bg-white/5 hover:text-white rounded-xl transition-all">
                    Información del Plan
                  </button>
                  <button className="w-full text-left px-4 py-3 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:bg-white/5 hover:text-white rounded-xl transition-all">
                    Configuración
                  </button>
                  <div className="mt-2 border-t border-white/5 pt-2">
                    <button 
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-3 text-[10px] font-black uppercase tracking-widest text-red-500 hover:bg-red-500/10 rounded-xl transition-all"
                    >
                      Cerrar Sesión
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="p-8 lg:p-12">
          {children}
        </main>
      </div>
    </div>
  );
}