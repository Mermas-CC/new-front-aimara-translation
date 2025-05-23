"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import { Link } from "react-router-dom"
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import {
  ArrowLeft,
  Plus,
  Pencil,
  Trash2,
  AlertTriangle,
  CheckCircle,
  Loader2,
  UserPlus,
  Users,
  Mail,
  Lock,
  User,
  ShieldCheck,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Label } from "@/components/ui/label"

const API_URL = import.meta.env.VITE_API_URL

type Usuario = {
  id: number
  nombre: string
  email: string
  contraseña?: string
  rol: string
}

// Componente de confirmación
const ConfirmationDialog = ({
  isOpen,
  onClose,
  onConfirm,
  action,
  userName,
}: {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  action: "delete" | "update" | null
  userName: string
}) => {
  if (!isOpen) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-center mb-4">
            {action === "delete" ? (
              <div className="h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center">
                <AlertTriangle className="h-6 w-6 text-destructive" />
              </div>
            ) : (
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-primary" />
              </div>
            )}
          </div>
          <DialogTitle className="text-center text-xl">
            {action === "delete" ? "Confirmar Eliminación" : "Confirmar Modificación"}
          </DialogTitle>
          <DialogDescription className="text-center pt-2 text-base">
            {action === "delete"
              ? `¿Estás seguro de que deseas eliminar al usuario "${userName}"?`
              : `¿Estás seguro de que deseas modificar al usuario "${userName}"?`}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex flex-row justify-between gap-2 sm:justify-between">
          <Button variant="outline" className="flex-1" onClick={onClose}>
            Cancelar
          </Button>
          <Button variant={action === "delete" ? "destructive" : "default"} className="flex-1" onClick={onConfirm}>
            Confirmar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// Componente para editar usuario
const EditUserDialog = ({
  isOpen,
  user,
  onChange,
  onClose,
  onConfirm,
}: {
  isOpen: boolean
  user: Usuario | null
  onChange: (user: Usuario) => void
  onClose: () => void
  onConfirm: () => void
}) => {
  const [localUser, setLocalUser] = useState<Usuario | null>(user)
  const [confirmPass, setConfirmPass] = useState("")
  const [error, setError] = useState("")

  useEffect(() => {
    if (user) {
      setLocalUser({ ...user, contraseña: "" })
      setConfirmPass("")
      setError("")
    }
  }, [user, isOpen])

  const handleInputChange = (field: keyof Usuario, value: string) => {
    if (!localUser) return
    setLocalUser({ ...localUser, [field]: value })
    if (field === "contraseña") setError("")
    onChange({ ...localUser, [field]: value })
  }

  const handleConfirm = () => {
    if (!localUser) return
    if (localUser.contraseña) {
      if (localUser.contraseña !== confirmPass) {
        setError("Las contraseñas no coinciden")
        return
      }
    }
    setError("")
    onChange(localUser)
    onConfirm()
  }

  if (!isOpen || !user || !localUser) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl">Editar Usuario</DialogTitle>
          <DialogDescription>Modifica los datos del usuario seleccionado</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="nombre" className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              Nombre
            </Label>
            <Input
              id="nombre"
              value={localUser.nombre}
              onChange={(e) => handleInputChange("nombre", e.target.value)}
              placeholder="Nombre completo"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="email" className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-muted-foreground" />
              Email
            </Label>
            <Input
              id="email"
              type="email"
              value={localUser.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
              placeholder="correo@ejemplo.com"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="rol" className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-muted-foreground" />
              Rol
            </Label>
            <select
              id="rol"
              value={localUser.rol}
              onChange={(e) => handleInputChange("rol", e.target.value)}
              className="border rounded px-2 py-1"
            >
              <option value="valido">Validador</option>
              <option value="admin">Administrador</option>
            </select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="password" className="flex items-center gap-2">
              <Lock className="h-4 w-4 text-muted-foreground" />
              Contraseña
            </Label>
            <Input
              id="password"
              type="password"
              value={localUser.contraseña || ""}
              onChange={(e) => handleInputChange("contraseña", e.target.value)}
              placeholder="Nueva contraseña"
              autoComplete="new-password"
            />
            <Input
              type="password"
              value={confirmPass}
              onChange={(e) => {
                setConfirmPass(e.target.value)
                setError("")
              }}
              placeholder="Confirmar contraseña"
              autoComplete="new-password"
              className="mt-1"
            />
            <p className="text-xs text-muted-foreground">
              Si no deseas modificar la contraseña, deja este campo vacío.
            </p>
            {localUser.contraseña && error && <p className="text-sm text-destructive">{error}</p>}
          </div>
        </div>
        <DialogFooter className="flex flex-row justify-between gap-2 sm:justify-between">
          <Button variant="outline" className="flex-1" onClick={onClose}>
            Cancelar
          </Button>
          <Button className="flex-1" onClick={handleConfirm}>
            <Pencil className="mr-2 h-4 w-4" />
            Guardar Cambios
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

const AdminPanel = () => {
  const [usuarios, setUsuarios] = useState<Usuario[]>([])
  const [newUser, setNewUser] = useState<Usuario>({ id: 0, nombre: "", contraseña: "", email: "", rol: "valido" })
  const [editUser, setEditUser] = useState<Usuario | null>(null)
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean
    action: "delete" | "update" | null
    userId: number | null
    userName: string
  }>({ isOpen: false, action: null, userId: null, userName: "" })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchUsuarios()
  }, [])

  const fetchUsuarios = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await axios.get(`${API_URL}/usuarios`) // Cambia la ruta para traer todos
      setUsuarios(response.data)
    } catch (error) {
      console.error("Error al obtener los usuarios:", error)
      setError("No se pudieron cargar los usuarios. Por favor, inténtalo de nuevo más tarde.")
    } finally {
      setLoading(false)
    }
  }

  const handleCreateUser = async () => {
    try {
      if (!newUser.nombre || !newUser.contraseña || !newUser.email) {
        setError("Todos los campos son obligatorios para crear un usuario")
        return
      }

      setLoading(true)
      await axios.post(`${API_URL}/usuarios`, newUser)
      await fetchUsuarios()
      setNewUser({ id: 0, nombre: "", contraseña: "", email: "", rol: "valido" })
      setError(null)
    } catch (error) {
      console.error("Error al crear el usuario:", error)
      setError("No se pudo crear el usuario. Por favor, inténtalo de nuevo más tarde.")
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateUser = async () => {
    try {
      if (!editUser) return
      setLoading(true)
      await axios.put(`${API_URL}/usuarios/${editUser.id}`, editUser)
      await fetchUsuarios()
      setEditUser(null)
      setConfirmDialog({ isOpen: false, action: null, userId: null, userName: "" })
    } catch (error) {
      console.error("Error al modificar el usuario:", error)
      setError("No se pudo modificar el usuario. Por favor, inténtalo de nuevo más tarde.")
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteUser = async () => {
    try {
      if (!confirmDialog.userId) return
      setLoading(true)
      await axios.delete(`${API_URL}/usuarios/${confirmDialog.userId}`)
      await fetchUsuarios()
      setConfirmDialog({ isOpen: false, action: null, userId: null, userName: "" })
    } catch (error) {
      console.error("Error al eliminar el usuario:", error)
      setError("No se pudo eliminar el usuario. Por favor, inténtalo de nuevo más tarde.")
    } finally {
      setLoading(false)
    }
  }

  const openConfirmDialog = (action: "delete" | "update", userId: number, userName: string) => {
    setConfirmDialog({ isOpen: true, action, userId, userName })
  }

  const closeConfirmDialog = () => {
    setConfirmDialog({ isOpen: false, action: null, userId: null, userName: "" })
  }

  return (
    <SidebarProvider>
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6 px-4 md:px-6">
              {loading && usuarios.length === 0 ? (
                <div className="flex justify-center items-center h-[60vh]">
                  <Card className="w-full max-w-md p-6">
                    <CardContent className="flex flex-col items-center justify-center pt-6">
                      <div className="relative">
                        <Loader2 className="h-12 w-12 animate-spin text-primary" />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="h-3 w-3 rounded-full bg-primary"></div>
                        </div>
                      </div>
                      <h3 className="mt-4 text-xl font-medium">Cargando usuarios</h3>
                      <p className="mt-2 text-center text-muted-foreground">
                        Estamos recuperando la lista de usuarios. Esto puede tomar un momento...
                      </p>
                    </CardContent>
                  </Card>
                </div>
              ) : error && usuarios.length === 0 ? (
                <Card className="max-w-md mx-auto border-destructive/50">
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5 text-destructive" />
                      <CardTitle className="text-destructive">Error al cargar datos</CardTitle>
                    </div>
                    <CardDescription>No se pudieron cargar los usuarios</CardDescription>
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
                            <CardTitle className="text-2xl">Panel de Administración</CardTitle>
                            <CardDescription>Gestión de usuarios del sistema</CardDescription>
                          </div>
                        </div>
                        <Badge variant="outline" className="font-normal">
                          <Users className="h-3.5 w-3.5 mr-1" />
                          Total: {usuarios.length} usuarios
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="p-6">
                      <Card className="mb-8 border-primary/20">
                        <CardHeader className="pb-2 bg-muted/50">
                          <div className="flex items-center">
                            <UserPlus className="h-5 w-5 mr-2 text-primary" />
                            <CardTitle className="text-lg">Crear Nuevo Usuario</CardTitle>
                          </div>
                        </CardHeader>
                        <CardContent className="pt-6">
                          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                            <div className="md:col-span-1">
                              <Label htmlFor="new-name" className="flex items-center gap-1.5 mb-2 text-sm">
                                <User className="h-3.5 w-3.5 text-muted-foreground" />
                                Nombre
                              </Label>
                              <Input
                                id="new-name"
                                placeholder="Nombre completo"
                                value={newUser.nombre}
                                onChange={(e) => setNewUser({ ...newUser, nombre: e.target.value })}
                              />
                            </div>
                            <div className="md:col-span-1">
                              <Label htmlFor="new-email" className="flex items-center gap-1.5 mb-2 text-sm">
                                <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                                Email
                              </Label>
                              <Input
                                id="new-email"
                                type="email"
                                placeholder="correo@ejemplo.com"
                                value={newUser.email}
                                onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                              />
                            </div>
                            <div className="md:col-span-1">
                              <Label htmlFor="new-password" className="flex items-center gap-1.5 mb-2 text-sm">
                                <Lock className="h-3.5 w-3.5 text-muted-foreground" />
                                Contraseña
                              </Label>
                              <Input
                                id="new-password"
                                type="password"
                                placeholder="Contraseña"
                                value={newUser.contraseña || ""}
                                onChange={(e) => setNewUser({ ...newUser, contraseña: e.target.value })}
                              />
                            </div>
                            <div className="md:col-span-1">
                              <Label htmlFor="new-rol" className="flex items-center gap-1.5 mb-2 text-sm">
                                <ShieldCheck className="h-3.5 w-3.5 text-muted-foreground" />
                                Rol
                              </Label>
                              <select
                                id="new-rol"
                                value={newUser.rol}
                                onChange={(e) => setNewUser({ ...newUser, rol: e.target.value })}
                                className="border rounded px-2 py-1 w-full"
                              >
                                <option value="valido">Validador</option>
                                <option value="admin">Administrador</option>
                              </select>
                            </div>
                            <div className="md:col-span-1 flex items-end">
                              <Button className="w-full" onClick={handleCreateUser}>
                                <Plus className="mr-2 h-4 w-4" />
                                Crear Usuario
                              </Button>
                            </div>
                          </div>
                          {error && (
                            <div className="mt-4 p-3 bg-destructive/10 border border-destructive/30 rounded-md text-destructive text-sm flex items-start">
                              <AlertTriangle className="h-4 w-4 mr-2 flex-shrink-0 mt-0.5" />
                              <span>{error}</span>
                            </div>
                          )}
                        </CardContent>
                      </Card>

                      <div className="rounded-md border">
                        <div className="bg-muted/50 p-3 flex items-center">
                          <h2 className="text-lg font-medium">Lista de Usuarios</h2>
                        </div>
                        <Table>
                          <TableHeader>
                            <TableRow className="hover:bg-transparent">
                              <TableHead className="w-[40%]">Nombre</TableHead>
                              <TableHead className="w-[30%]">Email</TableHead>
                              <TableHead className="w-[15%]">Rol</TableHead>
                              <TableHead className="w-[15%] text-right">Acciones</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {usuarios.length === 0 ? (
                              <TableRow>
                                <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                                  No hay usuarios registrados
                                </TableCell>
                              </TableRow>
                            ) : (
                              usuarios.map((usuario) => (
                                <TableRow key={usuario.id} className="group">
                                  <TableCell className="font-medium">
                                    <div className="flex items-center gap-2">
                                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                                        <User className="h-4 w-4 text-primary" />
                                      </div>
                                      {usuario.nombre}
                                    </div>
                                  </TableCell>
                                  <TableCell>{usuario.email}</TableCell>
                                  <TableCell>
                                    <Badge variant="outline" className="flex items-center gap-1 w-fit">
                                      <ShieldCheck className="h-3 w-3" />
                                      {usuario.rol}
                                    </Badge>
                                  </TableCell>
                                  <TableCell className="text-right">
                                    <div className="flex items-center justify-end gap-2 transition-opacity">
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => setEditUser(usuario)}
                                        className="h-8 w-8"
                                      >
                                        <Pencil className="h-4 w-4" />
                                        <span className="sr-only">Editar</span>
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => openConfirmDialog("delete", usuario.id, usuario.nombre)}
                                        className="h-8 w-8 text-destructive"
                                      >
                                        <Trash2 className="h-4 w-4" />
                                        <span className="sr-only">Eliminar</span>
                                      </Button>
                                    </div>
                                  </TableCell>
                                </TableRow>
                              ))
                            )}
                          </TableBody>
                        </Table>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          </div>
        </div>
      </SidebarInset>

      {/* Diálogos */}
      {editUser && !confirmDialog.isOpen && (
        <EditUserDialog
          isOpen={!!editUser}
          user={editUser}
          onChange={setEditUser}
          onClose={() => setEditUser(null)}
          onConfirm={() => openConfirmDialog("update", editUser.id, editUser.nombre)}
        />
      )}

      <ConfirmationDialog
        isOpen={confirmDialog.isOpen}
        onClose={closeConfirmDialog}
        onConfirm={confirmDialog.action === "delete" ? handleDeleteUser : handleUpdateUser}
        action={confirmDialog.action}
        userName={confirmDialog.userName}
      />
    </SidebarProvider>
  )
}

export default AdminPanel
