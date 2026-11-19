import { ImageResponse } from 'next/og'

export const alt = 'Inkspire — Stories, ideas & insights worth sharing'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#0d3d2f',
          backgroundImage: 'linear-gradient(135deg, #0d3d2f 0%, #0d5c44 55%, #0d7a5f 100%)',
          color: '#faf9f6',
          fontFamily: 'Georgia, serif',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 96,
            height: 96,
            borderRadius: 24,
            backgroundColor: '#faf9f6',
            marginBottom: 40,
          }}
        >
          <div style={{ display: 'flex', fontSize: 54, color: '#0d7a5f' }}>&#10022;</div>
        </div>
        <div style={{ display: 'flex', fontSize: 88, fontWeight: 700, letterSpacing: -2 }}>
          Inkspire
        </div>
        <div style={{ display: 'flex', fontSize: 34, marginTop: 28, color: '#d8e8df' }}>
          Stories, ideas &amp; insights worth sharing
        </div>
        <div style={{ display: 'flex', fontSize: 22, marginTop: 56, color: '#9dc4b2' }}>
          Web development · Design · Productivity · Writing
        </div>
      </div>
    ),
    { ...size }
  )
}
