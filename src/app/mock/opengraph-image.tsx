import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'Mock Data Generator - AI-Powered Test Data Generation'
export const size = { width: 1200, height: 630 }
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
          background: '#0f0f1e',
          position: 'relative',
        }}
      >
        {/* Data pattern background */}
        <div
          style={{
            position: 'absolute',
            top: '0',
            left: '0',
            width: '100%',
            height: '100%',
            display: 'flex',
            flexWrap: 'wrap',
            gap: '40px',
            padding: '40px',
            opacity: 0.03,
          }}
        >
          {Array.from({ length: 50 }).map((_, i) => (
            <div
              key={i}
              style={{
                fontSize: '14px',
                color: 'white',
                fontFamily: 'monospace',
                display: 'flex',
              }}
            >
              {`{ "id": ${i}, "name": "..." }`}
            </div>
          ))}
        </div>

        {/* JSON icon representation */}
        <div
          style={{
            position: 'absolute',
            top: '15%',
            right: '12%',
            display: 'flex',
            flexDirection: 'column',
            gap: '15px',
            opacity: 0.15,
          }}
        >
          <div
            style={{
              width: '180px',
              height: '40px',
              border: '3px solid #7f13ec',
              borderRadius: '8px',
              display: 'flex',
            }}
          />
          <div
            style={{
              width: '220px',
              height: '40px',
              border: '3px solid #7f13ec',
              borderRadius: '8px',
              display: 'flex',
            }}
          />
          <div
            style={{
              width: '160px',
              height: '40px',
              border: '3px solid #7f13ec',
              borderRadius: '8px',
              display: 'flex',
            }}
          />
        </div>

        {/* Main content */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '25px',
            zIndex: 1,
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '20px',
            }}
          >
            {/* Curly brace icon */}
            <div
              style={{
                fontSize: '80px',
                color: '#7f13ec',
                fontFamily: 'monospace',
                fontWeight: 'bold',
                display: 'flex',
              }}
            >
              {'{ }'}
            </div>

            <h1
              style={{
                fontSize: '72px',
                fontWeight: 'bold',
                color: 'white',
                margin: 0,
                letterSpacing: '-0.03em',
              }}
            >
              Mock Data Generator
            </h1>
          </div>

          <p
            style={{
              fontSize: '38px',
              color: 'rgba(255, 255, 255, 0.85)',
              margin: 0,
              fontWeight: 500,
            }}
          >
            AI-Powered Test Data Generation
          </p>

          {/* Badge */}
          <div
            style={{
              marginTop: '15px',
              padding: '12px 28px',
              background: 'rgba(127, 19, 236, 0.15)',
              border: '2px solid rgba(127, 19, 236, 0.3)',
              borderRadius: '999px',
              fontSize: '24px',
              color: 'rgba(255, 255, 255, 0.7)',
              display: 'flex',
            }}
          >
            Part of AI Utils
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  )
}
