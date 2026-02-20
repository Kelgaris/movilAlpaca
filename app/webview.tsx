import { Asset } from 'expo-asset'
import React from 'react'
import { ActivityIndicator, View } from 'react-native'
import { WebView } from 'react-native-webview'

export default function WebAppScreen() {
  // Declaramos URI local del build web que cargaremos en WebView.
  const [uri, setUri] = React.useState<string | null>(null)

  React.useEffect(() => {
    // Controlamos montaje para evitar setState después de desmontar.
    let mounted = true
    ;(async () => {
      try {
        // Descargamos asset local de index web y guardamos su ruta utilizable.
        const asset = Asset.fromModule(require('../web_dist/index.html'))
        await asset.downloadAsync()
        if (mounted) setUri(asset.localUri || asset.uri)
      } catch (e) {
        // Informamos en consola cuando no podemos cargar la versión web embebida.
        console.warn('No se pudo cargar index.html local:', e)
      }
    })()
    return () => {
      // Marcamos desmontaje para cortar actualizaciones tardías de estado.
      mounted = false
    }
  }, [])

  // Mostramos indicador mientras resolvemos la URI del contenido web local.
  if (!uri) return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator />
    </View>
  )

  return (
    <WebView
      originWhitelist={["*"]}
      source={{ uri }}
      style={{ flex: 1 }}
    />
  )
}
