import DateTimePicker from '@react-native-community/datetimepicker'
import { useEffect, useState } from 'react'
import { Alert, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'

export default function FormularioActividad({ visible, onClose, onSubmit, initial = {} }) {
  // Declaramos estado local para campos de actividad y selectores de fecha/hora.
  const [titulo, setTitulo] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [tipo, setTipo] = useState('taller')
  const [juego, setJuego] = useState('')
  const [fechaInicio, setFechaInicio] = useState('')
  const [fechaFin, setFechaFin] = useState('')
  const [capacidadMaxima, setCapacidadMaxima] = useState('1')
  const [mostrarFechaInicio, setMostrarFechaInicio] = useState(false)
  const [mostrarHoraInicio, setMostrarHoraInicio] = useState(false)
  const [mostrarFechaFin, setMostrarFechaFin] = useState(false)
  const [mostrarHoraFin, setMostrarHoraFin] = useState(false)

  useEffect(() => {
    // Sincronizamos formulario con datos iniciales al abrir modal o cambiar edición.
    setTitulo(initial.titulo || '')
    setDescripcion(initial.descripcion || '')
    setTipo(initial.tipo || 'taller')
    setJuego(initial.juego || '')
    setFechaInicio(initial.fechaInicio ? String(initial.fechaInicio) : '')
    setFechaFin(initial.fechaFin ? String(initial.fechaFin) : '')
    setCapacidadMaxima(initial.capacidadMaxima ? String(initial.capacidadMaxima) : '1')
  }, [initial, visible])

  function enviarActividad() {
    // Validamos campos obligatorios y emitimos payload normalizado al padre.
    if (!titulo || !fechaInicio || !fechaFin || !capacidadMaxima) {
      return Alert.alert('Error', 'Rellena los campos obligatorios: título, fechas y capacidad')
    }

    const payload = {
      titulo,
      descripcion: descripcion || undefined,
      tipo: tipo || 'taller',
      juego: juego || null,
      fechaInicio,
      fechaFin,
      capacidadMaxima: Number(capacidadMaxima)
    }

    onSubmit(payload)
  }

  function manejarFechaInicio(event, date) {
    // Actualizamos fecha de inicio preservando hora previa y abrimos selector de hora.
    setMostrarFechaInicio(false)
    if (date) {
      const prev = fechaInicio ? new Date(fechaInicio) : new Date()
      date.setHours(prev.getHours())
      date.setMinutes(prev.getMinutes())
      setFechaInicio(date.toISOString())
    }
    setMostrarHoraInicio(true)
  }

  function manejarHoraInicio(event, time) {
    // Actualizamos hora de inicio sobre la fecha actualmente seleccionada.
    setMostrarHoraInicio(false)
    if (time) {
      const prev = fechaInicio ? new Date(fechaInicio) : new Date()
      prev.setHours(time.getHours())
      prev.setMinutes(time.getMinutes())
      setFechaInicio(prev.toISOString())
    }
  }

  function manejarFechaFin(event, date) {
    // Actualizamos fecha de fin preservando hora previa y abrimos selector de hora.
    setMostrarFechaFin(false)
    if (date) {
      const prev = fechaFin ? new Date(fechaFin) : new Date()
      date.setHours(prev.getHours())
      date.setMinutes(prev.getMinutes())
      setFechaFin(date.toISOString())
    }
    setMostrarHoraFin(true)
  }

  function manejarHoraFin(event, time) {
    // Actualizamos hora de fin sobre la fecha actualmente seleccionada.
    setMostrarHoraFin(false)
    if (time) {
      const prev = fechaFin ? new Date(fechaFin) : new Date()
      prev.setHours(time.getHours())
      prev.setMinutes(time.getMinutes())
      setFechaFin(prev.toISOString())
    }
  }

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.header}>{initial._id ? 'Editar actividad' : 'Nueva actividad'}</Text>

        <Text style={styles.label}>Título *</Text>
        <TextInput style={styles.input} value={titulo} onChangeText={setTitulo} placeholder="Título" />

        <Text style={styles.label}>Descripción</Text>
        <TextInput style={[styles.input, styles.multiline]} value={descripcion} onChangeText={setDescripcion} placeholder="Descripción" multiline />

        <Text style={styles.label}>Tipo (taller|torneo|presentacion|tcg)</Text>
        <TextInput style={styles.input} value={tipo} onChangeText={setTipo} placeholder="taller" />

        <Text style={styles.label}>Juego (opcional)</Text>
        <TextInput style={styles.input} value={juego} onChangeText={setJuego} placeholder="Nombre del juego" />

        <Text style={styles.label}>Fecha inicio</Text>
        <TouchableOpacity style={styles.input} onPress={() => setMostrarFechaInicio(true)}>
          <Text>{fechaInicio ? new Date(fechaInicio).toLocaleString() : 'Selecciona fecha inicio'}</Text>
        </TouchableOpacity>
        {mostrarFechaInicio && (
          <DateTimePicker
            value={fechaInicio ? new Date(fechaInicio) : new Date()}
            mode="date"
            display="calendar"
            onChange={manejarFechaInicio}
          />
        )}
        {mostrarHoraInicio && (
          <DateTimePicker
            value={fechaInicio ? new Date(fechaInicio) : new Date()}
            mode="time"
            display="spinner"
            onChange={manejarHoraInicio}
          />
        )}
        <Text style={styles.label}>Fecha fin</Text>
        <TouchableOpacity style={styles.input} onPress={() => setMostrarFechaFin(true)}>
          <Text>{fechaFin ? new Date(fechaFin).toLocaleString() : 'Selecciona fecha fin'}</Text>
        </TouchableOpacity>
        {mostrarFechaFin && (
          <DateTimePicker
            value={fechaFin ? new Date(fechaFin) : new Date()}
            mode="date"
            display="calendar"
            onChange={manejarFechaFin}
          />
        )}
        {mostrarHoraFin && (
          <DateTimePicker
            value={fechaFin ? new Date(fechaFin) : new Date()}
            mode="time"
            display="spinner"
            onChange={manejarHoraFin}
          />
        )}

        <Text style={styles.label}>Capacidad máxima</Text>
        <TextInput style={styles.input} value={capacidadMaxima} onChangeText={setCapacidadMaxima} keyboardType="numeric" />

        <View style={styles.actions}>
          <TouchableOpacity style={styles.createBtn} onPress={enviarActividad}>
            <Text style={styles.createBtnText}>{initial._id ? 'Guardar' : 'Crear'}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
            <Text style={styles.cancelBtnText}>Cancelar</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </Modal>
  )
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingBottom: 40,
    backgroundColor: '#cdb4db',
    borderRadius: 18,
    margin: 10,
    shadowColor: '#9d4edd',
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 2,
  },
  header: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 12,
    color: '#9d4edd',
    textAlign: 'center',
  },
  label: {
    marginTop: 10,
    marginBottom: 6,
    color: '#624b9b',
    fontWeight: '600',
  },
  input: {
    borderWidth: 1,
    borderColor: '#b5aed6',
    borderRadius: 8,
    padding: 10,
    backgroundColor: '#fff',
    marginBottom: 8,
    fontSize: 15,
    color: '#624b9b',
  },
  multiline: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  actions: {
    flexDirection: 'row',
    marginTop: 18,
    justifyContent: 'center',
    gap: 12,
  },
  createBtn: {
    flex: 1,
    backgroundColor: '#9d4edd',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginRight: 6,
  },
  createBtnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
  cancelBtn: {
    flex: 1,
    backgroundColor: '#b5aed6',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginLeft: 6,
  },
  cancelBtnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
})
