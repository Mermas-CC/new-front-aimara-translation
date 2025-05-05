import { IconTrendingDown, IconTrendingUp } from '@tabler/icons-react'

import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

export function SectionCards() {
  return (
    <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
      {/* Usuarios Registrados */}
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Validaciones</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            8
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <IconTrendingUp />
              +2 hoy
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Validaciones completadas <IconTrendingUp className="size-4" />
          </div>
          <div className="text-muted-foreground">
            Palabras validadas esta semana
          </div>
        </CardFooter>
      </Card>

      {/* Palabras Pendientes */}
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Validaciones</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            8
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <IconTrendingUp />
              +2 hoy
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Validaciones completadas <IconTrendingUp className="size-4" />
          </div>
          <div className="text-muted-foreground">
            Palabras validadas esta semana
          </div>
        </CardFooter>
      </Card>

      {/* Interacciones Totales */}

      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Validaciones</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            8
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <IconTrendingUp />
              +2 hoy
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Validaciones completadas <IconTrendingUp className="size-4" />
          </div>
          <div className="text-muted-foreground">
            Palabras validadas esta semana
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
