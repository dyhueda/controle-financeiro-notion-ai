import "./globals.css";
import { Quicksand } from 'next/font/google'
 
const quicksand = Quicksand({
  subsets: ['latin'],
})

export const metadata = {
  title: "Controle Financeiro",
  description: "Pagina para dar upload em imagens e adicionar no controle financeiro",
  icons:{
    icon: '/favicon.ico',
  }
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body
        className={`${quicksand.className} bg-slate-800 text-white p-3 min-h-screen max-w-screen `} style={{isolation:"isolate"}}
      >
        {children}
      </body>
    </html>
  );
}
