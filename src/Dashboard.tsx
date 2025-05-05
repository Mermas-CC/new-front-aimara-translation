"use client"

import type React from "react"

import { useEffect, useState, useRef } from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import {
  Loader2,
  AlertTriangle,
  Users,
  Clock,
  BarChart3,
  Calendar,
  MessageSquare,
  User,
  PauseCircle,
  PlayCircle,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import AdminStats from "@/components/AdminStats"

const API_URL = import.meta.env.VITE_API_URL || ""

type Metrica = {
  total_usuarios: number
  palabras_pendientes: number
  total_interacciones: number
}

type ActividadReciente = {
  validador: string
  termino: string
  fecha_formateada: string
  comentario: string
  pronunciacion_clip_url: string
}

type DashboardData = {
  metricas: Metrica
  actividad_reciente: ActividadReciente[]
}

export default function AdminDashboard() {
  const [data, setData] = useState<DashboardData>({ metricas: {} as Metrica, actividad_reciente: [] })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Estado para saber cuál audio está reproduciéndose
  const [playingIndex, setPlayingIndex] = useState<number | null>(null)
  const audioRefs = useRef<(HTMLAudioElement | null)[]>([])

  useEffect(() => {
    // Cambiar el estado de carga y limpiar errores al iniciar la solicitud
    setLoading(true)
    setError(null)

    fetch(`${API_URL}/api/admin/dashboard`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`, // Aquí usas el token guardado en localStorage
        "Content-Type": "application/json",
      },
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error(`Error al cargar datos: ${res.status} ${res.statusText}`)
        }
        return res.json()
      })
      .then((data) => {
        console.log(data) // Verifica la respuesta de la API
        setData({
          metricas: data.metricas || ({} as Metrica),
          actividad_reciente: data.actividad_reciente || [],
        })
        setLoading(false)
      })
      .catch((err) => {
        console.error("Error fetching dashboard data:", err)
        setError(err.message || "Ha ocurrido un error al cargar los datos")
        setLoading(false)
      })
  }, [])

  // Detener otros audios cuando uno se reproduce
  const handlePlay = (idx: number) => {
    setPlayingIndex(idx)
    audioRefs.current.forEach((ref, i) => {
      if (ref && i !== idx) {
        ref.pause()
        ref.currentTime = 0
      }
    })
  }

  // Cuando termina el audio, quitar el highlight
  const handleEnded = () => setPlayingIndex(null)

  // Función para formatear números grandes
  const formatNumber = (num: number) => {
    if (num === undefined || num === null) return "0"
    return new Intl.NumberFormat().format(num)
  }

  return (
    <SidebarProvider>
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6 px-4 md:px-6">
              {loading ? (
                <div className="flex justify-center items-center h-[60vh]">
                  <Card className="w-full max-w-md p-6">
                    <CardContent className="flex flex-col items-center justify-center pt-6">
                      <div className="relative">
                        <Loader2 className="h-12 w-12 animate-spin text-primary" />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="h-3 w-3 rounded-full bg-primary"></div>
                        </div>
                      </div>
                      <h3 className="mt-4 text-xl font-medium">Cargando dashboard</h3>
                      <p className="mt-2 text-center text-muted-foreground">
                        Estamos recuperando los datos del panel. Esto puede tomar un momento...
                      </p>
                    </CardContent>
                  </Card>
                </div>
              ) : error ? (
                <Card className="max-w-md mx-auto border-destructive/50">
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5 text-destructive" />
                      <CardTitle className="text-destructive">Error al cargar datos</CardTitle>
                    </div>
                    <CardDescription>No se pudieron cargar los datos del dashboard</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-center mb-4">{error}</p>
                  </CardContent>
                  <CardFooter className="flex justify-center">
                    <Button onClick={() => window.location.reload()}>Reintentar</Button>
                  </CardFooter>
                </Card>
              ) : (
                <div className="space-y-6">
                  {/* Estadísticas globales para administradores */}
                  <AdminStats />
                  <Card className="overflow-hidden border-t-4 border-t-primary">
                    <CardHeader className="pb-2">
                      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                        <div>
                          <CardTitle className="text-2xl">Panel de Administración</CardTitle>
                          <CardDescription>Resumen de actividad y métricas del sistema</CardDescription>
                        </div>
                        <Badge variant="outline" className="font-normal">
                          <Clock className="h-3.5 w-3.5 mr-1" />
                          Última actualización: {new Date().toLocaleTimeString()}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="p-6">
                      {/* Sección de métricas principales */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                        <MetricCard
                          icon={<Users className="h-5 w-5" />}
                          title="Usuarios Registrados"
                          value={formatNumber(data.metricas?.total_usuarios)}
                          description="Total de usuarios en el sistema"
                          trend={"+5% este mes"}
                        />
                        <MetricCard
                          icon={<Clock className="h-5 w-5" />}
                          title="Palabras Pendientes"
                          value={formatNumber(data.metricas?.palabras_pendientes)}
                          description="Palabras esperando validación"
                          trend={"-2% desde ayer"}
                        />
                        <MetricCard
                          icon={<BarChart3 className="h-5 w-5" />}
                          title="Interacciones Totales"
                          value={formatNumber(data.metricas?.total_interacciones)}
                          description="Validaciones y traducciones"
                          trend={"+12% este mes"}
                        />
                      </div>

                      {/* Tabla de actividad reciente */}
                      <div className="rounded-md border">
                        <div className="bg-muted/50 p-3 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <h2 className="text-lg font-medium">Actividad Reciente</h2>
                          </div>
                          <Badge variant="outline">{data.actividad_reciente.length} registros</Badge>
                        </div>

                        {data.actividad_reciente.length > 0 ? (
                          <div className="overflow-x-auto">
                            <Table>
                              <TableHeader>
                                <TableRow className="hover:bg-transparent">
                                  <TableHead className="w-[20%]">Validador</TableHead>
                                  <TableHead className="w-[20%]">Término</TableHead>
                                  <TableHead className="w-[15%]">Fecha</TableHead>
                                  <TableHead className="w-[35%]">Comentario</TableHead>
                                  <TableHead className="w-[10%] text-center">Audio</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {data.actividad_reciente.map((item, i) => (
                                  <TableRow key={i} className="group">
                                    <TableCell>
                                      <div className="flex items-center gap-2">
                                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                                          <User className="h-4 w-4 text-primary" />
                                        </div>
                                        <span className="font-medium">{item.validador}</span>
                                      </div>
                                    </TableCell>
                                    <TableCell className="font-medium">{item.termino || "-"}</TableCell>
                                    <TableCell className="text-muted-foreground">
                                      {item.fecha_formateada || "Fecha no disponible"}
                                    </TableCell>
                                    <TableCell>
                                      <div className="flex items-start gap-1.5 max-w-xs">
                                        <MessageSquare className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                                        <span className="line-clamp-2">
                                          {item.comentario || (
                                            <span className="text-muted-foreground italic">Sin comentario</span>
                                          )}
                                        </span>
                                      </div>
                                    </TableCell>
                                    <TableCell className="text-center">
                                      {item.pronunciacion_clip_url ? (
                                        <TooltipProvider>
                                          <Tooltip>
                                            <TooltipTrigger asChild>
                                              <Button
                                                variant={playingIndex === i ? "default" : "outline"}
                                                size="icon"
                                                className={`h-8 w-8 rounded-full ${
                                                  playingIndex === i ? "animate-pulse" : ""
                                                }`}
                                                onClick={() => {
                                                  const audioRef = audioRefs.current[i]
                                                  if (!audioRef) return

                                                  if (audioRef.paused || audioRef.ended) {
                                                    handlePlay(i)
                                                    audioRef.play()
                                                  } else {
                                                    audioRef.pause()
                                                    setPlayingIndex(null)
                                                  }
                                                }}
                                              >
                                                {playingIndex === i ? (
                                                  <PauseCircle className="h-4 w-4" />
                                                ) : (
                                                  <PlayCircle className="h-4 w-4" />
                                                )}
                                              </Button>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                              <p>{playingIndex === i ? "Pausar reproducción" : "Reproducir audio"}</p>
                                            </TooltipContent>
                                          </Tooltip>
                                        </TooltipProvider>
                                      ) : (
                                        <span className="text-muted-foreground text-sm italic">Sin audio</span>
                                      )}
                                      <audio
                                        ref={(el) => {
                                          audioRefs.current[i] = el
                                        }}
                                        src={
                                          item.pronunciacion_clip_url?.startsWith("http")
                                            ? item.pronunciacion_clip_url
                                            : `${API_URL}${item.pronunciacion_clip_url}`
                                        }
                                        onPlay={() => handlePlay(i)}
                                        onPause={handleEnded}
                                        onEnded={handleEnded}
                                        style={{ display: "none" }}
                                      />
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                            <Calendar className="h-12 w-12 text-muted-foreground mb-4 opacity-50" />
                            <h3 className="text-lg font-medium mb-1">No hay actividad reciente</h3>
                            <p className="text-muted-foreground max-w-sm">
                              No se ha registrado actividad reciente en el sistema. Las validaciones y traducciones
                              aparecerán aquí cuando se realicen.
                            </p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}

// Componente MetricCard mejorado
type MetricCardProps = {
  icon: React.ReactNode
  title: string
  value: string | number
  description: string
  trend: string
}

const MetricCard = ({ icon, title, value, description, trend }: MetricCardProps) => {
  // Determinar si la tendencia es positiva, negativa o neutral
  const isTrendPositive = trend.startsWith("+")
  const isTrendNegative = trend.startsWith("-")

  return (
    <Card className="border border-border overflow-hidden">
      <CardContent className="p-6">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1">{title}</p>
            <h3 className="text-3xl font-bold">{value}</h3>
          </div>
          <div className="rounded-full p-2 bg-background border border-border">{icon}</div>
        </div>
        <div className="mt-4 flex items-center justify-between">
          <p className="text-xs text-muted-foreground">{description}</p>
          <Badge
            variant="outline"
            className={`text-xs font-normal ${
              isTrendPositive
                ? "text-emerald-600 bg-emerald-50 border-emerald-200"
                : isTrendNegative
                  ? "text-rose-600 bg-rose-50 border-rose-200"
                  : ""
            }`}
          >
            {trend}
          </Badge>
        </div>
      </CardContent>
    </Card>
  )
}
