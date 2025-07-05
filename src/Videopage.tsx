import React from 'react';
import { useNavigate } from 'react-router-dom';

const VideoPage: React.FC = () => {
  const navigate = useNavigate();
  return (
    <div
      style={{
        minHeight: '100vh',
        width: '100vw',
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {/* Video background */}
      <video
        src={require('./eternalvideo.mp4')}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          objectFit: 'cover',
          zIndex: 1,
        }}
        autoPlay
        loop
        muted
      />
      {/* Overlay for darkening the video */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'rgba(0,0,32,0.25)',
          zIndex: 2,
        }}
      />
      {/* Centered Content */}
      <div
        style={{
          zIndex: 3,
          position: 'relative',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
        }}
      >
        <div style={{ color: '#fff', fontSize: '1.2rem', marginBottom: '1.5rem', opacity: 0.9 }}>
          Eternal AI
        </div>
        <h1 style={{
          color: '#fff',
          fontWeight: 700,
          fontSize: '3.5vw',
          lineHeight: 1.1,
          margin: 0,
          marginBottom: '1.2rem',
          textShadow: '0 2px 16px rgba(0,0,0,0.3)'
        }}>
          Your Soul Journey<br />Report
        </h1>
        <div style={{
          color: '#fff',
          fontSize: '1.1rem',
          maxWidth: 600,
          margin: '0 auto 2.5rem auto',
          opacity: 0.85,
          textShadow: '0 1px 8px rgba(0,0,0,0.2)'
        }}>
          Lorem ipsum dolor sit amet consectetur. Consequat enim mauris ut morbi aliquam mattis. Faucibus turpis nisi ipsum volutpat.
        </div>
        <button
          style={{
            background: 'transparent',
            color: '#fff',
            border: '2px solid #fff',
            borderRadius: '999px',
            padding: '0.9em 2.8em',
            fontSize: '1.2rem',
            fontWeight: 600,
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
            cursor: 'pointer',
            marginTop: '1vw',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.7em'
          }}
          onClick={() => navigate('/report')}
        >
          Your Report <span role="img" aria-label="icon">📝</span>
        </button>
      </div>
    </div>
  );
};

export default VideoPage;
