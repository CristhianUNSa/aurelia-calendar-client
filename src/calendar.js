import {inject, Lazy} from 'aurelia-framework';
import {HttpClient} from 'aurelia-fetch-client';
import moment from 'moment';

// polyfill fetch client conditionally
const fetchPolyfill = !self.fetch
  ? System.import('isomorphic-fetch' /* webpackChunkName: 'fetch' */)
  : Promise.resolve(self.fetch);

  function randomIntFromInterval(min,max)
  {
      return Math.floor(Math.random()*(max-min+1)+min);
  }

@inject(Lazy.of(HttpClient))
export class Calendar {
  heading = 'Amadeus Calendar response';
  busquedaAereoResponse = {};
  calendarioJson = {};
  calendario = new Array(7);

  constructor(getHttpClient) {
    this.getHttpClient = getHttpClient;
  }

  async activate() {
    // ensure fetch is polyfilled before we create the http client
    await fetchPolyfill;
    const http = this.http = this.getHttpClient();

    http.configure(config => {
      config
        .useStandardConfiguration()
        .withBaseUrl('http://localhost:1370/');
    });

    // Variables que deberia proveer el cliente
    const flexibilidadDias = randomIntFromInterval(11,10000);
    // const flexibilidadDias = 7;
    const agenciaId = "testclarika";
    const fechaIdaRef = "15012018";
    const fechaVueltaRef = "24012018";

    // Constantes de fecha de ida y vuelta
    const fechaIdaMoment = moment(fechaIdaRef, "DDMMYYYY");
    const fechaVueltaMoment = moment(fechaVueltaRef, "DDMMYYYY");
    
    // Inicializar 'matriz' de fechas
    for (let fila = 0; fila < 7; fila++) {
      this.calendario[fila] = new Array(7);
      for(let columna = 0; columna < 7; columna++) {
        const fechaIdaMenos3 = fechaIdaMoment.clone().add(fila - 3, 'days');
        const fechaVueltaMenos3 = fechaVueltaMoment.clone().add(columna - 3, 'days');
        this.calendario[fila][columna] = new AereoCalendarResponse(0, 0, 0, 0, fechaIdaMenos3, fechaVueltaMenos3);
      }
    }
    // Llamar al servicio de busqueda
    // const response = await http.fetch(`BusquedaAereosService.svc/BuscarVuelosCalendario/?cachebuster=57783886752003410&Token=bc6b9815-91e4-4a93-b90f-3413faa24029&AgenciaID=${agenciaId}&CantidadAdultos=1&FiltroPrecioOrdenarDescendente=0&FiltroResultadoOffset=1&FiltroResultadoRegistros=49&IsFlightWithHotelSearch=false&Tramo1AeropuertoDestinoIATA=CUN&Tramo1AeropuertoDestinoID=1359&Tramo1CiudadOrigenIATA=BUE&Tramo1CiudadOrigenID=1369&Tramo1FechaLlegada=${fechaVueltaRef}&Tramo1FechaPartida=${fechaIdaRef}&Tramo1ZonaDestinoID=5&Tramo1ZonaOrigenID=6&source=b2b&FlexibilidadDias=${flexibilidadDias}`);
    const response = await http.fetch(`BusquedaAereosService.svc/BuscarVuelosCalendario/?cachebuster=93539379269915360&Token=bc6b9815-91e4-4a93-b90f-3413faa24029&AgenciaID=testclarika&CantidadAdultos=1&FiltroPrecioOrdenarDescendente=0&FiltroResultadoOffset=1&FiltroResultadoRegistros=100&IsFlightWithHotelSearch=false&Tramo1AeropuertoDestinoIATA=CUN&Tramo1AeropuertoDestinoID=1359&Tramo1CiudadOrigenIATA=BUE&Tramo1CiudadOrigenID=1369&Tramo1FechaLlegada=22012018&Tramo1FechaPartida=16012018&Tramo1ZonaDestinoID=5&Tramo1ZonaOrigenID=6&source=b2b&FlexibilidadDias=${flexibilidadDias}`);
    const respJson = await response.json();
    for (let i = 0; i < respJson.length ; i++) {
      const startIda = respJson[i].IdaDeparture.indexOf("(") + 1;
      const endIda = respJson[i].IdaDeparture.indexOf(")");
      const startVuelta = respJson[i].VueltaDeparture.indexOf("(") + 1;
      const endVuelta = respJson[i].VueltaDeparture.indexOf(")");
      const fechaIdaParsed = parseInt(respJson[i].IdaDeparture.substring(startIda, endIda), 10);
      const fechaVueltaParsed = parseInt(respJson[i].VueltaDeparture.substring(startIda, endIda), 10);
      const fechaIdaResponseMoment = moment(new Date(fechaIdaParsed));
      const fechaVueltaResponseMoment = moment(new Date(fechaVueltaParsed));
      

        for (let fila = 0; fila < 7; fila++) {
          for(let columna = 0; columna < 7; columna++) {
            const fechaIdaCalendario = this.calendario[fila][columna].IdaDeparture;
            const fechaVueltaCalendario = this.calendario[fila][columna].VueltaDeparture;
            if(fechaIdaCalendario.isSame(fechaIdaResponseMoment, 'day') &&
               fechaVueltaCalendario.isSame(fechaVueltaResponseMoment, 'day')
            ) {
              this.calendario[fila][columna].ImporteCargos = respJson[i].ImporteCargos;
              this.calendario[fila][columna].ImporteImpuestosTasas = respJson[i].ImporteImpuestosTasas;
              this.calendario[fila][columna].ImportePasajes = respJson[i].ImportePasajes;
              this.calendario[fila][columna].ImporteTotal = respJson[i].ImporteTotal;
            }
          }
        }
    }
    this.busquedaAereoResponse = JSON.stringify(respJson, null, 2);
    this.calendarioJson = JSON.stringify(this.calendario, null, 2);
  }
  
}

class AereoCalendarResponse {
  constructor(ImporteCargos, ImporteImpuestosTasas, ImportePasajes, ImporteTotal, IdaDeparture, VueltaDeparture){
    this.ImporteCargos = ImporteCargos;
    this.ImporteImpuestosTasas = ImporteImpuestosTasas;
    this.ImportePasajes = ImportePasajes;
    this.ImporteTotal = ImporteTotal;
    this.IdaDeparture = IdaDeparture;
    this.VueltaDeparture = VueltaDeparture;
  }
}
