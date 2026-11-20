import { describe,expect,it } from 'vitest';
import { criticalZones } from './geo';

describe('zonas críticas',()=>{
  it('agrupa puntos cercanos y conserva reportes sin coordenadas',()=>{
    const zones=criticalZones([
      {address:'Parque uno',latitude:-11.9511,longitude:-77.0511},
      {address:'Parque dos',latitude:-11.9512,longitude:-77.0512},
      {address:'Avenida Sur',latitude:null,longitude:null},
    ]);
    expect(zones[0]).toMatchObject({count:2,latitude:-11.951,longitude:-77.051});
    expect(zones[1]).toMatchObject({label:'Avenida Sur',count:1,latitude:null});
  });
});
