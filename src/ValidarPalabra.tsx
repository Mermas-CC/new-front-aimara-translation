"use client"

import * as React from "react"
import axios from "axios"
import { Mic, MicOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useNavigate } from "react-router-dom"
import { useAuth } from "@/context/AuthContext"
import { AppSidebar } from "@/components/app-sidebar"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { SiteHeader } from "@/components/site-header"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
const API_URL = import.meta.env.VITE_API_URL

type Palabra = {
  id: number
  palabra_es: string
  palabra_aimara: string
  contador?: number
}

export default function ValidarPalabra() {
  const { user, token } = useAuth()
  const [palabraActual, setPalabraActual] = React.useState<Palabra | null>(null)
  const [comentario, setComentario] = React.useState("")
  const [error, setError] = React.useState("")
  const [audioBlob, setAudioBlob] = React.useState<Blob | null>(null)
  const [audioUrl, setAudioUrl] = React.useState("")
  const [audioUploaded, setAudioUploaded] = React.useState(false)
  const [isRecording, setIsRecording] = React.useState(false)
  const [loading, setLoading] = React.useState(true)
  const [showConfirm, setShowConfirm] = React.useState(false)
  const [mediaRecorder, setMediaRecorder] = React.useState<MediaRecorder | null>(null)
  const [noMasPalabras, setNoMasPalabras] = React.useState(false)

  const navigate = useNavigate()

  // Cargar palabra actual
  const fetchPalabra = React.useCallback(async () => {
    try {
      setLoading(true)
      setError("")
      setNoMasPalabras(false)
      if (!token) {
        setError("Token no válido.")
        setLoading(false)
        return
      }
      const response = await axios.get(`${API_URL}/palabras/no-validadas`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (Array.isArray(response.data) && response.data.length > 0) {
        setPalabraActual(response.data[0])
      } else {
        setPalabraActual(null)
        setNoMasPalabras(true)
      }
    } catch (err: any) {
      if (err.response && err.response.status === 404) {
        setNoMasPalabras(true)
        setPalabraActual(null)
      } else {
        setError("No se pudieron cargar las palabras.")
      }
    } finally {
      setLoading(false)
    }
  }, [token])

  React.useEffect(() => {
    fetchPalabra()
  }, [fetchPalabra])

  // Grabación de audio
  const startRecording = () => {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices
        .getUserMedia({ audio: true })
        .then((stream) => {
          const recorder = new window.MediaRecorder(stream)
          setMediaRecorder(recorder)
          recorder.start()
          recorder.ondataavailable = (event) => {
            const blob = event.data
            setAudioBlob(blob)
            setAudioUrl(URL.createObjectURL(blob))
          }
          recorder.onstop = () => {
            stream.getTracks().forEach((track) => track.stop())
          }
          setIsRecording(true)
        })
        .catch(() => {
          setError("No se pudo acceder al micrófono.")
        })
    }
  }

  const stopRecording = () => {
    if (mediaRecorder) {
      mediaRecorder.stop()
      setIsRecording(false)
    }
  }

  // Subir audio y devolver URL absoluta
  const handleAudioUpload = async (audioBlob: Blob) => {
    if (!palabraActual) return null
    const audioFileName = `${palabraActual.palabra_es}.mp3`

    if (!audioBlob) {
      setError("No se ha grabado ningún audio.")
      return null
    }

    const formData = new FormData()
    formData.append("audio", audioBlob, audioFileName)

    try {
      const response = await axios.post(`${API_URL}/upload-audio`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      })
      setAudioUploaded(true)
      let audioUrlBackend = response.data.audioUrl
      if (audioUrlBackend && audioUrlBackend.startsWith("/")) {
        audioUrlBackend = API_URL.replace(/\/$/, "") + audioUrlBackend
      }
      return audioUrlBackend
    } catch (error) {
      setError("Error al enviar el audio.")
      setAudioUploaded(false)
      return null
    }
  }

  // Enviar validación
  const handleSubmit = async () => {
    if (!comentario.trim()) {
      setError("Debe ingresar un comentario o traducción.")
      return
    }
    setError("")
    setShowConfirm(true)
  }

  const handleConfirm = async () => {
    if (!palabraActual) return
    try {
      let audioUrlToSend = ""
      if (audioBlob) {
        audioUrlToSend = await handleAudioUpload(audioBlob)
        if (!audioUrlToSend) {
          setError("No se pudo subir el audio. Intenta nuevamente.")
          setShowConfirm(false)
          return
        }
      }
      await axios.post(
        `${API_URL}/validar-palabra`,
        {
          palabra_id: palabraActual.id,
          usuario_id: user?.id,
          comentario,
          es_correcta: comentario.trim() === palabraActual.palabra_aimara,
          pronunciacion_clip_url: audioUrlToSend || undefined,
        },
        { headers: { Authorization: `Bearer ${token}` } },
      )
      // Limpiar y pedir nueva palabra
      setComentario("")
      setAudioUploaded(false)
      setAudioUrl("")
      setAudioBlob(null)
      setShowConfirm(false)
      await fetchPalabra()
    } catch (err: any) {
      let backendMsg = "Error al enviar la palabra."
      if (err.response && err.response.data) {
        backendMsg +=
          " " + (typeof err.response.data === "string" ? err.response.data : JSON.stringify(err.response.data))
      }
      setError(backendMsg)
      setShowConfirm(false)
    }
  }

  const handleCancel = () => {
    setShowConfirm(false)
  }

  // Pantalla de carga
  if (loading) {
    return (
      <SidebarProvider>
        <AppSidebar variant="inset" />
        <SidebarInset>
          <SiteHeader />
          <div className="flex flex-1 flex-col items-center justify-center min-h-screen bg-background p-4">
            <Card className="max-w-md w-full">
              <CardContent className="flex flex-col items-center justify-center pt-6 pb-6">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mb-4"></div>
                <p className="text-muted-foreground">Cargando palabras para validar...</p>
              </CardContent>
            </Card>
          </div>
        </SidebarInset>
      </SidebarProvider>
    )
  }

  if (noMasPalabras || !palabraActual) {
    return (
      <SidebarProvider>
        <AppSidebar variant="inset" />
        <SidebarInset>
          <SiteHeader />
          <div className="flex flex-1 flex-col items-center justify-center min-h-screen bg-background p-4">
            <Card className="max-w-md w-full">
              <CardHeader>
                <CardTitle className="text-center">Validación Completa</CardTitle>
                <CardDescription className="text-center">No hay más palabras por validar.</CardDescription>
              </CardHeader>
              <CardFooter>
                <Button
                  className="w-full"
                  onClick={() => navigate(user && user.rol === "admin" ? "/menu" : "/menu-validador")}
                >
                  Volver al Menú
                </Button>
              </CardFooter>
            </Card>
          </div>
        </SidebarInset>
      </SidebarProvider>
    )
  }

  return (
    <SidebarProvider>
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col items-center justify-center min-h-screen bg-background p-4">
          <Card className="max-w-lg w-full">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <CardTitle>Validar palabra</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <div className="text-sm text-muted-foreground">Español</div>
                <div className="flex items-center gap-2">
                  <div className="text-xl font-medium">{palabraActual.palabra_es}</div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <div className="text-sm text-muted-foreground">Grabación de pronunciación</div>
                {isRecording ? (
                  <Button variant="destructive" className="w-full flex items-center gap-2" onClick={stopRecording}>
                    <MicOff className="h-4 w-4" />
                    Detener grabación
                  </Button>
                ) : (
                  <Button variant="secondary" className="w-full flex items-center gap-2" onClick={startRecording}>
                    <Mic className="h-4 w-4" />
                    Iniciar grabación
                  </Button>
                )}
                {audioUrl && (
                  <div className="rounded-md border border-border p-2 bg-muted/30">
                    <audio controls src={audioUrl} className="w-full" />
                    {audioUploaded && (
                      <p className="text-xs text-center mt-2 text-green-600">Audio cargado correctamente</p>
                    )}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <div className="text-sm text-muted-foreground">Traducción </div>
                <Textarea
                  value={comentario}
                  onChange={(e) => setComentario(e.target.value)}
                  placeholder="Ingrese la traducción en Aymara"
                  className="resize-none min-h-[100px]"
                />
              </div>

              {error && (
                <Alert variant="destructive" className="py-2">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
            </CardContent>
            <CardFooter>
              <Button className="w-full" onClick={handleSubmit}>
                Enviar validación
              </Button>
            </CardFooter>
          </Card>

          {/* Modal de confirmación */}
          <Dialog open={showConfirm} onOpenChange={setShowConfirm}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Confirmar validación</DialogTitle>
                <DialogDescription>
                  ¿Estás seguro de que deseas validar esta palabra con la siguiente información?
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-2">
                  <div className="text-sm font-medium">Español:</div>
                  <div>{palabraActual.palabra_es}</div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="text-sm font-medium">Aymara:</div>
                  <div>{comentario}</div>
                </div>
                {audioUrl && (
                  <div className="space-y-2">
                    <div className="text-sm font-medium">Audio:</div>
                    <audio controls src={audioUrl} className="w-full" />
                  </div>
                )}
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={handleCancel}>
                  Cancelar
                </Button>
                <Button onClick={handleConfirm}>Confirmar</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
