import { useState } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import Logo from '@/assets/logo_color.png'

import { LoginForm } from '@/components/login-form'
import useLoading from '@/hooks/Loading'

const API_URL = import.meta.env.VITE_API_URL

export default function Login() {
  const { login } = useAuth()
  const [message, setMessage] = useState('')
  const { Loading, handleLoading } = useLoading()
  const navigate = useNavigate()

  const handleLogin = async (email: string, password: string) => {
    setMessage('') // Limpiar mensajes previos
    handleLoading(true)
    try {
      const response = await axios.post(`${API_URL}/login`, {
        email,
        contraseña: password,
      })

      if (response.data.success) {
        const { token, user } = response.data

        // Verificar que el rol esté presente en la respuesta
        if (!user.rol) {
          setMessage('Error: El rol del usuario no está definido.')
          return
        }

        // Guarda los datos del usuario en el contexto
        login(user, token)

        // Redirige según el rol del usuario
        navigate(user.rol === 'admin' ? '/dashboard' : '/dashboard')
      } else {
        setMessage(response.data.message || 'Usuario o contraseña incorrectos.')
      }
    } catch (error: any) {
      console.error(error)
      setMessage(
        error.response?.data?.message ||
          'Error al iniciar sesión. Intente nuevamente.'
      )
    }
    handleLoading(false)
  }

  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex justify-center gap-2 md:justify-start">
          <a href="/dashboard" className="flex items-center gap-2 font-medium">
            <img src={Logo} alt="Logo aimara" className="h-8" />
          </a>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-sm">
            <LoginForm
              onSubmit={(email: string, password: string) =>
                handleLogin(email, password)
              }
              loading={Loading}
            />
            {message && (
              <p className="mt-4 text-center text-sm font-medium text-red-500">
                {message}
              </p>
            )}
          </div>
        </div>
      </div>
      <div className="hidden lg:flex items-center justify-center p-10 bg-gradient-to-br from-muted to-muted/70 overflow-hidden">
  <img
    src="/logo_color.png"
    alt="Logo"
    className="max-w-[300px] w-full h-auto object-contain drop-shadow-md transition-transform duration-700 ease-out hover:scale-105 animate-fade-in"
  />
</div>





    </div>
  )
}
