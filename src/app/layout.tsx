import type { Metadata } from 'next';
import './globals.css';
export const metadata:Metadata={title:'HuellaLimpia | Cuidemos Lima Norte',description:'Registra a tu mascota y reporta problemas de salubridad en tu distrito.'};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="es"><body>{children}</body></html>}
