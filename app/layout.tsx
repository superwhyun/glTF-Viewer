import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'GLTF Viewer',
  description: 'Interactive 3D model viewer for GLTF, GLB, and VRM files',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
