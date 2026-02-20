import { useRouter } from 'expo-router'
import { useEffect } from 'react'

export default function IndexRedirect() {
  // Inicializamos router para redirección automática de entrada.
  const router = useRouter()

  useEffect(() => {
    // Redirigimos a login para centralizar el flujo de autenticación.
    router.replace('/login')
  }, [])

  return null
}
