import { ImageResponse } from 'next/og'
import fs from 'fs'
import path from 'path'

// Image metadata
export const size = {
  width: 32,
  height: 32,
}

export const contentType = 'image/webp'

// Image generation - serve the favicon.webp file
export default async function Icon() {
  // Read the favicon.webp file from public folder
  const faviconPath = path.join(process.cwd(), 'public', 'favicon.webp')
  const faviconBuffer = fs.readFileSync(faviconPath)
  
  return new Response(faviconBuffer, {
    headers: {
      'Content-Type': 'image/webp',
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  })
}
