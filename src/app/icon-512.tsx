import { ImageResponse } from 'next/og'

// Route segment config
export const runtime = 'edge'

// Image metadata
export const size = {
  width: 512,
  height: 512,
}
export const contentType = 'image/png'

// Image generation
export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
          height: '100%',
          borderRadius: '64px',
          background: 'hsl(142.1 70.6% 45.3%)', // primary color
        }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="320"
          height="320"
          viewBox="0 0 24 24"
          fill="none"
          stroke="hsl(210 40% 98%)" // primary-foreground
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M20.24 12.24a6 6 0 0 0-8.49-8.49L5 10.5V19h8.5z"></path>
          <line x1="16" x2="2" y1="8" y2="22"></line>
          <line x1="17.5" x2="9" y1="15" y2="15"></line>
        </svg>
      </div>
    ),
    {
      ...size,
    }
  )
}
