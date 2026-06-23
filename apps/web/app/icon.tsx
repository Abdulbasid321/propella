import { ImageResponse } from 'next/og'

export const size = { width: 32, height: 32 }
export const contentType = 'image/png'

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 32,
          height: 32,
          borderRadius: 6,
          background: '#6E3A5F',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#FBF9F4',
          fontSize: 20,
          fontWeight: 700,
          fontFamily: 'serif',
          letterSpacing: '-0.5px',
        }}
      >
        P
      </div>
    ),
    { ...size },
  )
}
