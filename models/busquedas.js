import fs from 'fs';
import axios from "axios";


class Busquedas {

    historial = [];
    dbPath = './db/database.json';


    constructor(){
        // leer DB si existe
        this.leerDB();
    }

    get historialCapitalizado(){
        return this.historial.map( lugar => {
            let palabras = lugar.split(' ');
            palabras = palabras.map( p => p[0].toUpperCase() + p.substring(1) );

            return palabras.join(' ');
        });
    }

    get paramsMapbox(){
        return {
            'limit': 5,
            'language': 'es',
            'access_token': process.env.MAPBOX_KEY,
        }
    }

    get paramsClima(){
        return{
            units: 'metric',
            lang: 'es',
            appid: process.env.OPENWEATHER_KEY,
        }
    }

    async ciudad( lugar = '' ){

        try {
            // peticion http
            const instance = axios.create({
                baseURL: `https://api.mapbox.com/geocoding/v5/mapbox.places/${ lugar }.json?`,
                params: this.paramsMapbox
            })

            const resp = await instance.get();

            return resp.data.features.map( lugar => ({
                id: lugar.id,
                nombre: lugar.place_name_es,
                lng: lugar.center[0],
                lat: lugar.center[1],
            }))

        } catch (error) {
            return [];
        }
    }

    async climaLugar( lat, lon ){

        try {
            const instance = axios.create({
                baseURL: `https://api.openweathermap.org/data/2.5/weather?`,
                params: { ...this.paramsClima, lat, lon }
            })

            const {data} = await instance.get();

            return{
                desc: data.weather[0].description,
                min: data.main.temp_min,
                max:  data.main.temp_max,
                temp:  data.main.temp
            }
        } catch (error) {
            console.log(error);
        }
    }

    agregarHistorial( lugar = '' ){

        if( this.historial.includes( lugar.toLocaleLowerCase() ) ){
            return;
        }
        this.historial = this.historial.split(0, 5);

        this.historial.unshift( lugar.toLocaleLowerCase() );

        // Grabar en DB
        this.guardarDB();
    }

    guardarDB(){

        const payload = {
            historial: this.historial
        }

        fs.writeFileSync( this.dbPath, JSON.stringify( payload ) );
    }

    leerDB(){

        if( !fs.existsSync(this.dbPath )) return;

        const info = fs.readFileSync( this.dbPath, { encoding: 'utf-8'} );

        const { historial } = JSON.parse( info );

        this.historial = historial


    }

}

export default Busquedas;