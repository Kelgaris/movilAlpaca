import AsyncStorage from '@react-native-async-storage/async-storage'
import { useRouter } from 'expo-router'
import { useEffect, useState } from 'react'
import { ActivityIndicator, Image, ImageBackground, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'
import { login, setAuthToken } from '../api/api'

export default function LoginScreen() {
  // Declaramos estado local para credenciales, feedback y navegación.
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  useEffect(() => {
    (async () => {
      // Recuperamos sesión persistida para evitar pedir login si ya existe token.
      const auth = await AsyncStorage.getItem('auth');
      if (auth) {
        try {
          const { user, token } = JSON.parse(auth);
          if (user && token) {
            // Redirigimos según rol cuando la sesión almacenada es válida.
            if (user.role === 'admin') {
              router.replace('/admin');
            } else {
              router.replace('/dashboard');
            }
          }
        } catch (e) {
          // Limpiamos storage cuando detectamos datos corruptos de sesión.
          await AsyncStorage.removeItem('auth');
        }
      }
    })();
  }, []);

  async function handleLogin() {
    // Reiniciamos mensaje de error antes de intentar autenticación.
    setError('')
    try {
      setLoading(true)
      // Enviamos credenciales al backend y almacenamos sesión resultante.
      const res = await login(email, password)
      if (res.token) {
        setAuthToken(res.token)
        await AsyncStorage.setItem('auth', JSON.stringify({ user: res.usuario, token: res.token }))
        if (res.usuario.role === 'admin') {
          router.replace('/admin')
        } else {
          router.replace('/dashboard')
        }
      }
    } catch (err) {
      // Mostramos error de backend o fallback genérico de login.
      setError(err.response?.data?.message || 'Error en login')
    } finally {
      setLoading(false)
    }
  }

  function goRegister() {
    // Navegamos a pantalla de registro cuando el usuario no tiene cuenta.
    router.push('/register')
  }

  return (
    <ImageBackground source={require('../../assets/images/bgLogin.jpg')} style={styles.bg} resizeMode="cover">
      <View style={styles.card}>
        <Image source={require('../../assets/images/alpaca.png')} style={styles.logo} />
        <Text style={styles.title}>Alpaca Chinchona</Text>
        <Text style={styles.subtitle}>Accede a tu cuenta</Text>
        <TextInput placeholder="Correo" value={email} onChangeText={setEmail} style={styles.input} autoCapitalize="none" placeholderTextColor="#ccc" />
        <TextInput placeholder="Contraseña" value={password} onChangeText={setPassword} secureTextEntry style={styles.input} placeholderTextColor="#ccc" />
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Entrar</Text>}
        </TouchableOpacity>
        <TouchableOpacity onPress={goRegister}>
          <Text style={styles.link}>¿No tienes cuenta? Regístrate.</Text>
        </TouchableOpacity>
      </View>
    </ImageBackground>
  )
}

const styles = StyleSheet.create({
  bg: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    height: '100%'
  },
  card: {
    backgroundColor: 'rgba(0,0,0,0.8)',
    padding: 32,
    borderRadius: 20,
    width: 340,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 4
  },
  logo: {
    width: 48,
    height: 48,
    marginBottom: 8
  },
  title: {
    color: '#9d4edd',
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 5
  },
  subtitle: {
    color: '#fff',
    marginBottom: 18
  },
  input: {
    width: 270,
    padding: 12,
    marginBottom: 12,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#eee',
    fontSize: 14,
    color: '#fff',
    backgroundColor: 'rgba(255,255,255,0.05)'
  },
  button: {
    width: 270,
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#ff6f91',
    alignItems: 'center',
    marginTop: 4
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16
  },
  link: {
    marginTop: 15,
    color: '#9d4edd',
    fontWeight: '600',
    textDecorationLine: 'underline'
  },
  error: {
    color: '#ff4f7a',
    marginBottom: 8,
    marginTop: -4
  }
})
