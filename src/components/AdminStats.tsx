import React, { useEffect, useState } from "react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, BarChart3 } from "lucide-react"
import { Bar, Line } from "react-chartjs-2"
import "chart.js/auto"

const API_URL = import.meta.env.VITE_API_URL

type Stats = {
  validaciones_por_dia: { dia: string; total: number }[]
  usuarios_activos_por_dia: { dia: string; total: number }[]
  total_validaciones: number
  total_usuarios_activos: number
}

export default function AdminStats() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchStats() {
      setLoading(true)
      setError(null)
      try {
        const res = await fetch(`${API_URL}/api/admin/stats`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        })
        if (!res.ok) throw new Error("No se pudieron cargar las estadísticas.")
        const data = await res.json()
        setStats(data)
      } catch (e: any) {
        setStats(null)
        setError(e.message || "No se pudieron cargar las estadísticas.")
      }
      setLoading(false)
    }
    fetchStats()
  }, [])

  if (loading)
    return (
      <Card className="max-w-5xl mx-auto my-8">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
          <p className="text-muted-foreground">Cargando estadísticas...</p>
        </CardContent>
      </Card>
    )

  if (error || !stats)
    return (
      <Card className="max-w-5xl mx-auto my-8 border-destructive/50">
        <CardContent className="py-8">
          <Alert variant="destructive">
            <AlertDescription>{error || "No se pudieron cargar las estadísticas."}</AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )

  const barData = {
    labels: stats.validaciones_por_dia.map((a) => a.dia),
    datasets: [
      {
        label: "Validaciones totales por día",
        data: stats.validaciones_por_dia.map((a) => a.total),
        backgroundColor: "#009fb4",
        borderRadius: 6,
        barPercentage: 0.6,
      },
    ],
  }

  const lineData = {
    labels: stats.usuarios_activos_por_dia.map((a) => a.dia),
    datasets: [
      {
        label: "Usuarios activos por día",
        data: stats.usuarios_activos_por_dia.map((a) => a.total),
        borderColor: "#00b4cc",
        backgroundColor: "rgba(0,180,204,0.1)",
        tension: 0.3,
        fill: true,
        pointRadius: 3,
      },
    ],
  }

  return (
    <Card className="w-full my-8 border-t-4 border-t-primary shadow px-4">
      <CardHeader>
        <div className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-primary" />
          <CardTitle>Estadísticas Globales</CardTitle>
        </div>
        <CardDescription>
          Visualiza la actividad global de validación y usuarios activos en el sistema.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        <div className="flex flex-col lg:flex-row gap-6 w-full">
          {/* Gráfico de validaciones por día */}
          <div className="flex-1 w-full">
            <h3 className="text-lg font-semibold mb-2">Validaciones por día (últimos 7 días)</h3>
            <Bar data={barData} options={{ plugins: { legend: { position: "bottom" } }, responsive: true }} />
            <div className="mt-2 text-muted-foreground text-sm">
              Total validaciones: <span className="font-semibold text-foreground">{stats.total_validaciones}</span>
            </div>
          </div>
          {/* Gráfico de usuarios activos por día */}
          <div className="flex-1 w-full">
            <h3 className="text-lg font-semibold mb-2">Usuarios activos por día (últimos 7 días)</h3>
            <Line data={lineData} options={{ plugins: { legend: { position: "bottom" } }, responsive: true }} />
            <div className="mt-2 text-muted-foreground text-sm">
              Total usuarios activos: <span className="font-semibold text-foreground">{stats.total_usuarios_activos}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
