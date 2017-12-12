import {inject, Lazy} from 'aurelia-framework';
import {HttpClient} from 'aurelia-fetch-client';

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
    const flexibilidadDias = randomIntFromInterval(11,10000);
    const response = await http.fetch(`BusquedaAereosService.svc/BuscarVuelosCalendario/?cachebuster=57783886752003410&Token=bc6b9815-91e4-4a93-b90f-3413faa24029&AgenciaID=testclarika&CantidadAdultos=1&FiltroPrecioOrdenarDescendente=0&FiltroResultadoOffset=1&FiltroResultadoRegistros=10&IsFlightWithHotelSearch=false&Tramo1AeropuertoDestinoIATA=CUN&Tramo1AeropuertoDestinoID=1359&Tramo1CiudadOrigenIATA=BUE&Tramo1CiudadOrigenID=1369&Tramo1FechaLlegada=16012018&Tramo1FechaPartida=09012018&Tramo1ZonaDestinoID=5&Tramo1ZonaOrigenID=6&source=b2b&FlexibilidadDias=${flexibilidadDias}`);
    const respJson = await response.json();
    this.busquedaAereoResponse = JSON.stringify(respJson, null, 2);
  }
  
}
