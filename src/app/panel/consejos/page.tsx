import Link from 'next/link';
import { Advice } from '@/components/advice';

export default function Consejos() {
  return <>
    <p className="breadcrumb">Panel / Consejos</p>
    <h1>Consejos para cuidar Lima Norte</h1>
    <p className="muted">Pequeñas acciones durante cada paseo ayudan a mantener limpios los espacios compartidos.</p>
    <Advice />
    <p><Link className="button secondary" href="/panel">Volver al panel</Link></p>
  </>;
}
