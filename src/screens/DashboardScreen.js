import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { getActividades } from '../api/api';

export default function DashboardScreen() {
  // Inicializamos navegación y estado para usuario y actividades.
  const router = useRouter();
  const [usuario, setUsuario] = useState(null);
  const [listaActividades, setListaActividades] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    (async () => {
      // Recuperamos sesión local y cargamos actividades para dashboard.
      const auth = await AsyncStorage.getItem('auth');
      if (auth) setUsuario(JSON.parse(auth).user);
      const actividades = await getActividades();
      setListaActividades(actividades);
      setCargando(false);
    })();
  }, []);

  function cerrarSesion() {
    // Eliminamos sesión persistida y volvemos a login.
    AsyncStorage.removeItem('auth');
    router.replace('/login');
  }

  // Calculamos la próxima actividad reservada por el usuario.
  const proximaCita = listaActividades
    .filter(actividad => {
      const ahora = new Date();
      const tieneReserva = (actividad.reservas || []).some(reserva =>
        usuario && reserva.usuarioId?.toString() === usuario._id && reserva.estado === 'reservada'
      )
      const fecha = new Date(actividad.fechaInicio)
      return tieneReserva && fecha > ahora
    })
    .sort((a, b) => new Date(a.fechaInicio) - new Date(b.fechaInicio))[0]

  // Calculamos actividades próximas dentro de los siguientes 14 días.
  const ahora = new Date();
  const limite = new Date();
  limite.setDate(ahora.getDate() + 14);
  const actividadesTendencia = listaActividades
    .filter(actividad => {
      const fecha = new Date(actividad.fechaInicio)
      return fecha > ahora && fecha < limite
    })
    .sort((a, b) => new Date(a.fechaInicio) - new Date(b.fechaInicio))
    .slice(0, 3)

  return (
    <ScrollView style={estilos.bg} contentContainerStyle={{ paddingBottom: 40 }}>
      {/* Renderizamos encabezado principal con acceso rápido a pantallas clave. */}
      <View style={estilos.header}>
        <View style={estilos.welcomeRow}>
          <View style={estilos.avatar}><Image source={require('../../assets/images/alpaca.png')} style={{ width: 32, height: 32 }} /></View>
          <View>
            <Text style={estilos.welcomeTitle}>Bienvenido a Alpaca Chinchona</Text>
            {usuario && <Text style={estilos.userMail}>{usuario.email}</Text>}
          </View>
        </View>
        <View style={estilos.headerActions}>
            <TouchableOpacity style={estilos.menuBtn} onPress={() => router.push('/dashboard')}><Text style={estilos.menuBtnText}>Inicio</Text></TouchableOpacity>
            <TouchableOpacity style={estilos.menuBtn} onPress={() => router.push('/actividades')}><Text style={estilos.menuBtnText}>Actividades</Text></TouchableOpacity>
            <TouchableOpacity style={estilos.menuBtn} onPress={cerrarSesion}><Text style={estilos.menuBtnText}>Cerrar Sesión</Text></TouchableOpacity>
        </View>
      </View>

      {/* Renderizamos sección destacada con imagen principal. */}
      <View style={estilos.hero}>
        <Image source={require('../../assets/images/lorwing.png')} style={estilos.heroImg} />
        <View style={estilos.heroOverlay}>
          <Text style={estilos.statDesc}>Anótate en actividades para ganar puntos</Text>
        </View>
      </View>

      {/* Renderizamos carrusel de actividades próximas recomendadas. */}
      <View style={estilos.sectionHeader}><Text style={estilos.sectionTitle}>Próximas Actividades</Text></View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={estilos.actividadesGrid}>
        {actividadesTendencia.map(actividad => (
          <View key={actividad._id} style={estilos.actividadCard}>
            <Text style={estilos.actividadTitle}>{actividad.titulo}</Text>
            <Text style={estilos.actividadDesc}>{actividad.descripcion}</Text>
            <Text style={estilos.actividadPlazas}>{actividad.capacidadMaxima - (actividad.reservas?.length || 0)} plazas libres</Text>
          </View>
        ))}
      </ScrollView>

      {/* Renderizamos bloque de noticias y novedades de comunidad. */}
      <View style={estilos.sectionHeader}><Text style={estilos.sectionTitle}>Comunidad y Noticias</Text></View>
      <View style={estilos.newsCard}>
        <Image source={require('../../assets/images/explosivos.png')} style={estilos.newsIcon} />
        <View>
          <Text style={estilos.newsTag}>JUEGO DEL MES</Text>
          <Text style={estilos.newsTitle}>Exploding Kittens: Nueva Expansión</Text>
          <Text style={estilos.newsDesc}>¡Ven a probarlo este viernes gratis!</Text>
        </View>
      </View>
      <View style={estilos.newsCard}>
        <Image source={require('../../assets/images/nuevosHorarios.png')} style={estilos.newsIcon} />
        <View>
          <Text style={estilos.newsTitle}>Nuevos horarios de fin de semana</Text>
          <Text style={estilos.newsDesc}>Ampliamos el cierre a las 22:00h los sábados.</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const estilos = StyleSheet.create({
  bg: {
    flex: 1,
    backgroundColor: '#cdb4db', // Aplicamos fondo morado suave para identidad visual.
    paddingTop: 40,
    paddingHorizontal: 0,
  },
  header: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    marginBottom: 18,
    paddingHorizontal: 18,
  },
  welcomeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12
  },
  avatar: {
    backgroundColor: '#624b9b',
    padding: 10,
    borderRadius: 20,
    marginRight: 10
  },
  welcomeTitle: {
    fontWeight: '700',
    fontSize: 16,
    color: '#624b9b'
  },
  userMail: {
    color: '#333',
    fontSize: 12
  },
  headerActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 8,
    marginLeft: 0,
  },
  menuBtn: {
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 18,
    paddingVertical: 10,
    marginLeft: 8,
    borderWidth: 1,
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
  hero: {
    position: 'relative',
    borderRadius: 20,
    overflow: 'hidden',
    marginHorizontal: 18,
    marginBottom: 18,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 2
  },
  heroImg: {
    width: '100%',
    height: 180,
    resizeMode: 'cover'
  },
  heroOverlay: {
    position: 'absolute',
    bottom: 18,
    left: 18
  },
  badge: {
    backgroundColor: '#624b9b',
    color: '#fff',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    fontWeight: 'bold',
    marginBottom: 4
  },
  heroTitle: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 18
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 18,
    paddingHorizontal: 18
  },
  statCard: {
    backgroundColor: '#ffffffcc',
    borderRadius: 16,
    padding: 18,
    flex: 1,
    marginRight: 8,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 1
  },
  statLabel: {
    color: '#624b9b',
    fontWeight: '700',
    marginBottom: 4
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 2
  },
  statDesc: {
    color: '#333',
    fontSize: 13
  },
  sectionHeader: {
    marginTop: 10,
    marginBottom: 6,
    paddingHorizontal: 18
  },
  sectionTitle: {
    color: '#624b9b',
    fontWeight: '700',
    fontSize: 18
  },
  actividadesGrid: {
    flexDirection: 'row',
    paddingLeft: 18,
    marginBottom: 18
  },
  actividadCard: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 18,
    width: 220,
    marginRight: 14,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 1
  },
  actividadTitle: {
    fontWeight: '700',
    fontSize: 15,
    marginBottom: 4
  },
  actividadDesc: {
    color: '#333',
    marginBottom: 6
  },
  actividadPlazas: {
    color: '#624b9b',
    fontWeight: '700',
    fontSize: 13
  },
  newsCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 16,
    marginHorizontal: 18,
    marginTop: 12,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 1
  },
  newsIcon: {
    width: 54,
    height: 54,
    borderRadius: 12,
    marginRight: 14
  },
  newsTag: {
    color: '#624b9b',
    fontWeight: 'bold',
    fontSize: 13
  },
  newsTitle: {
    fontWeight: '700',
    fontSize: 15
  },
  newsDesc: {
    color: '#333',
    fontSize: 13
  }
})