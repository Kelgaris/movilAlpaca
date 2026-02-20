import { useRouter } from 'expo-router'
import { useState } from 'react'
import { ActivityIndicator, Image, ImageBackground, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'
import { register } from '../api/api'

export default function RegisterScreen() {
  // Declaramos estado local del formulario y mensajes de feedback.
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const router = useRouter()

  async function handleRegister() {
    // Limpiamos mensajes previos antes de validar y registrar.
    setError('')
    setSuccess('')
    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres')
      return
    }
    if (password !== confirm) {
      setError('Las contraseñas deben coincidir')
      return
    }
    try {
      setLoading(true)
      // Enviamos alta al backend y redirigimos tras confirmación.
      await register({ email, password })
      setSuccess('Usuario registrado correctamente.')
      setTimeout(() => router.push('/login'), 1200)
    } catch (err) {
      // Mostramos error de backend o mensaje genérico de registro.
      setError(err.response?.data?.message || 'Ocurrió un error en el registro.')
    } finally { setLoading(false) }
  }

  function goLogin() {
    // Navegamos a login cuando el usuario ya tiene cuenta.
    router.push('/login')
  }

  return (
    <ImageBackground source={require('../../assets/images/bgLogin.jpg')} style={styles.bg} resizeMode="cover">
      <View style={styles.card}>
        <Image source={require('../../assets/images/alpaca.png')} style={styles.logo} />
        <Text style={styles.title}>Alpaca Chinchona</Text>
        <Text style={styles.subtitle}>Bienvenido a la Alpaca</Text>
        <TextInput placeholder="Correo" value={email} onChangeText={setEmail} style={styles.input} autoCapitalize="none" placeholderTextColor="#ccc" />
        <TextInput placeholder="Contraseña" value={password} onChangeText={setPassword} secureTextEntry style={styles.input} placeholderTextColor="#ccc" />
        <TextInput placeholder="Repetir contraseña" value={confirm} onChangeText={setConfirm} secureTextEntry style={styles.input} placeholderTextColor="#ccc" />
        {error ? <Text style={styles.error}>{error}</Text> : null}
        {success ? <Text style={styles.success}>{success}</Text> : null}
        <TouchableOpacity style={styles.button} onPress={handleRegister} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Registrarse</Text>}
        </TouchableOpacity>
        <TouchableOpacity onPress={goLogin}>
          <Text style={styles.link}>¿Ya tienes cuenta? Inicia sesión.</Text>
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
  },
  success: {
    color: '#4fd37a',
    marginBottom: 8,
    marginTop: -4
  }
})
