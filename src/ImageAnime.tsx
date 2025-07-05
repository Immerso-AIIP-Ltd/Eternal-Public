import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import cloud from './5728b602ecfda0aba50d5722658e9163e2697fa1 (1).png';
import image3 from './5728b602ecfda0aba50d5722658e9163e2697fa1.png'


// import videoBg from './eternalvideo.mp4'

const CLOUD_SIZE_VW = 7; // smaller width for more clouds
const CLOUD_SIZE_VH = 10; // smaller height for more clouds
const OVERLAP_VW = 2.5; // overlap clouds horizontally
const OVERLAP_VH = 3; // overlap clouds vertically

// Directions for clouds to move out (8 directions)
const directions = [
  { x: -60, y: -60 }, // top-left
  { x: 0, y: -60 },  // top
  { x: 60, y: -60 }, // top-right
  { x: -60, y: 0 },  // left
  { x: 60, y: 0 },   // right
  { x: -60, y: 60 }, // bottom-left
  { x: 0, y: 60 },   // bottom
  { x: 60, y: 60 },  // bottom-right
];

const getRandom = (min: number, max: number) => Math.random() * (max - min) + min;

const ImageAnime: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/video');
    }, 2000);
    return () => clearTimeout(timer);
  }, [navigate]);

  // Calculate how many clouds fit horizontally and vertically, with overlap
  const cols = Math.ceil((100 + CLOUD_SIZE_VW) / (CLOUD_SIZE_VW - OVERLAP_VW));
  const rows = Math.ceil((100 + CLOUD_SIZE_VH) / (CLOUD_SIZE_VH - OVERLAP_VH));

  // Generate grid of clouds
  const clouds = React.useMemo(() => {
    let arr = [];
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const dir = directions[(row * cols + col) % directions.length];
        arr.push({
          left: col * (CLOUD_SIZE_VW - OVERLAP_VW),
          top: row * (CLOUD_SIZE_VH - OVERLAP_VH),
          dir,
          delay: getRandom(0, 0.7),
        });
      }
    }
    return arr;
  }, [cols, rows]);

  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      overflow: 'hidden',
      position: 'relative',
    }}>
      {/* Static background video */}
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
      {/* Clouds tiled all over the frame */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 2,
        transform: 'scale(2.5)',
        transformOrigin: 'center',
        pointerEvents: 'none',
      }}>
        {clouds.map((cloudItem, idx) => (
          <img
            key={idx}
            src={cloud}
            alt={`Cloud ${idx}`}
            style={{
              position: 'absolute',
              left: `${cloudItem.left}vw`,
              top: `${cloudItem.top}vh`,
              width: `${CLOUD_SIZE_VW}vw`,
              height: `${CLOUD_SIZE_VH}vh`,
              zIndex: 3,
              opacity: 0.97,
              animation: `cloud-tile-out-${idx % directions.length} 2.5s ${cloudItem.delay}s ease-in forwards`,
            }}
          />
        ))}
      </div>
      {/* Main collage in the center */}
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '40vw',
        height: '30vw',
        zIndex: 4,
        pointerEvents: 'none',
      }}>
        <img
          src={image3}
          alt="Main 1"
          style={{
            position: 'absolute',
            left: '0%',
            top: '20%',
            width: '35%',
            height: '60%',
            objectFit: 'contain',
            animation: 'main-move-left 2.5s 0.2s ease-in forwards',
          }}
        />
        <img
          src={image3}
          alt="Main 2"
          style={{
            position: 'absolute',
            left: '32%',
            top: '0%',
            width: '36%',
            height: '100%',
            objectFit: 'contain',
            animation: 'main-move-up 2.5s 0.2s ease-in forwards',
          }}
        />
        <img
          src={image3}
          alt="Main 3"
          style={{
            position: 'absolute',
            left: '65%',
            top: '20%',
            width: '35%',
            height: '60%',
            objectFit: 'contain',
            animation: 'main-move-right 2.5s 0.2s ease-in forwards',
          }}
        />
      </div>
      <style>
        {`
          @keyframes main-move-left {
            to { transform: translate(-60vw, 0) scale(0.7); opacity: 0; }
          }
          @keyframes main-move-right {
            to { transform: translate(60vw, 0) scale(0.7); opacity: 0; }
          }
          @keyframes main-move-up {
            to { transform: translate(0, -60vh) scale(0.7); opacity: 0; }
          }
          ${directions.map((dir, i) => `
            @keyframes cloud-tile-out-${i} {
              to { transform: translate(${dir.x}vw, ${dir.y}vh) scale(0.7); opacity: 0; }
            }
          `).join('')}
        `}
      </style>
    </div>
  );
};

export default ImageAnime;