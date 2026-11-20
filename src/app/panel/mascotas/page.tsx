import { redirect } from 'next/navigation';
import { savePet } from '@/app/actions';
import { SubmitButton } from '@/components/submit-button';
import { requireUser } from '@/lib/auth';

type Pet = { id: string; name: string; species: string; breed: string | null; age: number };

function PetFields({ pet }: { pet?: Pet }) {
  const suffix = pet ? `-${pet.id}` : '';
  return <>
    {pet && <input type="hidden" name="id" value={pet.id} />}
    <label htmlFor={`name${suffix}`}>Nombre</label>
    <input id={`name${suffix}`} name="name" defaultValue={pet?.name} required minLength={2} maxLength={80} />
    <label htmlFor={`species${suffix}`}>Especie</label>
    <select id={`species${suffix}`} name="species" defaultValue={pet?.species ?? 'Perro'}>
      <option>Perro</option><option>Gato</option><option>Otro</option>
    </select>
    <label htmlFor={`breed${suffix}`}>Raza (opcional)</label>
    <input id={`breed${suffix}`} name="breed" defaultValue={pet?.breed ?? ''} maxLength={80} />
    <label htmlFor={`age${suffix}`}>Edad aproximada</label>
    <input id={`age${suffix}`} name="age" type="number" min="0" max="40" defaultValue={pet?.age} required />
  </>;
}

export default async function Pets({ searchParams }: { searchParams: Promise<{ error?: string; mensaje?: string }> }) {
  const { db, user, profile } = await requireUser();
  if (profile.role !== 'citizen') redirect('/panel');
  const params = await searchParams;
  const { data: pets, error } = await db.from('pets').select('id,name,species,breed,age')
    .eq('owner_id', user.id).order('created_at', { ascending: false });
  return <>
    <p className="breadcrumb">Panel / Mis mascotas</p>
    <h1>Mis mascotas</h1>
    <p className="muted">Registra y mantén actualizados los datos de tus compañeros.</p>
    {params.error && <p className="alert error" role="alert">{params.error === 'validacion' ? 'Revisa nombre, especie y edad. La edad debe estar entre 0 y 40 años.' : 'No se pudo guardar la mascota. Intenta otra vez.'}</p>}
    {params.mensaje && <p className="alert" role="status">Mascota guardada.</p>}
    {error && <p className="alert error" role="alert">No se pudo cargar la lista de mascotas.</p>}
    {!error && pets?.length === 0 && <p className="alert">Todavía no registras mascotas. Agrega la primera con el formulario.</p>}
    <div className="grid pet-grid">
      {pets?.map((pet) => <details className="card" key={pet.id}>
        <summary><strong>{pet.name}</strong> · {pet.species}</summary>
        <form action={savePet}>
          <PetFields pet={pet} />
          <p><SubmitButton label="Guardar cambios" pendingLabel="Guardando…" /></p>
        </form>
      </details>)}
    </div>
    <section className="card form" style={{ marginTop: '2rem' }}>
      <h2>Registrar mascota</h2>
      <form action={savePet}>
        <PetFields />
        <p><SubmitButton label="Registrar mascota" pendingLabel="Registrando…" /></p>
      </form>
    </section>
  </>;
}
