import React, { useEffect, useState } from "react"
import { useAuth } from "@/context/AuthContext"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, BarChart3 } from "lucide-react"
import { Bar } from "react-chartjs-2"
import "chart.js/auto"

const API_URL = import.meta.env.VITE_API_URL

type Stats = {
  actividad_por_dia: { dia: string; usuario: number; promedio: number }[]
  total_usuario: number
  promedio_total: number
  max_usuario: number
}

export default function ValidadorStats() {
  const { token } = useAuth()
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchStats() {
      setLoading(true)
      setError(null)
      try {
        const res = await fetch(`${API_URL}/api/validador/stats`, {
          headers: { Authorization: `Bearer ${token}` },
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
    if (token) fetchStats()
  }, [token])

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
    labels: stats.actividad_por_dia.map((a) => a.dia),
    datasets: [
      {
        label: "Tus validaciones",
        data: stats.actividad_por_dia.map((a) => a.usuario),
        backgroundColor: "#00b4cc",
        borderRadius: 6,
        barPercentage: 0.6,
      },
      {
        label: "Promedio usuarios",
        data: stats.actividad_por_dia.map((a) => a.promedio),
        backgroundColor: "#a3a3a3",
        borderRadius: 6,
        barPercentage: 0.6,
      },
    ],
  }

  const resumenData = {
    labels: ["Tus validaciones", "Promedio usuarios", "Usuario más activo"],
    datasets: [
      {
        label: "Total",
        data: [stats.total_usuario, stats.promedio_total, stats.max_usuario],
        backgroundColor: ["#00b4cc", "#a3a3a3", "#009fb4"],
        borderRadius: 6,
        barPercentage: 0.6,
      },
    ],
  }

  return (
    <Card className="w-full my-8 border-t-4 border-t-primary shadow px-4">
    <CardHeader>
      <div className="flex items-center gap-2">
        <BarChart3 className="h-5 w-5 text-primary" />
        <CardTitle>Comparativa de tu Actividad</CardTitle>
      </div>
      <CardDescription>
        Visualiza tu actividad de validación comparada con otros usuarios.
      </CardDescription>
    </CardHeader>
    <CardContent className="space-y-8">
      <div className="flex flex-col lg:flex-row gap-6 w-full">
        {/* Gráfico de validaciones por día */}
        <div className="flex-1 w-full">
          <h3 className="text-lg font-semibold mb-2">Validaciones por día (últimos 7 días)</h3>
          <Bar data={barData} options={{ plugins: { legend: { position: "bottom" } }, responsive: true }} />
        </div>
  
        {/* Gráfico de resumen */}
        <div className="flex-1 w-full">
          <h3 className="text-lg font-semibold mb-2">Resumen de actividad</h3>
          <Bar
            data={resumenData}
            options={{
              indexAxis: "y",
              plugins: { legend: { display: false } },
              responsive: true,
            }}
          />
          <ul className="mt-4 text-muted-foreground text-sm space-y-1">
            <li>
              <span className="font-medium text-foreground">Tus validaciones:</span> {stats.total_usuario}
            </li>
            <li>
              <span className="font-medium text-foreground">Promedio usuarios:</span> {stats.promedio_total}
            </li>
            <li>
              <span className="font-medium text-foreground">Usuario más activo:</span> {stats.max_usuario}
            </li>
          </ul>
        </div>
      </div>
    </CardContent>
  </Card>
  
  )
}
