import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'AI Utils - AI-Powered Developer Tools'
export const size = { width: 1200, height: 600 }
export const contentType = 'image/png'

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #7f13ec 0%, #1a1a2e 100%)',
          position: 'relative',
        }}
      >
        {/* Decorative circles */}
        <div
          style={{
            position: 'absolute',
            top: '5%',
            right: '15%',
            width: '180px',
            height: '180px',
            borderRadius: '50%',
            border: '3px solid rgba(255, 255, 255, 0.1)',
            display: 'flex',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: '10%',
            left: '10%',
            width: '130px',
            height: '130px',
            borderRadius: '50%',
            border: '3px solid rgba(255, 255, 255, 0.1)',
            display: 'flex',
          }}
        />

        {/* Decorative lines */}
        <div
          style={{
            position: 'absolute',
            top: '25%',
            left: '0',
            width: '350px',
            height: '2px',
            background: 'rgba(255, 255, 255, 0.1)',
            transform: 'rotate(-15deg)',
            display: 'flex',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: '20%',
            right: '0',
            width: '300px',
            height: '2px',
            background: 'rgba(255, 255, 255, 0.1)',
            transform: 'rotate(15deg)',
            display: 'flex',
          }}
        />

        {/* Main content */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '18px',
            zIndex: 1,
          }}
        >
          <h1
            style={{
              fontSize: '88px',
              fontWeight: 'bold',
              color: 'white',
              margin: 0,
              letterSpacing: '-0.05em',
            }}
          >
            AI Utils
          </h1>

          <p
            style={{
              fontSize: '36px',
              color: 'rgba(255, 255, 255, 0.9)',
              margin: 0,
              fontWeight: 500,
            }}
          >
            AI-Powered Developer Tools
          </p>

          <div
            style={{
              display: 'flex',
              gap: '25px',
              marginTop: '15px',
              fontSize: '26px',
              color: 'rgba(255, 255, 255, 0.8)',
            }}
          >
            <span>Free</span>
            <span>•</span>
            <span>Fast</span>
            <span>•</span>
            <span>Privacy-First</span>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  )
}
