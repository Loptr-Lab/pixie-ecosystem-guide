import type { Metadata } from 'next';
import './globals.css';
export const metadata:Metadata={title:'PIXIE · Project Companion',description:'Find your place in Loptr Lab. Source-linked status, bounded tasks and feedback drafts.'};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en"><body className="pixie-companion">{children}</body></html>;}
