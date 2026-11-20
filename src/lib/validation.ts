import { z } from 'zod';
export const districts = ['Los Olivos','Comas','San Martín de Porres','Independencia'] as const;
export const petSchema = z.object({name:z.string().trim().min(2).max(80),species:z.enum(['Perro','Gato','Otro']),breed:z.string().trim().max(80).optional(),age:z.coerce.number().int().min(0).max(40)});
const coordinate=(min:number,max:number)=>z.preprocess(value=>value===undefined||value===null||value===''?null:Number(value),z.number().finite().min(min).max(max).nullable());
export const incidentSchema = z.object({district:z.enum(districts),address:z.string().trim().min(5).max(180),description:z.string().trim().min(15).max(2000),latitude:coordinate(-12.15,-11.75),longitude:coordinate(-77.25,-76.85)}).refine(v=>(v.latitude===null)===(v.longitude===null),{message:'Indica ambas coordenadas o ninguna.'});
export const incidentStatuses = ['pendiente','en_revision','en_atencion','resuelto','rechazado'] as const;
export const statusSchema = z.object({status:z.enum(incidentStatuses),observation:z.string().trim().max(1000)}).refine(v=>v.status!=='rechazado'||v.observation.length>=5,{message:'Indica el motivo del rechazo.'});
export type IncidentStatus=typeof incidentStatuses[number];
export function allowedNextStatuses(current:IncidentStatus):IncidentStatus[]{
  const transitions:Record<IncidentStatus,IncidentStatus[]>={
    pendiente:['pendiente','en_revision','en_atencion','rechazado'],
    en_revision:['en_revision','en_atencion','rechazado'],
    en_atencion:['en_atencion','resuelto'],
    resuelto:['resuelto'],rechazado:['rechazado']
  };
  return transitions[current];
}
