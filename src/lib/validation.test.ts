import { describe,expect,it } from 'vitest';
import { allowedNextStatuses,incidentSchema,petSchema,statusSchema } from './validation';
describe('validaciones de dominio',()=>{it('rechaza mascota con edad imposible',()=>{expect(petSchema.safeParse({name:'Luna',species:'Perro',age:80}).success).toBe(false)});it('acepta reporte de distrito admitido',()=>{expect(incidentSchema.safeParse({district:'Comas',address:'Av. principal 123',description:'Hay desechos acumulados junto al parque.'}).success).toBe(true)});it('exige motivo al rechazar',()=>{expect(statusSchema.safeParse({status:'rechazado',observation:''}).success).toBe(false)})});
describe('geografía y transición',()=>{
  it('exige el par de coordenadas y límites de Lima Norte',()=>{
    const report={district:'Comas',address:'Av. principal 123',description:'Hay desechos acumulados junto al parque.'};
    expect(incidentSchema.safeParse({...report,latitude:'-11.95',longitude:'-77.05'}).success).toBe(true);
    expect(incidentSchema.safeParse({...report,latitude:'-11.95',longitude:''}).success).toBe(false);
    expect(incidentSchema.safeParse({...report,latitude:'10',longitude:'-77.05'}).success).toBe(false);
  });
  it('no permite saltar de pendiente a resuelto',()=>{
    expect(allowedNextStatuses('pendiente')).not.toContain('resuelto');
    expect(allowedNextStatuses('en_atencion')).toContain('resuelto');
    expect(allowedNextStatuses('resuelto')).toEqual(['resuelto']);
  });
});
