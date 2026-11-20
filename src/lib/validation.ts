import { z } from 'zod';
export const districts = ['Los Olivos','Comas','San Martín de Porres','Independencia'] as const;
export const petSchema = z.object({name:z.string().trim().min(2).max(80),species:z.enum(['Perro','Gato','Otro']),breed:z.string().trim().max(80).optional(),age:z.coerce.number().int().min(0).max(40)});
export const incidentSchema = z.object({district:z.enum(districts),address:z.string().trim().min(5).max(180),description:z.string().trim().min(15).max(2000)});
export const statusSchema = z.object({status:z.enum(['pendiente','en_revision','en_atencion','resuelto','rechazado']),observation:z.string().trim().max(1000)}).refine(v=>v.status!=='rechazado'||v.observation.length>=5,{message:'Indica el motivo del rechazo.'});
