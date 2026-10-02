import type { ReactNode } from 'react'

// Ilustraciones originales (SVG, sin copyright) — una escena por tema del catálogo.
// Se eligen por palabra clave del título; lo que no coincide cae a los patrones abstractos
// de TextCoverArt. Todas comparten viewBox 200x130 y se recortan con "slice".

const Stars = ({ pts }: { pts: [number, number, number][] }) => (
  <>
    {pts.map(([x, y, r], i) => (
      <circle key={i} cx={x} cy={y} r={r} fill="#FFF6D6" />
    ))}
  </>
)

const Tree = ({ x, y, s = 1, c = '#3F8F5A' }: { x: number; y: number; s?: number; c?: string }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <rect x="-3" y="0" width="6" height="22" fill="#7A5230" />
    <circle cx="0" cy="-6" r="17" fill={c} />
    <circle cx="-10" cy="4" r="11" fill={c} opacity="0.9" />
    <circle cx="10" cy="4" r="11" fill={c} opacity="0.9" />
  </g>
)

const Sun = ({ x, y, r = 14, c = '#FFD25E' }: { x: number; y: number; r?: number; c?: string }) => (
  <>
    <circle cx={x} cy={y} r={r + 8} fill={c} opacity="0.25" />
    <circle cx={x} cy={y} r={r} fill={c} />
  </>
)

const SCENES: { key: string; match: RegExp; art: ReactNode }[] = [
  {
    key: 'prince',
    match: /petit prince/,
    art: (
      <>
        <rect width="200" height="130" fill="#1F2A5C" />
        <Stars pts={[[20, 20, 1.6], [48, 44, 1.1], [90, 14, 1.8], [140, 30, 1.3], [180, 18, 1.6], [165, 60, 1], [30, 70, 1.2], [115, 52, 1]]} />
        <circle cx="100" cy="150" r="70" fill="#E8B84A" />
        <circle cx="100" cy="150" r="70" fill="none" stroke="#F6D77E" strokeWidth="3" />
        <g transform="translate(100 78)">
          <rect x="-5" y="-4" width="10" height="14" rx="3" fill="#3D8B6E" />
          <circle cx="0" cy="-10" r="6" fill="#F5D3A8" />
          <path d="M-6 -13 q6 -8 12 0 l-2 2 h-8 z" fill="#F2C94C" />
          <path d="M-5 -2 q-12 6 -18 14" stroke="#E0584F" strokeWidth="3" fill="none" strokeLinecap="round" />
        </g>
        <path d="M150 74 l3 -9 3 9 z" fill="#E0584F" />
      </>
    ),
  },
  {
    key: 'day',
    match: /mein tag|my day|mi día|ma journée/,
    art: (
      <>
        <defs>
          <linearGradient id="daysky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#FFD9A8" />
            <stop offset="1" stopColor="#FF9F7A" />
          </linearGradient>
        </defs>
        <rect width="200" height="130" fill="url(#daysky)" />
        <Sun x={100} y={74} r={22} c="#FFF1B8" />
        <rect y="96" width="200" height="34" fill="#4B3F72" />
        {[[20, 30], [60, 22], [140, 26], [172, 34]].map(([x, h], i) => (
          <g key={i}>
            <rect x={x} y={96 - h} width="22" height={h} fill="#5E5088" />
            <polygon points={`${x - 2},${96 - h} ${x + 11},${96 - h - 12} ${x + 24},${96 - h}`} fill="#3D335F" />
            <rect x={x + 7} y={96 - h + 8} width="8" height="9" fill="#FFD98A" />
          </g>
        ))}
        <circle cx="160" cy="42" r="12" fill="#fff" opacity="0.9" />
        <path d="M160 34 v8 l6 4" stroke="#4B3F72" strokeWidth="2.2" fill="none" strokeLinecap="round" />
      </>
    ),
  },
  {
    key: 'park',
    match: /\bpark\b|parque/,
    art: (
      <>
        <rect width="200" height="130" fill="#BFE6F5" />
        <Sun x={165} y={28} />
        <ellipse cx="60" cy="30" rx="26" ry="8" fill="#fff" opacity="0.8" />
        <rect y="92" width="200" height="40" fill="#7CC77C" />
        <Tree x={36} y={58} s={1.1} />
        <Tree x={160} y={62} s={0.9} c="#4FA866" />
        <rect x="84" y="86" width="44" height="5" rx="2" fill="#8B5E3C" />
        <rect x="88" y="91" width="4" height="12" fill="#6B4528" />
        <rect x="120" y="91" width="4" height="12" fill="#6B4528" />
        <rect x="84" y="76" width="44" height="4" rx="2" fill="#8B5E3C" />
      </>
    ),
  },
  {
    key: 'city',
    match: /ciudad|\bcity\b/,
    art: (
      <>
        <defs>
          <linearGradient id="citysky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#5B4B9A" />
            <stop offset="1" stopColor="#F4A261" />
          </linearGradient>
        </defs>
        <rect width="200" height="130" fill="url(#citysky)" />
        <Sun x={150} y={70} r={16} c="#FFE29A" />
        {[[10, 60, 26], [34, 40, 22], [58, 70, 24], [84, 48, 20], [106, 76, 26], [132, 54, 22], [156, 66, 20], [178, 44, 24]].map(([x, y, w], i) => (
          <g key={i}>
            <rect x={x} y={y} width={w} height={130 - y} fill={i % 2 ? '#2E2A55' : '#241F45'} />
            {[0, 1, 2].map((r) => (
              <rect key={r} x={x + 5} y={y + 8 + r * 14} width="4" height="5" fill="#FFD98A" opacity="0.85" />
            ))}
          </g>
        ))}
      </>
    ),
  },
  {
    key: 'family',
    match: /家庭|famil/,
    art: (
      <>
        <rect width="200" height="130" fill="#FCE7D6" />
        <rect y="96" width="200" height="34" fill="#9AD08A" />
        <rect x="62" y="52" width="76" height="52" fill="#F4C38B" />
        <polygon points="54,54 100,18 146,54" fill="#D9604C" />
        <rect x="90" y="72" width="20" height="32" rx="2" fill="#8B5E3C" />
        <rect x="70" y="62" width="14" height="14" fill="#BFE6F5" />
        <rect x="116" y="62" width="14" height="14" fill="#BFE6F5" />
        <path d="M100 44c-5-7-14-1-9 6l9 8 9-8c5-7-4-13-9-6z" fill="#fff" />
        <Tree x={28} y={64} s={0.9} />
        <Tree x={176} y={66} s={0.8} c="#58B06A" />
      </>
    ),
  },
  {
    key: 'market',
    match: /marché|market|mercado/,
    art: (
      <>
        <rect width="200" height="130" fill="#FFF1D6" />
        {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
          <path key={i} d={`M${12 + i * 22} 22 h22 v18 q-11 10 -22 0 z`} fill={i % 2 ? '#fff' : '#E5533D'} />
        ))}
        <rect x="14" y="40" width="172" height="6" fill="#B8421F" />
        <rect y="96" width="200" height="34" fill="#C99B6B" />
        <rect x="22" y="78" width="156" height="22" fill="#8B5E3C" />
        {[[44, 'oklch(62% 0.2 30)'], [70, '#7CC04F'], [96, '#F2A33A'], [122, '#B05AA8'], [148, '#E5533D']].map(([x, c], i) => (
          <g key={i}>
            <circle cx={x as number} cy="72" r="9" fill={c as string} />
            <circle cx={(x as number) + 10} cy="76" r="8" fill={c as string} opacity="0.85" />
          </g>
        ))}
      </>
    ),
  },
  {
    key: 'restaurant',
    match: /restaurant/,
    art: (
      <>
        <rect width="200" height="130" fill="#3A1E24" />
        <circle cx="100" cy="64" r="60" fill="#5A2B33" opacity="0.6" />
        <rect y="86" width="200" height="44" fill="#F3E9DA" />
        <ellipse cx="100" cy="92" rx="46" ry="12" fill="#fff" />
        <ellipse cx="100" cy="90" rx="30" ry="7" fill="#E9DFD0" />
        <circle cx="92" cy="88" r="6" fill="#E5533D" />
        <circle cx="106" cy="89" r="5" fill="#7CC04F" />
        <rect x="46" y="62" width="3" height="30" fill="#D9D9DE" />
        <rect x="150" y="62" width="3" height="30" fill="#D9D9DE" />
        <rect x="165" y="50" width="8" height="40" rx="2" fill="#FFF6D6" />
        <path d="M169 40 q-5 7 0 11 q5 -4 0 -11z" fill="#FFB347" />
      </>
    ),
  },
  {
    key: 'languages',
    match: /langues|languages|idiomas|sprachen/,
    art: (
      <>
        <rect width="200" height="130" fill="#E4E1FF" />
        <path d="M24 26 h72 a10 10 0 0 1 10 10 v26 a10 10 0 0 1 -10 10 h-40 l-14 14 v-14 h-18 a10 10 0 0 1 -10 -10 v-26 a10 10 0 0 1 10 -10z" fill="#6C63E0" />
        <path d="M104 56 h72 a10 10 0 0 1 10 10 v24 a10 10 0 0 1 -10 10 h-18 v14 l-14 -14 h-40 a10 10 0 0 1 -10 -10 v-24 a10 10 0 0 1 10 -10z" fill="#F4A261" />
        <g fill="#fff" fontFamily="sans-serif" fontWeight="700" fontSize="20">
          <text x="42" y="58">Aa</text>
          <text x="124" y="90">字</text>
        </g>
      </>
    ),
  },
  {
    key: 'mountains',
    match: /berge|mountain|montañ|montana/,
    art: (
      <>
        <rect width="200" height="130" fill="#CDE8F7" />
        <Sun x={156} y={30} r={12} />
        <polygon points="-10,130 60,32 130,130" fill="#6C7FA6" />
        <polygon points="60,32 44,58 60,52 72,60" fill="#fff" />
        <polygon points="70,130 135,48 210,130" fill="#4C5F88" />
        <polygon points="135,48 120,70 134,64 146,74" fill="#fff" />
        <rect y="108" width="200" height="22" fill="#4E9A5C" />
        <Tree x={30} y={92} s={0.55} c="#2F7A47" />
        <Tree x={170} y={94} s={0.5} c="#2F7A47" />
      </>
    ),
  },
  {
    key: 'doctor',
    match: /\barzt\b|doctor|médic|medic|clinic/,
    art: (
      <>
        <rect width="200" height="130" fill="#DFF5EE" />
        <circle cx="100" cy="65" r="44" fill="#fff" />
        <rect x="90" y="40" width="20" height="50" rx="4" fill="#E5533D" />
        <rect x="75" y="55" width="50" height="20" rx="4" fill="#E5533D" />
        <path d="M28 96 q0 -30 24 -30" stroke="#4A6B7A" strokeWidth="4" fill="none" strokeLinecap="round" />
        <circle cx="30" cy="100" r="7" fill="#4A6B7A" />
        <circle cx="168" cy="38" r="5" fill="#8EDBC2" />
        <circle cx="180" cy="56" r="3" fill="#8EDBC2" />
      </>
    ),
  },
  {
    key: 'recycling',
    match: /mülltrennung|recycl|reciclaj|müll/,
    art: (
      <>
        <rect width="200" height="130" fill="#E9F6E4" />
        <rect y="104" width="200" height="26" fill="#BFD9B0" />
        {[[34, '#3F8FDB'], [84, '#F2C94C'], [134, '#4FA866']].map(([x, c], i) => (
          <g key={i}>
            <rect x={x as number} y="52" width="40" height="54" rx="4" fill={c as string} />
            <rect x={(x as number) - 3} y="46" width="46" height="9" rx="3" fill={c as string} opacity="0.8" />
            <path d={`M${(x as number) + 20} 68 l-7 12 h14 z`} fill="#fff" opacity="0.9" />
          </g>
        ))}
      </>
    ),
  },
  {
    key: 'hotel',
    match: /hotel/,
    art: (
      <>
        <rect width="200" height="130" fill="#1E3A5F" />
        <Stars pts={[[20, 18, 1.2], [60, 30, 1], [170, 16, 1.5], [185, 48, 1]]} />
        <rect x="50" y="28" width="100" height="102" fill="#F1E3C8" />
        <rect x="42" y="22" width="116" height="9" fill="#C9694B" />
        {[0, 1, 2].map((r) =>
          [0, 1, 2, 3].map((c) => (
            <rect key={`${r}${c}`} x={60 + c * 22} y={40 + r * 24} width="12" height="14" fill={(r + c) % 3 ? '#FFD98A' : '#6F8FB3'} />
          ))
        )}
        <rect x="90" y="100" width="20" height="30" rx="2" fill="#8B5E3C" />
        <rect x="76" y="12" width="48" height="12" rx="3" fill="#E5533D" />
      </>
    ),
  },
  {
    key: 'coding',
    match: /coding|\bcode\b|program/,
    art: (
      <>
        <rect width="200" height="130" fill="#1B1F3B" />
        <rect x="36" y="26" width="128" height="76" rx="8" fill="#2D3568" />
        <rect x="42" y="32" width="116" height="64" rx="4" fill="#0F1330" />
        <g fontFamily="monospace" fontWeight="700" fontSize="22" fill="#6EE7B7">
          <text x="54" y="72">{'</>'}</text>
        </g>
        <rect x="108" y="56" width="38" height="4" rx="2" fill="#F4A261" />
        <rect x="108" y="66" width="26" height="4" rx="2" fill="#7C8CF5" />
        <rect x="108" y="76" width="32" height="4" rx="2" fill="#F472B6" />
        <path d="M20 106 h160 l-10 12 h-140 z" fill="#3A4280" />
      </>
    ),
  },
  {
    key: 'coffee',
    match: /coffee|\bcafé\b|\bcafe\b|kaffee/,
    art: (
      <>
        <rect width="200" height="130" fill="#EAD7C0" />
        <ellipse cx="100" cy="104" rx="62" ry="10" fill="#C9A87F" />
        <path d="M60 52 h80 v26 a30 30 0 0 1 -30 30 h-20 a30 30 0 0 1 -30 -30 z" fill="#fff" />
        <path d="M140 60 h10 a12 12 0 0 1 0 24 h-12" fill="none" stroke="#fff" strokeWidth="7" />
        <ellipse cx="100" cy="52" rx="40" ry="7" fill="#5B3A29" />
        <path d="M84 40 q-6 -10 0 -20 M102 40 q-6 -10 0 -22 M120 40 q-6 -10 0 -20" stroke="#fff" strokeWidth="4" fill="none" strokeLinecap="round" opacity="0.8" />
        {[[28, 90], [172, 94], [40, 108]].map(([x, y], i) => (
          <ellipse key={i} cx={x} cy={y} rx="7" ry="4.5" fill="#6B4228" transform={`rotate(${i * 40 - 20} ${x} ${y})`} />
        ))}
      </>
    ),
  },
  {
    key: 'beach',
    match: /playa|beach|strand|plage/,
    art: (
      <>
        <rect width="200" height="130" fill="#BDE8F7" />
        <Sun x={40} y={30} r={14} />
        <rect y="58" width="200" height="40" fill="#2BA3D6" />
        <path d="M0 70 q12 -6 25 0 t25 0 t25 0 t25 0 t25 0 t25 0 t25 0 t25 0 v6 h-200z" fill="#7FD0EE" opacity="0.7" />
        <path d="M0 98 q50 -14 100 -4 t100 -2 v38 h-200z" fill="#F2D49B" />
        <line x1="140" y1="54" x2="146" y2="104" stroke="#8B5E3C" strokeWidth="3" />
        <path d="M118 62 q26 -26 52 0 z" fill="#E5533D" />
        <path d="M134 60 q6 -18 12 0 z" fill="#fff" opacity="0.7" />
      </>
    ),
  },
  {
    key: 'tapas',
    match: /tapeo|tapas/,
    art: (
      <>
        <rect width="200" height="130" fill="#7A3B2E" />
        <rect y="70" width="200" height="60" fill="#A25A3F" opacity="0.5" />
        {[[52, 42, 26], [118, 36, 24], [88, 88, 28], [160, 86, 22]].map(([x, y, r], i) => (
          <g key={i}>
            <circle cx={x} cy={y} r={r} fill="#fff" />
            <circle cx={x} cy={y} r={r - 5} fill="#F3E9DA" />
            <circle cx={x - 5} cy={y - 3} r="5" fill={['#6B8E23', '#E5533D', '#F2C94C', '#6B8E23'][i]} />
            <circle cx={x + 6} cy={y + 4} r="4.5" fill={['#E5533D', '#6B8E23', '#E5533D', '#F2A33A'][i]} />
          </g>
        ))}
      </>
    ),
  },
  {
    key: 'remote',
    match: /teletrabajo|remote|homeoffice/,
    art: (
      <>
        <rect width="200" height="130" fill="#FDE9D9" />
        <rect x="120" y="14" width="56" height="52" fill="#BFE6F5" />
        <line x1="148" y1="14" x2="148" y2="66" stroke="#fff" strokeWidth="3" />
        <line x1="120" y1="40" x2="176" y2="40" stroke="#fff" strokeWidth="3" />
        <rect y="98" width="200" height="32" fill="#C98F5E" />
        <rect x="42" y="64" width="76" height="6" rx="2" fill="#4A5578" />
        <rect x="52" y="30" width="56" height="36" rx="4" fill="#4A5578" />
        <rect x="56" y="34" width="48" height="28" rx="2" fill="#9FD7F5" />
        <rect x="68" y="68" width="24" height="30" fill="#8B5E3C" />
        <circle cx="26" cy="80" r="12" fill="#58B06A" />
        <rect x="22" y="88" width="8" height="12" fill="#B8421F" />
      </>
    ),
  },
  {
    key: 'shop',
    match: /商店|\bshop\b|store|tienda|magasin/,
    art: (
      <>
        <rect width="200" height="130" fill="#FFE8EE" />
        <rect x="30" y="40" width="140" height="90" fill="#F6C6D2" />
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <path key={i} d={`M${30 + i * 23.4} 22 h23.4 v20 q-11.7 10 -23.4 0 z`} fill={i % 2 ? '#fff' : '#E5486A'} />
        ))}
        <rect x="42" y="62" width="50" height="40" fill="#BFE6F5" />
        <rect x="110" y="62" width="48" height="68" rx="2" fill="#8B5E3C" />
        <circle cx="150" cy="96" r="2.5" fill="#FFD25E" />
        <rect x="48" y="88" width="14" height="14" fill="#F2C94C" />
        <rect x="68" y="80" width="14" height="22" fill="#7C8CF5" />
      </>
    ),
  },
  {
    key: 'bicycle',
    match: /自行车|bicycle|\bbike\b|bicicleta|vélo|fahrrad/,
    art: (
      <>
        <rect width="200" height="130" fill="#D8F0FF" />
        <Sun x={162} y={26} r={12} />
        <rect y="100" width="200" height="30" fill="#8FD18A" />
        <g fill="none" stroke="#2E3A59" strokeWidth="4" strokeLinecap="round">
          <circle cx="62" cy="86" r="22" />
          <circle cx="140" cy="86" r="22" />
          <path d="M62 86 L92 52 L124 52 L140 86 M92 52 L106 86 L62 86 M106 86 L124 52" stroke="#E5533D" />
          <path d="M120 44 h14 M88 46 h14" />
        </g>
        <circle cx="106" cy="86" r="4" fill="#2E3A59" />
      </>
    ),
  },
  {
    key: 'phone',
    match: /手机|phone|móvil|movil|handy|téléphone/,
    art: (
      <>
        <rect width="200" height="130" fill="#EDE4FF" />
        <rect x="70" y="10" width="60" height="112" rx="12" fill="#2B2F55" />
        <rect x="76" y="20" width="48" height="92" rx="6" fill="#fff" />
        {[0, 1, 2].map((r) =>
          [0, 1, 2].map((c) => (
            <rect key={`${r}${c}`} x={81 + c * 15} y={28 + r * 17} width="11" height="11" rx="3" fill={['#E5533D', '#F2A33A', '#4FA866', '#3F8FDB', '#9B59B6', '#F472B6', '#2BA3D6', '#F2C94C', '#7C8CF5'][r * 3 + c]} />
          ))
        )}
        <rect x="86" y="88" width="28" height="14" rx="7" fill="#7C8CF5" />
        <circle cx="34" cy="32" r="6" fill="#B9A4F5" />
        <circle cx="168" cy="92" r="9" fill="#B9A4F5" />
      </>
    ),
  },
]

export function coverSceneFor(title: string): ReactNode | null {
  const lower = title.toLowerCase()
  const found = SCENES.find((s) => s.match.test(lower))
  return found ? found.art : null
}

export function CoverScene({ art }: { art: ReactNode }) {
  return (
    <svg viewBox="0 0 200 130" width="100%" height="100%" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      {art}
    </svg>
  )
}
