import AsyncStorage from '@react-native-async-storage/async-storage'
import { useEffect, useState } from 'react'
import { Alert, Button, FlatList, StyleSheet, Text, View } from 'react-native'
import { cancelarReserva, getActividades } from '../api/api'

export default function ReservasScreen() {
  // Declaramos estado de reservas del usuario autenticado.
  const [reservas, setReservas] = useState([])

  useEffect(() => { fetchData() }, [])

  async function fetchData() {
    try {
      // Cargamos sesión, filtramos reservas propias y construimos listado visual.
      const auth = await AsyncStorage.getItem('auth')
      if (!auth) return
      const { user } = JSON.parse(auth)
      const actividades = await getActividades()
      const my = []
      actividades.forEach(a => {
        (a.reservas || []).forEach(r => {
          if (String(r.usuarioId) === String(user._id)) my.push({ actividad: a, reserva: r })
        })
      })
      setReservas(my)
    } catch (err) { console.warn(err) }
  }

  async function handleCancel(actividadId) {
    try {
      // Cancelamos reserva seleccionada y refrescamos datos en pantalla.
      const auth = await AsyncStorage.getItem('auth')
      if (!auth) return
      const { user } = JSON.parse(auth)
      await cancelarReserva(actividadId, user._id)
      Alert.alert('Éxito', 'Reserva cancelada')
      fetchData()
    } catch (err) {
      Alert.alert('Error', err.response?.data?.error || 'Error cancelando')
    }
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={reservas}
        keyExtractor={(i, idx) => String(i.reserva._id || idx)}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.title}>{item.actividad.titulo}</Text>
            <Text style={styles.meta}>Estado: {item.reserva.estado}</Text>
            <View style={styles.row}>
              <Button title="Cancelar" onPress={() => handleCancel(item.actividad._id)} />
            </View>
          </View>
        )}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 12, backgroundColor: '#f7f7f8' },
  card: { backgroundColor: '#fff', borderRadius: 10, padding: 12, marginBottom: 10, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 6, elevation: 1 },
  title: { fontWeight: '700', fontSize: 16 },
  meta: { color: '#666', marginTop: 6 },
  row: { marginTop: 8, flexDirection: 'row', justifyContent: 'flex-end' }
})
