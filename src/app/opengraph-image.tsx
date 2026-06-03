import { ImageResponse } from 'next/og';
import { readFileSync } from 'fs';
import { join } from 'path';

export const alt = '모여맵 - 내 주변 소셜 모임을 한눈에';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

const CATEGORIES = ['🎉 소셜파티', '🍺 혼술바', '🤝 네트워킹', '💕 로데이션', '🏠 게하파티'];

export default function Image() {
  const logoBuffer = readFileSync(join(process.cwd(), 'public/logo.png'));
  const logoSrc = `data:image/png;base64,${logoBuffer.toString('base64')}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          background: '#0D1117',
          padding: '60px 80px',
          fontFamily: 'system-ui, -apple-system, sans-serif',
        }}
      >
        <img
          src={logoSrc}
          width={240}
          height={240}
          style={{ borderRadius: '36px', flexShrink: 0 }}
        />

        <div style={{ display: 'flex', flexDirection: 'column', marginLeft: '64px', flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '20px' }}>
            <span style={{ fontSize: 96, fontWeight: 900, color: '#ffffff', letterSpacing: '-3px', lineHeight: 1 }}>
              모여맵
            </span>
            <span style={{ fontSize: 42, fontWeight: 700, color: '#7C6FF7', letterSpacing: '-1px' }}>
              MoyeMap
            </span>
          </div>

          <div style={{ fontSize: 34, color: '#94A3B8', marginTop: '18px', fontWeight: 500, letterSpacing: '-0.5px' }}>
            내 주변 소셜 모임을 한눈에
          </div>

          <div style={{ display: 'flex', gap: '12px', marginTop: '44px', flexWrap: 'wrap' }}>
            {CATEGORIES.map((cat) => (
              <div
                key={cat}
                style={{
                  background: 'rgba(124, 111, 247, 0.15)',
                  border: '1.5px solid rgba(124, 111, 247, 0.35)',
                  borderRadius: '999px',
                  padding: '8px 22px',
                  fontSize: 22,
                  color: '#A5B4FC',
                  fontWeight: 600,
                }}
              >
                {cat}
              </div>
            ))}
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
