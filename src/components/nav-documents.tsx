'use client'

import {
  IconDots,
  IconFolder,
  IconShare3,
  IconTrash,
  type Icon,
} from '@tabler/icons-react'

import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'

export function NavDocuments({
  items,
  currentPath,
}: {
  items: { name: string; url: string; icon: any; download?: boolean }[]
  currentPath?: string
}) {
  return (
    <SidebarMenu>
      {items.map((item) => (
        <SidebarMenuItem key={item.name}>
          <SidebarMenuButton
            asChild
            isActive={currentPath === item.url}
          >
            <a
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              download={item.download ? "" : undefined}
            >
              <item.icon className="mr-2" />
              {item.name}
            </a>
          </SidebarMenuButton>
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  )
}
