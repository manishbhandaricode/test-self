import React from 'react';
import { motion } from 'framer-motion';
import './Scenery.css';

/* ═══════════════════════════════════════════════════════════
   Scenery — Cinematic Night-Time Landscape
   3-layer mountains · treeline · moonlit river with reflection
   Pure SVG + CSS — zero images
   ═══════════════════════════════════════════════════════════ */

const Scenery = () => {
  return (
    <motion.div
      className="scenery-container"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 3, delay: 1 }}
    >
      {/* ─── Sky Wash ─── */}
      <div className="scenery-sky-wash" />

      {/* ═══════════════════════════════
          MOUNTAINS — 3 dark silhouette layers
          ═══════════════════════════════ */}
      <div className="mountains-wrap">
        {/* Back mountain — tallest, faintest moonlit edge */}
        <svg
          viewBox="0 0 1440 400"
          preserveAspectRatio="none"
          className="mountain-layer mountain-back"
        >
          <defs>
            <linearGradient id="mtn-back-grad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#0d1220" />
              <stop offset="30%" stopColor="#080c18" />
              <stop offset="100%" stopColor="#050810" />
            </linearGradient>
            {/* Moonlit edge highlight — very subtle */}
            <linearGradient id="mtn-back-edge" x1="0.3" y1="0" x2="0.7" y2="0">
              <stop offset="0%" stopColor="transparent" />
              <stop offset="40%" stopColor="rgba(120,160,220,0.06)" />
              <stop offset="60%" stopColor="rgba(120,160,220,0.06)" />
              <stop offset="100%" stopColor="transparent" />
            </linearGradient>
          </defs>
          <path
            fill="url(#mtn-back-grad)"
            d="M0,280 L40,260 C80,240,120,200,200,180 C280,160,360,190,440,170
               C520,150,580,110,660,100 C740,90,800,120,880,135
               C960,150,1040,130,1120,145 C1200,160,1280,200,1360,210
               L1440,220 L1440,400 L0,400 Z"
          />
          {/* Faint moonlit edge line */}
          <path
            fill="none"
            stroke="url(#mtn-back-edge)"
            strokeWidth="1.5"
            d="M0,280 L40,260 C80,240,120,200,200,180 C280,160,360,190,440,170
               C520,150,580,110,660,100 C740,90,800,120,880,135
               C960,150,1040,130,1120,145 C1200,160,1280,200,1360,210
               L1440,220"
          />
        </svg>

        {/* Mid mountain */}
        <svg
          viewBox="0 0 1440 400"
          preserveAspectRatio="none"
          className="mountain-layer mountain-mid"
        >
          <defs>
            <linearGradient id="mtn-mid-grad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#0a1020" />
              <stop offset="40%" stopColor="#070b15" />
              <stop offset="100%" stopColor="#050810" />
            </linearGradient>
            <linearGradient id="mtn-mid-edge" x1="0.2" y1="0" x2="0.8" y2="0">
              <stop offset="0%" stopColor="transparent" />
              <stop offset="35%" stopColor="rgba(100,150,210,0.05)" />
              <stop offset="65%" stopColor="rgba(100,150,210,0.05)" />
              <stop offset="100%" stopColor="transparent" />
            </linearGradient>
          </defs>
          <path
            fill="url(#mtn-mid-grad)"
            d="M0,260 L60,240 C120,220,180,250,280,230
               C380,210,440,180,540,195 C640,210,700,170,780,160
               C860,150,940,180,1020,200 C1100,220,1180,195,1260,210
               C1340,225,1380,240,1440,245 L1440,400 L0,400 Z"
          />
          <path
            fill="none"
            stroke="url(#mtn-mid-edge)"
            strokeWidth="1.2"
            d="M0,260 L60,240 C120,220,180,250,280,230
               C380,210,440,180,540,195 C640,210,700,170,780,160
               C860,150,940,180,1020,200 C1100,220,1180,195,1260,210
               C1340,225,1380,240,1440,245"
          />
        </svg>

        {/* Front mountain — darkest, nearest */}
        <svg
          viewBox="0 0 1440 400"
          preserveAspectRatio="none"
          className="mountain-layer mountain-front"
        >
          <defs>
            <linearGradient id="mtn-front-grad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#080c18" />
              <stop offset="100%" stopColor="#030508" />
            </linearGradient>
          </defs>
          <path
            fill="url(#mtn-front-grad)"
            d="M0,300 L80,280 C160,260,240,290,360,275
               C480,260,560,230,660,240 C760,250,840,220,920,215
               C1000,210,1080,250,1160,260 C1240,270,1320,285,1380,290
               L1440,295 L1440,400 L0,400 Z"
          />
        </svg>
      </div>

      {/* ═══════════════════════════════
          TREELINE — grass / small tree silhouettes
          Sits on the horizon between mountains and water
          ═══════════════════════════════ */}
      <div className="treeline-wrap">
        <svg
          viewBox="0 0 1200 60"
          preserveAspectRatio="none"
          className="treeline-svg"
        >
          <defs>
            <linearGradient id="tree-grad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#060a14" />
              <stop offset="100%" stopColor="#030508" />
            </linearGradient>
          </defs>
          {/* Dense treeline / shrub pattern */}
          <path
            fill="url(#tree-grad)"
            d="M0,40
               L10,38 L15,30 L20,36 L28,25 L33,34 L38,28 L42,35
               L50,22 L55,32 L60,26 L68,35 L75,20 L80,30 L88,24 L92,33
               L100,18 L106,28 L112,22 L118,32 L125,15 L130,26 L138,20 L144,30
               L152,16 L158,28 L165,19 L170,30 L178,14 L184,25 L190,18 L196,28
               L205,12 L212,24 L218,17 L224,27 L232,13 L238,24 L245,16 L250,26
               L260,20 L268,10 L275,22 L280,15 L288,26 L295,12 L300,24 L308,18
               L316,26 L324,14 L330,25 L338,17 L345,28 L352,13 L358,24 L365,19
               L372,30 L380,16 L386,27 L394,20 L400,32 L408,18 L414,28 L420,22
               L428,34 L436,20 L442,30 L448,24 L456,35 L464,22 L470,32 L476,26
               L484,36 L492,24 L498,33 L504,27 L512,36 L518,24 L524,34 L530,28
               L540,15 L548,26 L554,18 L560,28 L568,14 L574,25 L580,17 L588,27
               L596,22 L604,12 L610,24 L618,16 L624,26 L632,13 L638,22 L644,18
               L652,28 L660,15 L666,26 L674,20 L680,30 L688,16 L694,27 L700,21
               L708,32 L716,18 L722,28 L728,22 L736,33 L744,19 L750,30 L758,24
               L766,35 L774,20 L780,31 L788,25 L794,36 L800,22 L808,32 L814,26
               L822,14 L828,25 L836,18 L842,28 L850,13 L856,24 L864,17 L870,27
               L878,22 L886,11 L892,23 L900,16 L908,26 L914,12 L920,23 L928,17
               L936,28 L944,14 L950,25 L958,19 L964,30 L972,15 L978,26 L986,20
               L994,32 L1002,17 L1008,28 L1016,22 L1024,34 L1030,20 L1038,30
               L1044,24 L1052,36 L1060,22 L1066,33 L1074,26 L1080,37 L1088,24
               L1094,34 L1100,28 L1108,16 L1114,27 L1122,20 L1128,30 L1136,15
               L1142,26 L1150,18 L1156,28 L1164,22 L1170,32 L1178,25 L1184,35
               L1192,28 L1200,38
               L1200,60 L0,60 Z"
          />
        </svg>
      </div>

      {/* ═══════════════════════════════
          RIVER / WATER — bottom 25vh
          Dark water with moonlight reflection column
          ═══════════════════════════════ */}
      <div className="river-wrap">
        {/* Shore glow */}
        <div className="shore-glow" />

        {/* Dark water base */}
        <svg className="river-base-svg">
          <defs>
            <linearGradient id="water-base-grad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#040810" />
              <stop offset="100%" stopColor="#020408" />
            </linearGradient>
          </defs>
          <rect width="100%" height="100%" fill="url(#water-base-grad)" />
        </svg>

        {/* ── Moon Reflection Column ──
            Vertical glow column centered, shimmering downward
            Uses SVG feTurbulence for gentle rippling */}
        <div className="moon-reflection-column">
          <svg viewBox="0 0 100 400" preserveAspectRatio="none">
            <defs>
              {/* Ripple distortion filter */}
              <filter id="reflect-ripple" x="-20%" y="0" width="140%" height="100%">
                <feTurbulence
                  type="fractalNoise"
                  baseFrequency="0.02 0.08"
                  numOctaves="3"
                  seed="2"
                  result="noise"
                >
                  <animate
                    attributeName="baseFrequency"
                    values="0.02 0.08;0.015 0.06;0.025 0.09;0.02 0.08"
                    dur="12s"
                    repeatCount="indefinite"
                  />
                </feTurbulence>
                <feDisplacementMap
                  in="SourceGraphic"
                  in2="noise"
                  scale="14"
                  xChannelSelector="R"
                  yChannelSelector="G"
                />
              </filter>

              {/* Reflection gradient — bright at top, fading down */}
              <linearGradient id="reflect-grad" x1="0.5" y1="0" x2="0.5" y2="1">
                <stop offset="0%" stopColor="rgba(180,210,255,0.55)" />
                <stop offset="15%" stopColor="rgba(140,190,255,0.35)" />
                <stop offset="40%" stopColor="rgba(100,160,240,0.18)" />
                <stop offset="70%" stopColor="rgba(60,120,200,0.08)" />
                <stop offset="100%" stopColor="rgba(20,60,120,0.0)" />
              </linearGradient>

              {/* Horizontal fade mask so edges are soft */}
              <linearGradient id="reflect-hmask" x1="0" y1="0.5" x2="1" y2="0.5">
                <stop offset="0%" stopColor="white" stopOpacity="0" />
                <stop offset="25%" stopColor="white" stopOpacity="1" />
                <stop offset="75%" stopColor="white" stopOpacity="1" />
                <stop offset="100%" stopColor="white" stopOpacity="0" />
              </linearGradient>
              <mask id="reflect-soft-mask">
                <rect width="100" height="400" fill="url(#reflect-hmask)" />
              </mask>
            </defs>

            {/* The glowing reflection column — rippled */}
            <rect
              x="0" y="0"
              width="100" height="400"
              fill="url(#reflect-grad)"
              filter="url(#reflect-ripple)"
              mask="url(#reflect-soft-mask)"
            />
          </svg>
        </div>

        {/* ── Full-width water ripple overlay ── */}
        <div className="water-ripple-overlay">
          <svg>
            <defs>
              <filter id="water-surface-ripple" x="0" y="0" width="100%" height="100%">
                <feTurbulence
                  type="fractalNoise"
                  baseFrequency="0.012 0.04"
                  numOctaves="2"
                  seed="5"
                  result="surf-noise"
                >
                  <animate
                    attributeName="baseFrequency"
                    values="0.012 0.04;0.008 0.035;0.014 0.045;0.012 0.04"
                    dur="15s"
                    repeatCount="indefinite"
                  />
                </feTurbulence>
                <feDisplacementMap
                  in="SourceGraphic"
                  in2="surf-noise"
                  scale="8"
                  xChannelSelector="R"
                  yChannelSelector="G"
                />
              </filter>

              <linearGradient id="surface-sheen" x1="0.5" y1="0" x2="0.5" y2="1">
                <stop offset="0%" stopColor="rgba(100,150,220,0.04)" />
                <stop offset="50%" stopColor="rgba(80,130,200,0.02)" />
                <stop offset="100%" stopColor="rgba(40,80,140,0.01)" />
              </linearGradient>
            </defs>

            <rect
              width="100%"
              height="100%"
              fill="url(#surface-sheen)"
              filter="url(#water-surface-ripple)"
            />
          </svg>
        </div>

        {/* ── Shimmer lines — faint horizontal streaks of reflected light ── */}
        <div className="shimmer-lines">
          <div className="shimmer-line" />
          <div className="shimmer-line" />
          <div className="shimmer-line" />
          <div className="shimmer-line" />
          <div className="shimmer-line" />
          <div className="shimmer-line" />
        </div>
      </div>
    </motion.div>
  );
};

export default Scenery;
