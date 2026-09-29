import { ImageResponse } from 'next/og';

export const alt = "DevN'Visuals Trivia";
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OpenGraphImage() {
  return new ImageResponse(
    <div style={{ background: '#FCF4F4', color: '#1E1E1E', display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'center', padding: '80px', width: '100%' }}>
      <div style={{ color: '#3186FF', fontSize: 28, fontWeight: 700, letterSpacing: 4 }}>DEVN&apos;VISUALS</div>
      <div style={{ fontSize: 78, fontWeight: 800, marginTop: 28 }}>Trivia that brings</div>
      <div style={{ color: '#3186FF', fontSize: 78, fontWeight: 800 }}>the community together.</div>
      <div style={{ color: '#1E1E1E99', fontSize: 28, marginTop: 34 }}>Test your knowledge. Meet your people. Keep learning.</div>
    </div>,
    { ...size },
  );
}