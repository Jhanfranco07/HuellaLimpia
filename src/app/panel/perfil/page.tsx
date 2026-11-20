import { updateProfile } from '@/app/actions';
import { SubmitButton } from '@/components/submit-button';
import { requireUser } from '@/lib/auth';

export default async function Profile({ searchParams }: { searchParams: Promise<{ error?: string; mensaje?: string }> }) {
  const { user, profile } = await requireUser();
  const params = await searchParams;
  return <>
    <p className="breadcrumb">Panel / Mi perfil</p>
    <h1>Mi perfil</h1>
    <p className="muted">Consulta tu cuenta y actualiza el nombre que aparece en el panel.</p>
    {params.error && <p className="alert error" role="alert">{params.error === 'validacion' ? 'Escribe un nombre de 3 a 120 caracteres.' : 'No se pudo guardar el nombre. Intenta otra vez.'}</p>}
    {params.mensaje && <p className="alert" role="status">Nombre actualizado.</p>}
    <section className="card form">
      <h2>Datos de la cuenta</h2>
      <p><strong>Correo:</strong> {user.email}</p>
      <p><strong>Rol:</strong> {profile.role === 'municipal' ? 'Personal municipal' : 'Ciudadanía'}</p>
      <p><strong>Distrito:</strong> {profile.district ?? 'Sin distrito asignado'}</p>
      <form action={updateProfile}>
        <label htmlFor="full_name">Nombre completo</label>
        <input id="full_name" name="full_name" defaultValue={profile.full_name} required minLength={3} maxLength={120} autoComplete="name" />
        <p><SubmitButton label="Guardar nombre" pendingLabel="Guardando…" /></p>
      </form>
    </section>
  </>;
}
