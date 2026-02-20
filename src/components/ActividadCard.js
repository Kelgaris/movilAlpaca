import { useState } from "react";
import { TouchableOpacity, View } from "react-native";


export default function ActividadCard({ actividad }){

    // Declaramos estado para expandir o contraer detalle de tarjeta.
    const [expandida, setExpandida] = useState(false);

    return(
        <TouchableOpacity onPress={()=> setExpandida(!expandida)}>
            <View style={{
                padding:15,
                backgroundColor: '#fff',
                margin:10
            }}>
                <Text>{actividad.titulo}</Text>
                <Text>{actividad.juego}</Text>

                {expandida && (
                    <>
                    <Text>{actividad.descripcion}</Text>
                    </>
                )}
            </View>
        </TouchableOpacity>
    )
}