/**
 * @module icons — Inline SVG data URIs for known technology stacks.
 * Maps stack labels (matching STACK_COLORS keys) to base64-encoded SVG data URIs
 * for use as service card icons.
 */

/** Stack label → SVG data URI */
export const STACK_ICONS = {
  'Next.js': 'data:image/svg+xml;base64,' + btoa('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128"><circle cx="64" cy="64" r="64" fill="#000"/><path d="M106.3 112.8L49.5 38H38v52h9.2V50.5l51.3 67.6a64.2 64.2 0 007.8-5.3z" fill="#fff"/><rect x="80" y="38" width="9.5" height="52" fill="url(#a)"/><defs><linearGradient id="a" x1="84.7" y1="38" x2="84.7" y2="82" gradientUnits="userSpaceOnUse"><stop stop-color="#fff"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient></defs></svg>'),

  'Nuxt': 'data:image/svg+xml;base64,' + btoa('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128"><path d="M36.5 98.3H7.6a7.1 7.1 0 01-6.2-10.7L30 40.3a7.1 7.1 0 0112.3 0l8.8 15.3 17-29.4a7.1 7.1 0 0112.3 0l40 69.4a7.1 7.1 0 01-6.2 10.7H78.5" fill="none" stroke="#00DC82" stroke-width="8"/></svg>'),

  'React': 'data:image/svg+xml;base64,' + btoa('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128"><g fill="#61DAFB"><circle cx="64" cy="64" r="11.4"/><ellipse cx="64" cy="64" rx="62" ry="24" fill="none" stroke="#61DAFB" stroke-width="5"/><ellipse cx="64" cy="64" rx="62" ry="24" fill="none" stroke="#61DAFB" stroke-width="5" transform="rotate(60 64 64)"/><ellipse cx="64" cy="64" rx="62" ry="24" fill="none" stroke="#61DAFB" stroke-width="5" transform="rotate(120 64 64)"/></g></svg>'),

  'Vue': 'data:image/svg+xml;base64,' + btoa('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128"><path d="M78.8 10L64 35.4 49.2 10H0l64 110L128 10z" fill="#42B883"/><path d="M78.8 10L64 35.4 49.2 10H25.6L64 76.2 102.4 10z" fill="#35495E"/></svg>'),

  'Svelte': 'data:image/svg+xml;base64,' + btoa('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128"><path d="M110.5 16.2C98.7-.3 75.2-5 58.6 6L24.4 28.8a37.5 37.5 0 00-17 25.2 39.3 39.3 0 003.7 23.6 37.5 37.5 0 00-5.6 14 39.6 39.6 0 006.8 33.5C24 143 47.5 148 64.1 137l34.2-22.8a37.5 37.5 0 0017-25.2 39.3 39.3 0 00-3.7-23.6 37.5 37.5 0 005.6-14 39.6 39.6 0 00-6.7-35.2z" fill="#FF3E00" transform="scale(.85) translate(10 5)"/></svg>'),

  'Express': 'data:image/svg+xml;base64,' + btoa('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128"><path d="M64 8C33.1 8 8 33.1 8 64s25.1 56 56 56 56-25.1 56-56S94.9 8 64 8zm28.8 41.8H72.3L64 60.6l-8.3-10.8H35.2l20.5 26.6L34 102h20.5l9.5-12.4 9.5 12.4H94L72.3 75.4z" fill="#eee"/></svg>'),

  'Fastify': 'data:image/svg+xml;base64,' + btoa('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128"><path d="M104 30L84 14l-8 10 14 12-14 6-28-20-28 30v32l28 24 28-20 14 6-14 12 8 10 20-16V30z" fill="#eee"/></svg>'),

  'Hono': 'data:image/svg+xml;base64,' + btoa('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128"><path d="M48 8c-4 20-8 32 0 52s28 36 28 60c0-16 16-32 20-48S84 36 76 20 56 4 48 8z" fill="#FF5B11"/><path d="M56 48c-4 12-4 24 4 36s16 20 16 36c0-12 8-20 12-32s0-28-8-36-20-12-24-4z" fill="#FFCB64"/></svg>'),

  'Koa': 'data:image/svg+xml;base64,' + btoa('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128"><text x="50%" y="50%" text-anchor="middle" dominant-baseline="central" font-family="Arial,sans-serif" font-weight="bold" font-size="64" fill="#eee">K</text></svg>'),

  'TypeScript': 'data:image/svg+xml;base64,' + btoa('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128"><rect width="128" height="128" rx="10" fill="#3178C6"/><path d="M72 68v-8h36v8H92v36h-10V68H72zm-6.5-8H50.3C46 60 42 63 42 67.5c0 5 3 7.5 9.5 10l4 1.5C61.5 81.5 64 83 64 87.5c0 4-3.5 7-8.5 7-5.5 0-9-2.5-11.5-6.5l-8 4.5C39 98 44.5 102 55.5 102 63 102 72 98 72 87.5 72 82 69 78 61.5 75l-4-1.5C52 71 50.5 69.5 50.5 67c0-3 2.5-5 5.5-5h9.5V60z" fill="#fff"/></svg>'),

  'Tailwind': 'data:image/svg+xml;base64,' + btoa('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128"><path d="M64 29.7q-19.2 0-24 19.2Q46.4 29.7 56 34.5q5.5 2.8 7.3 8.5 2.6 8.3 11.5 14.3h.1Q64 76.5 44.8 76.5l24-19.2Q59.2 76.5 49.6 71.7q-5.5-2.8-7.3-8.5-2.7-8.3-11.5-14.3h-.1Q41.5 29.7 64 29.7zM64 57.3q19.2 0 24 19.2-6.4-19.2-16-14.4-5.5 2.8-7.3 8.5-2.6 8.3-11.5 14.3h-.1q10.8-19.2 30-19.2l-24 19.2q9.6 4.8 19.2 0 5.5-2.8 7.3-8.5 2.7-8.3 11.5-14.3h.1q-10.8 19.2-33.2 19.2z" fill="#38BDF8"/></svg>'),

  'Vite': 'data:image/svg+xml;base64,' + btoa('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128"><path d="M124.8 19.6l-56 99.4a3.5 3.5 0 01-6.2-.1L3 19.5a3.5 3.5 0 013.8-5L64.5 25a3.5 3.5 0 003 0l55.6-10.4a3.5 3.5 0 013.7 5z" fill="url(#a)"/><path d="M91.5 1.7L51 9.2a1.8 1.8 0 00-1.4 1.8L46.8 69a1.8 1.8 0 002.1 1.9l12.1-2.4a1.8 1.8 0 012.1 2.2l-3.5 17.4a1.8 1.8 0 002.3 2.1l7.5-2.3a1.8 1.8 0 012.3 2.1l-5.5 27a1 1 0 001.9.7L93 35.3a1.8 1.8 0 00-2-2.3l-12.5 2.4a1.8 1.8 0 01-2.1-2.1l5.5-29.6a1.8 1.8 0 00-2-2.1z" fill="#FFDD35"/><defs><linearGradient id="a" x1="4" y1="11" x2="69" y2="112" gradientUnits="userSpaceOnUse"><stop stop-color="#41D1FF"/><stop offset="1" stop-color="#BD34FE"/></linearGradient></defs></svg>'),

  'Django': 'data:image/svg+xml;base64,' + btoa('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128"><rect width="128" height="128" rx="10" fill="#44B78B"/><path d="M58 26h14v58.5c-7 1.3-12.2 1.8-17.8 1.8C39 86.3 32 79 32 63.5 32 48.7 39.7 40 54.5 40c1.3 0 2.3.1 3.5.3V26zm0 22.5c-1-.3-1.8-.4-2.8-.4-5.7 0-9 3.6-9 10.2 0 6.5 3.1 10 9 10 .9 0 1.7 0 2.8-.2V48.5zM78 30.7c4.7 0 8.5-3.8 8.5-8.4 0-4.7-3.8-8.5-8.5-8.5-4.7 0-8.5 3.8-8.5 8.5 0 4.6 3.8 8.4 8.5 8.4zM71 86V36h14v42c0 12.5-1 18.5-3.8 23.7-2.7 5-6.5 8.2-14.2 11.6l-13-6.2c7.7-3.2 11-6 13.5-10.7 2.6-4.8 3.5-10.5 3.5-24.7V86z" fill="#fff"/></svg>'),

  'FastAPI': 'data:image/svg+xml;base64,' + btoa('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128"><circle cx="64" cy="64" r="60" fill="#009688"/><path d="M64 20l-4 44h18L60 108l4-44H46z" fill="#fff"/></svg>'),

  'Rust': 'data:image/svg+xml;base64,' + btoa('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128"><path d="M62.1 10.7l-4.3 7.5a2 2 0 01-2.3.9l-8.2-2.7a54.3 54.3 0 00-9 5.2l1.3 8.6a2 2 0 01-1.3 2.1l-7.8 3.7a54 54 0 00-4.3 9.4l5.5 6.8a2 2 0 010 2.5l-5.5 6.8a54 54 0 004.3 9.4l7.8 3.7a2 2 0 011.3 2.1l-1.3 8.6a54 54 0 009 5.2l8.2-2.7a2 2 0 012.3.9l4.3 7.5a55 55 0 0010.4 0l4.3-7.5a2 2 0 012.3-.9l8.2 2.7a54 54 0 009-5.2l-1.3-8.6a2 2 0 011.3-2.1l7.8-3.7a54 54 0 004.3-9.4l-5.5-6.8a2 2 0 010-2.5l5.5-6.8a54 54 0 00-4.3-9.4l-7.8-3.7a2 2 0 01-1.3-2.1l1.3-8.6a54 54 0 00-9-5.2l-8.2 2.7a2 2 0 01-2.3-.9l-4.3-7.5a55 55 0 00-10.4 0z" fill="#DEA584"/><circle cx="64" cy="64" r="28" fill="none" stroke="#DEA584" stroke-width="6"/></svg>'),

  'Go': 'data:image/svg+xml;base64,' + btoa('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128"><path d="M17.2 68.4s-.8-1 .5-1.3l22.7-3c1 0 1.6-.6.5-1.3 0 0-2-1.5-4-2.2-2-.7-2.5 0-3.5.5L11.3 72c-1.3.8-.3 1.5.3 1.8l25 10c1.5.5 2.3-.3 2-1.3l-2-5.5c-.5-1.5-2-2.8-3.5-3l-15.9-5.6z" fill="#00ADD8"/><path d="M101.8 59.3s.8-1-.5-1.3L78.6 55c-1 0-1.6-.6-.5-1.3 0 0 2-1.5 4-2.2 2-.7 2.5 0 3.5.5l22.1 10.7c1.3.8.3 1.5-.3 1.8l-25 10c-1.5.5-2.3-.3-2-1.3l2-5.5c.5-1.5 2-2.8 3.5-3l15.9-5.4z" fill="#00ADD8"/><path d="M64 24C40 24 24 44 24 64s16 40 40 40 40-20 40-40S88 24 64 24zm-1 60c-12 0-21-8-21-20s9-20 21-20h2c12 0 21 8 21 20s-9 20-21 20h-2z" fill="#00ADD8"/></svg>'),

  'Python': 'data:image/svg+xml;base64,' + btoa('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128"><path d="M63.4 10c-14 0-23.2 6-23.2 17v11.4h23.5v4H28.3C17.5 42.4 8 50 8 66.5s8.3 23.2 19.5 23.2h11.3V78c0-12.3 10.7-23 23.5-23h23.2c10.3 0 18.5-8.5 18.5-18.5v-8C104 18.2 95.3 10 85 10H63.4zm-13 10a6 6 0 110 12 6 6 0 010-12z" fill="#3776AB"/><path d="M64.6 118c14 0 23.2-6 23.2-17V89.6H64.3v-4h35.4c10.8 0 20.3-7.6 20.3-24.1S110.7 38.3 99.5 38.3H88.2V50c0 12.3-10.7 23-23.5 23H41.5C31.2 73 23 81.5 23 91.5v8C23 109.8 31.7 118 42 118h22.6zm13-10a6 6 0 110-12 6 6 0 010 12z" fill="#FFD343"/></svg>'),

  'Ruby': 'data:image/svg+xml;base64,' + btoa('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128"><path d="M26 102l76-76-6-6-76 76 6 6zm2-10L96 24l38 38-38 38L28 92z" fill="#CC342D"/><path d="M96 24L28 92l68 0 0-68z" fill="#CC342D" opacity=".7"/></svg>'),

  'Docker': 'data:image/svg+xml;base64,' + btoa('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128"><path d="M72 44h12v11H128c-1.5-8-5-15-10-20l5-9-8-5c-5 3-10 3-15 3-2 0-5 0-7-1-7-3-12-8-14-15H58c-4 0-9-1-13-3-5-2-5-5-10-5s-10 4-14 8c-6 5-10 14-10 26 0 20 10 40 32 50 7 3 14 5 22 5 22 0 40-10 50-28H72V44z" fill="#2496ED"/><g fill="#2496ED"><rect x="40" y="44" width="10" height="10" rx="1"/><rect x="52" y="44" width="10" height="10" rx="1"/><rect x="64" y="44" width="10" height="10" rx="1"/><rect x="52" y="32" width="10" height="10" rx="1"/><rect x="64" y="32" width="10" height="10" rx="1"/><rect x="76" y="32" width="10" height="10" rx="1"/><rect x="76" y="44" width="10" height="10" rx="1"/><rect x="64" y="20" width="10" height="10" rx="1"/></g></svg>'),
};
