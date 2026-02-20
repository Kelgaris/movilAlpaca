import AsyncStorage from '@react-native-async-storage/async-storage'
import { useEffect, useState } from 'react'
import { Alert, FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { getActividades, reservarActividad } from '../api/api'

function ItemActividad({ actividad, reservar, cancelar, reservada }) {
  // Renderizamos tarjeta de actividad con acción dinámica según estado de reserva.
  return (
    <View style={estilos.card}>
      <Text style={estilos.titulo}>{actividad.titulo}</Text>
      <Text style={estilos.meta}>{actividad.tipo} · {actividad.juego || '—'}</Text>
      <Text style={estilos.descripcion}>{actividad.descripcion}</Text>
      <View style={estilos.row}>
        {reservada ? (
          <TouchableOpacity style={estilos.cancelarBtn} onPress={() => cancelar(actividad._id)}>
            <Text style={estilos.cancelarBtnText}>Cancelar</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={estilos.reservarBtn} onPress={() => reservar(actividad._id)}>
            <Text style={estilos.reservarBtnText}>Reservar</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  )
}

export default function ActividadesScreen() {
  // Declaramos estado para catálogo, reservas del usuario y navegación.
  const [actividades, setActividades] = useState([])
  const [reservadas, setReservadas] = useState([])
  const router = require('expo-router').useRouter();

  useEffect(() => {
    obtenerDatos()
  }, [])

  async function obtenerDatos() {
    try {
      // Cargamos actividades y derivamos ids reservados por usuario autenticado.
      const datos = await getActividades()
      setActividades(datos)
      const auth = await AsyncStorage.getItem('auth')
      if (auth) {
        const { user } = JSON.parse(auth)
        const idsReservadas = datos.filter(a => (a.reservas || []).some(r => String(r.usuarioId) === String(user._id) && r.estado === 'reservada')).map(a => a._id)
        setReservadas(idsReservadas)
      }
    } catch (err) {
      console.warn('Error obteniendo actividades', err)
    }
  }

  async function reservarActividadUsuario(id) {
    try {
      // Validamos sesión y enviamos reserva para actividad seleccionada.
      const auth = await AsyncStorage.getItem('auth')
      if (!auth) return Alert.alert('Error', 'No autenticado')
      const { user } = JSON.parse(auth)
      await reservarActividad(id, user._id)
      Alert.alert('Éxito', 'Reserva realizada')
      obtenerDatos()
    } catch (err) {
      Alert.alert('Error', err.response?.data?.error || err.response?.data?.message || 'Error reservando')
    }
  }

  async function cancelarReservaUsuario(id) {
    try {
      // Validamos sesión y calculamos margen para mostrar feedback de cancelación.
      const auth = await AsyncStorage.getItem('auth')
      if (!auth) return Alert.alert('Error', 'No autenticado')
      const { user } = JSON.parse(auth)
      const actividad = actividades.find(a => a._id === id)
      const ahora = new Date()
      const fechaInicio = new Date(actividad.fechaInicio)
      const minutosFaltantes = (fechaInicio - ahora) / (1000 * 60)
      await cancelarReserva(id, user._id)
      if (minutosFaltantes > 15) {
        Alert.alert('Reserva cancelada y plaza liberada')
      } else {
        Alert.alert('Reserva cancelada, no presentado')
      }
      obtenerDatos()
    } catch (err) {
      Alert.alert('Error', err.response?.data?.error || err.response?.data?.message || 'Error cancelando')
    }
  }

  return (
    <View style={estilos.container}>
      <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginBottom: 10 }}>
        <Image source={require('../../assets/images/alpaca.png')} style={estilos.alpacaIcon} />
        <Text style={estilos.tituloHeader}>Actividades Alpaquiles</Text>
      </View>
      <View style={estilos.headerActions}>
        <TouchableOpacity style={estilos.menuBtn} onPress={() => router.push('/dashboard')}><Text style={estilos.menuBtnText}>Inicio</Text></TouchableOpacity>
        <TouchableOpacity style={estilos.menuBtn} onPress={() => router.push('/actividades')}><Text style={estilos.menuBtnText}>Actividades</Text></TouchableOpacity>
        <TouchableOpacity style={estilos.menuBtn} onPress={async () => { await AsyncStorage.removeItem('auth'); router.replace('/login'); }}><Text style={estilos.menuBtnText}>Cerrar Sesión</Text></TouchableOpacity>
      </View>
      <FlatList
        data={actividades}
        keyExtractor={i => i._id}
        renderItem={({ item }) => <ItemActividad actividad={item} reservar={reservarActividadUsuario} cancelar={cancelarReservaUsuario} reservada={reservadas.includes(item._id)} />} />
    </View>
  )
}

const estilos = StyleSheet.create({
  container: {
    flex: 1,
    padding: 12,
    backgroundColor: '#cdb4db', // Aplicamos fondo morado suave para identidad visual.
  },
  headerActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 8,
    marginLeft: 0,
    marginBottom: 12,
  },
  menuBtn: {
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 18,
    paddingVertical: 10,
    marginLeft: 8,
    borderWidth: 2,
    borderColor: '#9d4edd',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  menuBtnText: {
    color: '#9d4edd',
    fontWeight: '700',
    fontSize: 15,
  },
  alpacaIcon: {
    width: 32,
    height: 32,
    marginRight: 10,
    marginTop: 45
  },
  tituloHeader: {
    fontWeight: '700',
    fontSize: 16,
    color: '#624b9b',
    marginTop: 50
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 18,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 1
  },
  titulo: {
    fontWeight: '700',
    fontSize: 15,
    marginBottom: 4
  },
  meta: {
    color: '#624b9b',
    fontWeight: '700',
    fontSize: 13,
    marginBottom: 2
  },
  descripcion: {
    color: '#333',
    marginBottom: 6
  },
  row: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 8
  },
  reservarBtn: {
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderWidth: 2,
    borderColor: '#9d4edd',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  reservarBtnText: {
    color: '#9d4edd',
    fontWeight: '700',
    fontSize: 15,
  },
  cancelarBtn: {
    backgroundColor: '#e07a7a',
    borderRadius: 12,
    paddingHorizontal: 18,
    paddingVertical: 10,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  cancelarBtnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 15,
  }
})
