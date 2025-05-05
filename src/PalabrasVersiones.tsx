"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import {
  ArrowLeft,
  Search,
  ChevronDown,
  Loader2,
  FileText,
  Calendar,
  User,
  CheckCircle,
  AlertCircle,
  Info,
} from "lucide-react"
import { Link } from "react-router-dom"
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table"
import { Card, CardHeader, CardContent, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

const API_URL = import.meta.env.VITE_API_URL

type Version = {
  numero_version: number
  palabra_original: string
  traduccion_es: string
  traduccion_aym: string
  comentario: string
  estado_validacion: string
  validador_id: string
  fecha_validacion: string
}

const PalabrasVersiones = () => {
  const [palabras, setPalabras] = useState<[string, Version[]][]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [openDetails, setOpenDetails] = useState<Record<number, boolean>>({})
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)
        const response = await axios.get(`${API_URL}/palabras/versiones`)
        const agrupadas = response.data.reduce((acc: Record<string, Version[]>, curr: Version) => {
          const palabraOriginal = curr.palabra_original
          if (!acc[palabraOriginal]) {
            acc[palabraOriginal] = []
          }
          acc[palabraOriginal].push(curr)
          return acc
        }, {})
        setPalabras(Object.entries(agrupadas))
      } catch (error) {
        console.error("Error al cargar las palabras:", error)
        setError("No se pudo cargar las palabras. Por favor, inténtalo de nuevo más tarde.")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const toggleDetails = (index: number) => {
    setOpenDetails((prev) => ({ ...prev, [index]: !prev[index] }))
  }

  const filteredPalabras = palabras.filter(([palabraOriginal]) =>
    palabraOriginal.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentPalabras = filteredPalabras.slice(startIndex, endIndex)
  const totalPages = Math.ceil(filteredPalabras.length / itemsPerPage)

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
                      <h3 className="mt-4 text-xl font-medium">Cargando palabras</h3>
                      <p className="mt-2 text-center text-muted-foreground">
                        Estamos recuperando las versiones de palabras. Esto puede tomar un momento...
                      </p>
                    </CardContent>
                  </Card>
                </div>
              ) : error ? (
                <Card className="max-w-md mx-auto border-destructive/50">
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <AlertCircle className="h-5 w-5 text-destructive" />
                      <CardTitle className="text-destructive">Error al cargar datos</CardTitle>
                    </div>
                    <CardDescription>No se pudieron cargar las versiones de palabras</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-center mb-4">{error}</p>
                  </CardContent>
                  <CardFooter className="flex justify-center">
                    <Button asChild>
                      <Link to="/menu">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Volver al Menú
                      </Link>
                    </Button>
                  </CardFooter>
                </Card>
              ) : (
                <div className="space-y-6">
                  <Card className="overflow-hidden border-t-4 border-t-primary">
                    <CardHeader className="pb-2">
                      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                        <div className="flex items-center gap-2">
                          <div>
                            <CardTitle className="text-2xl">Versiones de Palabras</CardTitle>
                            <CardDescription>Historial de traducciones y validaciones de palabras</CardDescription>
                          </div>
                        </div>
                        <div className="relative w-full sm:w-64">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
                          <Input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => {
                              setSearchTerm(e.target.value)
                              setCurrentPage(1)
                            }}
                            placeholder="Buscar palabra"
                            className="pl-9"
                          />
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="p-6">
                      {filteredPalabras.length > 0 && (
                        <div className="flex items-center justify-between mb-4">
                          <p className="text-sm text-muted-foreground">
                            Mostrando {currentPalabras.length} de {filteredPalabras.length} palabras
                          </p>
                          <Badge variant="outline" className="font-normal">
                            Total: {filteredPalabras.length} palabras
                          </Badge>
                        </div>
                      )}

                      {currentPalabras.length === 0 ? (
                        <div className="text-center py-12 border rounded-lg bg-muted/30">
                          <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-50" />
                          <h3 className="text-lg font-medium mb-1">No hay datos disponibles</h3>
                          <p className="text-muted-foreground">
                            {searchTerm
                              ? `No se encontraron resultados para "${searchTerm}"`
                              : "No hay versiones de palabras para mostrar"}
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {currentPalabras.map(([palabraOriginal, versiones], index) => {
                            const globalIndex = startIndex + index
                            const isOpen = openDetails[globalIndex]
                            return (
                              <Card
                                key={globalIndex}
                                className={`overflow-hidden transition-all duration-200 ${
                                  isOpen ? "border-primary/50 shadow-md" : ""
                                }`}
                              >
                                <div
                                  className={`flex justify-between items-center p-4 cursor-pointer transition-colors ${
                                    isOpen ? "bg-primary/5" : "bg-muted hover:bg-muted/70"
                                  }`}
                                  onClick={() => toggleDetails(globalIndex)}
                                >
                                  <div className="flex items-center gap-3">
                                    <div
                                      className={`flex items-center justify-center rounded-full w-8 h-8 ${
                                        isOpen ? "bg-primary/10 text-primary" : "bg-muted-foreground/20"
                                      }`}
                                    >
                                      <span className="text-sm font-medium">{globalIndex + 1}</span>
                                    </div>
                                    <h2 className="text-lg font-medium">{palabraOriginal}</h2>
                                    <Badge variant="outline" className="ml-2">
                                      {versiones.length} {versiones.length === 1 ? "versión" : "versiones"}
                                    </Badge>
                                  </div>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className={`p-0 h-8 w-8 rounded-full transition-transform duration-200 ${
                                      isOpen ? "bg-primary/10 text-primary rotate-180" : ""
                                    }`}
                                  >
                                    <ChevronDown size={18} />
                                  </Button>
                                </div>
                                {isOpen && (
                                  <div className="p-4 overflow-x-auto animate-in fade-in-50 duration-200">
                                    <Table>
                                      <TableHeader>
                                        <TableRow className="hover:bg-transparent">
                                          <TableHead className="w-[60px]">ID</TableHead>
                                          <TableHead>Español</TableHead>
                                          <TableHead>Aymara</TableHead>
                                          <TableHead>Comentario</TableHead>
                                          <TableHead>Validador</TableHead>
                                          <TableHead className="text-right">Fecha</TableHead>
                                        </TableRow>
                                      </TableHeader>
                                      <TableBody>
                                        {versiones.map((version, versionIndex) => (
                                          <TableRow key={versionIndex}>
                                            <TableCell className="font-medium">{version.numero_version}</TableCell>
                                            <TableCell className="font-medium">
                                              {version.traduccion_es || palabraOriginal}
                                            </TableCell>
                                            <TableCell>
                                              {version.traduccion_aym ? (
                                                version.traduccion_aym
                                              ) : (
                                                <span className="text-muted-foreground italic">Sin traducción</span>
                                              )}
                                            </TableCell>
                                            <TableCell>
                                              {version.comentario ? (
                                                <div className="flex items-start gap-1.5">
                                                  <Info className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                                                  <span className="line-clamp-2">{version.comentario}</span>
                                                </div>
                                              ) : (
                                                <span className="text-muted-foreground italic">Sin comentarios</span>
                                              )}
                                            </TableCell>
                                            <TableCell>
                                              <div className="flex items-center gap-1.5">
                                                <User className="h-3.5 w-3.5 text-muted-foreground" />
                                                <span>
                                                  {version.validador_id || (
                                                    <span className="text-muted-foreground italic">Sin asignar</span>
                                                  )}
                                                </span>
                                              </div>
                                            </TableCell>
                                            <TableCell className="text-right">
                                              <div className="flex items-center justify-end gap-1.5">
                                                <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                                                <span>
                                                  {version.fecha_validacion ? (
                                                    new Date(version.fecha_validacion).toLocaleDateString()
                                                  ) : (
                                                    <span className="text-muted-foreground italic">Pendiente</span>
                                                  )}
                                                </span>
                                              </div>
                                            </TableCell>
                                          </TableRow>
                                        ))}
                                      </TableBody>
                                    </Table>
                                  </div>
                                )}
                              </Card>
                            )
                          })}
                        </div>
                      )}

                      {totalPages > 1 && (
                        <div className="flex justify-between items-center mt-6 border-t pt-4">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                            disabled={currentPage === 1}
                          >
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Anterior
                          </Button>
                          <div className="flex items-center gap-1">
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                              <Button
                                key={page}
                                variant={currentPage === page ? "default" : "outline"}
                                size="sm"
                                className={`h-8 w-8 p-0 ${currentPage === page ? "pointer-events-none" : ""}`}
                                onClick={() => setCurrentPage(page)}
                              >
                                {page}
                              </Button>
                            ))}
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                            disabled={currentPage === totalPages}
                          >
                            Siguiente
                            <ChevronDown className="ml-2 h-4 w-4 rotate-[-90deg]" />
                          </Button>
                        </div>
                      )}
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

export default PalabrasVersiones
