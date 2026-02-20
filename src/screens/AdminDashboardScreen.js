import AsyncStorage from '@react-native-async-storage/async-storage'
import { useRouter } from 'expo-router'
import { useEffect, useState } from 'react'
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { createActividad, deleteActividad, getActividades, updateActividad } from '../api/api'
import FormularioActividad from '../components/ActividadForm'

export default function AdminDashboardScreen() {
  // Declaramos estado para listado admin y ciclo de formulario crear/editar.
  const router = useRouter()
  const [actividades, setActividades] = useState([])
  const [formularioVisible, setFormularioVisible] = useState(false)
  const [editando, setEditando] = useState(null)

  useEffect(() => { obtenerDatos() }, [])

  async function obtenerDatos() {
    try {
      // Cargamos actividades para mantener panel sincronizado con backend.
      const datos = await getActividades()
      setActividades(datos)
    } catch (err) { console.warn(err) }
  }

  async function eliminarActividadAdmin(id) {
    try {
      // Eliminamos actividad por id y refrescamos listado.
      await deleteActividad(id)
      Alert.alert('Éxito', 'Actividad eliminada')
      obtenerDatos()
    } catch (err) {
      Alert.alert('Error', err.response?.data?.error || 'Error eliminando')
    }
  }

  function abrirCrear() {
    // Abrimos formulario en modo creación.
    setEditando(null)
    setFormularioVisible(true)
  }

  function abrirEditar(item) {
    // Abrimos formulario en modo edición con actividad seleccionada.
    setEditando(item)
    setFormularioVisible(true)
  }

  async function enviarFormulario(payload) {
    try {
      // Enviamos create o update según contexto y refrescamos datos.
      const auth = await AsyncStorage.getItem('auth')
      console.log('Token en enviarFormulario:', auth)
      if (editando && editando._id) {
        await updateActividad(editando._id, payload)
        Alert.alert('Éxito', 'Actividad actualizada')
      } else {
        await createActividad(payload)
        Alert.alert('Éxito', 'Actividad creada')
      }
      setFormularioVisible(false)
      obtenerDatos()
    } catch (err) {
      console.warn('Error en enviarFormulario:', err)
      if (err && err.stack) {
        console.warn('Stack:', err.stack)
      }
      Alert.alert('Error', err.response?.data?.error || err.message || 'Error guardando')
    }
  }

  function cerrarSesionAdmin() {
    // Cerramos sesión de administrador y redirigimos a login.
    AsyncStorage.removeItem('auth')
    Alert.alert('Sesión cerrada')
    router.replace('/login')
  }

  return (
    <View style={estilos.bg}>
      <View style={estilos.headerRow}>
        <Text style={estilos.header}>🦙 Panel Admin</Text>
      </View>
      <View style={estilos.actionsRow}>
        <TouchableOpacity style={estilos.button} onPress={abrirCrear}>
          <Text style={estilos.buttonText}>Nueva actividad</Text>
        </TouchableOpacity>
        <TouchableOpacity style={estilos.button} onPress={cerrarSesionAdmin}>
          <Text style={estilos.buttonText}>Cerrar sesión</Text>
        </TouchableOpacity>
      </View>
      <ScrollView contentContainerStyle={estilos.scrollContent}>
        {actividades.map(item => (
          <View key={item._id} style={estilos.card}>
            <Text style={estilos.titulo}>{item.titulo}</Text>
            <Text style={estilos.meta}>{item.tipo} · {item.juego || '—'}</Text>
            <Text style={estilos.descripcion}>{item.descripcion}</Text>
            <Text style={estilos.meta}>Plazas: {item.capacidadMaxima} / {(item.reservas || []).length}</Text>
            <Text style={estilos.meta}>Fecha: {item.fechaInicio ? new Date(item.fechaInicio).toLocaleString() : '—'}</Text>
            <View style={estilos.reservasBox}>
              <Text style={estilos.reservasTitle}>Reservas:</Text>
              {(item.reservas && item.reservas.length > 0) ? (
                item.reservas.map((r, idx) => (
                  <Text key={idx} style={estilos.reservaItem}>👤 {r.usuarioNombre || r.usuarioId} → {r.estado}</Text>
                ))
              ) : (
                <Text style={estilos.reservaItem}>No hay reservas aún.</Text>
              )}
            </View>
            <View style={estilos.actions}>
              <TouchableOpacity style={estilos.editBtn} onPress={() => abrirEditar(item)}>
                <Text style={estilos.editBtnText}>Editar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={estilos.deleteBtn} onPress={() => eliminarActividadAdmin(item._id)}>
                <Text style={estilos.deleteBtnText}>Eliminar</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>
      <FormularioActividad visible={formularioVisible} initial={editando || {}} onClose={() => setFormularioVisible(false)} onSubmit={enviarFormulario} />
    </View>
  )
}

const estilos = StyleSheet.create({
  bg: {
    flex: 1,
    backgroundColor: '#cdb4db',
    paddingTop: 40,
    paddingHorizontal: 0,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    marginBottom: 0,
    paddingHorizontal: 18,
    marginTop: 10,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 18,
    paddingHorizontal: 18,
    marginTop: 10,
  },
  header: {
    fontWeight: '700',
    fontSize: 18,
    color: '#624b9b',
  },
  // Consolidamos estilos para evitar duplicidades en filas de acciones.
  button: {
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 18,
    paddingVertical: 10,
    marginLeft: 8,
    borderWidth: 2,
    borderColor: '#9d4edd',
  },
  header: {
      fontWeight: '700',
      fontSize: 30,
      color: '#624b9b',
      marginBottom: 22,
    },
  buttonText: {
    color: '#9d4edd',
    fontWeight: '700',
    fontSize: 15,
  },
  scrollContent: {
    paddingBottom: 40,
    padding: 18,
  },
    card: {
      backgroundColor: '#fff',
      borderRadius: 18,
      padding: 18,
      marginBottom: 14,
      shadowColor: '#000',
      shadowOpacity: 0.08,
      shadowRadius: 6,
      elevation: 1,
    },
  titulo: {
    fontWeight: '700',
    fontSize: 15,
    marginBottom: 4,
  },
  meta: {
    color: '#624b9b',
    fontWeight: '700',
    fontSize: 13,
    marginBottom: 2,
  },
  descripcion: {
    color: '#333',
    marginBottom: 6,
  },
  reservasBox: {
    marginTop: 8,
    marginBottom: 8,
  },
  reservasTitle: {
    fontWeight: '700',
    fontSize: 14,
    color: '#624b9b',
    marginBottom: 4,
  },
  reservaItem: {
    color: '#333',
    fontSize: 13,
    marginBottom: 2,
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 8,
  },
  editBtn: {
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
  editBtnText: {
    color: '#9d4edd',
    fontWeight: '700',
    fontSize: 15,
  },
  deleteBtn: {
    backgroundColor: '#e07a7a',
    borderRadius: 12,
    paddingHorizontal: 18,
    paddingVertical: 10,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  deleteBtnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 15
  }
})
