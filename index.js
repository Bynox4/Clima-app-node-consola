import * as dotenv from 'dotenv' 
dotenv.config()
import { inquirerMenu, leerInput, listarLugares, pausa } from './helpers/inquirer.js'
import Busquedas from './models/busquedas.js';

const main = async() =>{

    const busquedas = new Busquedas();
    let opt;

    do {
        opt = await inquirerMenu();

        switch (opt) {
            case 1:
                // Mostrar mensaje
                const lugar = await leerInput('Ciudad: ');
                
                // Buscar los lugares
                const lugares = await busquedas.ciudad( lugar );
                
                // Seleccionar el lugar
                const idSelect = await listarLugares( lugares );
                if ( idSelect === '0' ) continue;

                const lugarSel = lugares.find( l => l.id === idSelect);

                // Guardar en DB
                busquedas.agregarHistorial( lugarSel.nombre );

                // Clima
                const clima = await busquedas.climaLugar( lugarSel.lat, lugarSel.lng );

                // Mostrar resultados
                console.clear();
                console.log('\ninformacion del lugar\n'.green);
                console.log('Ciudad:', lugarSel.nombre);
                console.log('Lat:', lugarSel.lat);
                console.log('Lng:', lugarSel.lng);
                console.log('Temperatura:', clima.temp);
                console.log('Mínima:', clima.min);
                console.log('Máxima:', clima.max);
                console.log('Como está el clima:', clima.desc);
                break;
        
            case 2:
                busquedas.historialCapitalizado.forEach( (lugar, i) => {
                    const idx = `${ i + 1}.`.green;
                    console.log(`${idx} ${lugar} `);
                })

                break;
        }

        if( opt !== 0 ) await pausa();
    } while ( opt !== 0);
}

main();