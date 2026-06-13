import { useMemo } from 'react';
import { motion } from 'framer-motion';
import './Atmosphere.css';

/* ── helpers ── */
const seededRandom = (seed) => {
  const x = Math.sin(seed * 9301 + 49297) * 49297;
  return x - Math.floor(x);
};

const lerp = (min, max, t) => min + (max - min) * t;

/* ── component ── */
export default function Atmosphere() {
  /* ---- Fireflies (10 dots, bottom 30%) ---- */
  const fireflies = useMemo(
    () =>
      Array.from({ length: 10 }, (_, i) => {
        const r = (s) => seededRandom(i * 17 + s);
        const floatAnim = `firefly-float-${(i % 4) + 1}`;
        const size = lerp(2, 4, r(1));
        const colors = ['#aaffaa', '#bbffbb', '#ffee88', '#ddff99'];
        return {
          id: `ff-${i}`,
          style: {
            width: size,
            height: size,
            left: `${lerp(8, 88, r(2))}%`,
            top: `${lerp(72, 95, r(3))}%`,
            color: colors[i % colors.length],
            backgroundColor: colors[i % colors.length],
            animation: `${floatAnim} ${lerp(8, 20, r(4)).toFixed(1)}s ease-in-out ${lerp(0, 10, r(5)).toFixed(1)}s infinite, firefly-glow ${lerp(3, 7, r(6)).toFixed(1)}s ease-in-out ${lerp(0, 5, r(7)).toFixed(1)}s infinite`,
          },
        };
      }),
    [],
  );

  /* ---- Cloud Wisps (3 patches, upper half) ---- */
  const wisps = useMemo(
    () => [
      {
        id: 'cw-1',
        style: {
          width: '55vw',
          height: '8vw',
          top: '10%',
          left: '-10%',
          opacity: 0.03,
          animation: 'drift-1 90s linear infinite',
        },
      },
      {
        id: 'cw-2',
        style: {
          width: '65vw',
          height: '6vw',
          top: '22%',
          left: '0%',
          opacity: 0.025,
          animation: 'drift-2 110s linear infinite',
        },
      },
      {
        id: 'cw-3',
        style: {
          width: '48vw',
          height: '7vw',
          top: '35%',
          left: '-5%',
          opacity: 0.04,
          animation: 'drift-3 75s linear infinite',
        },
      },
    ],
    [],
  );

  /* ---- Twinkling Stars (18 dots, upper 60%) ---- */
  const twinklingStars = useMemo(
    () =>
      Array.from({ length: 18 }, (_, i) => {
        const r = (s) => seededRandom(i * 31 + s + 100);
        const size = lerp(1, 2, r(1));
        const animName = i % 3 === 0 ? 'twinkle-alt' : 'twinkle';
        return {
          id: `ts-${i}`,
          style: {
            width: size,
            height: size,
            left: `${lerp(3, 97, r(2))}%`,
            top: `${lerp(3, 58, r(3))}%`,
            animation: `${animName} ${lerp(2, 6, r(4)).toFixed(1)}s ease-in-out ${lerp(0, 4, r(5)).toFixed(1)}s infinite`,
            opacity: lerp(0.3, 0.7, r(6)),
          },
        };
      }),
    [],
  );

  return (
    <motion.div
      className="atmosphere-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 3, delay: 2, ease: 'easeOut' }}
    >
      {/* ── Shooting Stars ── */}
      <div className="shooting-star shooting-star--1" />
      <div className="shooting-star shooting-star--2" />
      <div className="shooting-star shooting-star--3" />

      {/* ── Fireflies ── */}
      {fireflies.map((f) => (
        <div key={f.id} className="firefly" style={f.style} />
      ))}

      {/* ── Cloud Wisps ── */}
      {wisps.map((w) => (
        <div key={w.id} className="cloud-wisp" style={w.style} />
      ))}

      {/* ── Twinkling Stars ── */}
      {twinklingStars.map((s) => (
        <div key={s.id} className="twinkle-star" style={s.style} />
      ))}
    </motion.div>
  );
}
