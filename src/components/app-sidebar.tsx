import * as React from 'react'
import {
  IconCamera,
  IconChartBar,
  IconDashboard,
  IconDatabase,
  IconFileAi,
  IconFileDescription,
  IconFileWord,
  IconFolder,
  IconHelp,
  IconListDetails,
  IconReport,
  IconSearch,
  IconSettings,
  IconUsers,
} from '@tabler/icons-react'

import { NavDocuments } from '@/components/nav-documents'
import { NavMain } from '@/components/nav-main'
import { NavUser } from '@/components/nav-user'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'
import Logo from '@/assets/logo_color.png'
import { useAuth } from '@/context/AuthContext'
import { useLocation } from "react-router-dom"

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user } = useAuth()
  const location = useLocation()

  // Opciones para admin
  const navMainAdmin = [
    {
      title: 'Dashboard',
      url: '/dashboard',
      icon: IconDashboard,
    },
    {
      title: 'Ver traducciones',
      url: '/palabras-versiones',
      icon: IconListDetails,
    },
    {
      title: 'Administración de usuarios',
      url: '/admin-panel',
      icon: IconUsers,
    },
  ]

  // Opciones para validador
  const navMainValido = [
    {
      title: 'Dashboard',
      url: '/validador-dashboard',
      icon: IconDashboard,
    },

  ]

  // Documentos solo para admin (ajusta si quieres que los validadores también lo vean)
  const documentsAdmin = [
    {
      name: 'Descargar corpus',
      url: `${import.meta.env.VITE_API_URL}/descargar-json`,
      icon: IconDatabase,
      download: true,
    },
  ]

  // Datos de usuario (obtenidos del contexto real)
  const userData = {
    name: user?.nombre || user?.name || user?.username || user?.email || 'Usuario',
    email: user?.email || '',
    avatar: user?.avatar || '/avatars/shadcn.jpg',
  }

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <a href="#">
                <img src={Logo} alt="Logo aimara" className="h-8" />
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        {user?.rol === 'admin' && (
          <>
            <NavMain items={navMainAdmin} currentPath={location.pathname} />
            <NavDocuments items={documentsAdmin} currentPath={location.pathname} />
          </>
        )}
        {user?.rol === 'valido' && (
          <>
            <NavMain items={navMainValido} currentPath={location.pathname} />
          </>
        )}
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={userData} />
      </SidebarFooter>
    </Sidebar>
  )
}
