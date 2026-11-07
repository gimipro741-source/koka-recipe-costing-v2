import React from 'react';

export default function ChefAvatar() {
  return <div className="chef-stage">
    <div className="chef-halo" aria-hidden="true"/>
    <svg className="chef-figure chef-portrait" viewBox="0 0 430 510" role="img" aria-label="شيف قوقه يحمل طبق حلوى">
      <defs>
        <linearGradient id="uniform" x2=".85" y2="1"><stop stopColor="#fffbef"/><stop offset="1" stopColor="#c8a8a4"/></linearGradient>
        <linearGradient id="skin" x2=".9" y2="1"><stop stopColor="#ffd2a7"/><stop offset="1" stopColor="#bd755d"/></linearGradient>
        <linearGradient id="plum" x2="1" y2="1"><stop stopColor="#914763"/><stop offset="1" stopColor="#36192d"/></linearGradient>
        <linearGradient id="brass" x2="1" y2="1"><stop stopColor="#ffe5a9"/><stop offset=".55" stopColor="#ce995b"/><stop offset="1" stopColor="#8e5040"/></linearGradient>
        <radialGradient id="blush"><stop stopColor="#c35b62" stopOpacity=".48"/><stop offset="1" stopColor="#c35b62" stopOpacity="0"/></radialGradient>
      </defs>
      <ellipse cx="218" cy="483" rx="151" ry="17" fill="#21121b" opacity=".45"/>
      <g strokeLinejoin="round">
        <path d="M75 465l10-90c8-45 44-70 104-82h57c61 11 100 38 109 82l10 90c-62 36-233 37-290 0Z" fill="url(#uniform)" stroke="#e9d0be" strokeWidth="3"/>
        <path d="m175 303 42 50 43-50 28 16-30 54h-80l-30-55Z" fill="#68324a"/>
        <path d="m150 330 19 48h97l18-48 18 10-15 54 17 87c-61 12-124 12-174 0l16-87-15-54Z" fill="url(#plum)"/>
        <path d="M161 399h112m-114 10h116" stroke="#c28b64" strokeWidth="1.5" opacity=".7"/>
        <path d="m176 270-2 32q40 45 83 0l-4-32Z" fill="url(#skin)"/>
        <path d="M125 181q-21-65 39-96h106q51 29 35 99l-12 61-157 2Z" fill="#382229"/>
        <path d="M136 184c-30-23-38 38-2 43m159-43c30-23 38 38 2 43" fill="url(#skin)" stroke="#be7d67" strokeWidth="3"/>
        <path d="M138 156q15-37 77-37t79 37l-3 67q-4 54-44 77-32 17-63 0-42-25-45-77Z" fill="url(#skin)" stroke="#a95f56" strokeWidth="2"/>
        <path d="M140 221q17 31 35 34 12-17 40-15 29-2 42 15 19-3 33-34-1 49-44 76-32 18-61 0-42-25-45-76Z" fill="#5c3440"/>
        <ellipse cx="161" cy="222" rx="21" ry="15" fill="url(#blush)"/><ellipse cx="269" cy="222" rx="21" ry="15" fill="url(#blush)"/>
        <path d="M158 179q14-10 31-1m52 0q17-9 31 1" fill="none" stroke="#5c3440" strokeWidth="5" strokeLinecap="round"/>
        <g className="chef-eyes" fill="#35232d"><ellipse cx="176" cy="194" rx="5" ry="7"/><ellipse cx="254" cy="194" rx="5" ry="7"/><circle cx="177" cy="192" r="1.5" fill="#fff"/><circle cx="255" cy="192" r="1.5" fill="#fff"/></g>
        <path d="M216 192l-8 27q4 7 14 3" fill="none" stroke="#a96356" strokeWidth="3" strokeLinecap="round"/>
        <path d="M178 242q23-23 37-8 16-15 38 8-21 11-38 2-19 9-37-2Z" fill="#432937"/>
        <path d="M200 259q15 13 31 0" fill="none" stroke="#ffddbd" strokeWidth="4" strokeLinecap="round"/>
        <path d="M130 143q-29-10-34-35c-6-29 15-52 46-53 7-22 29-35 53-30 20-16 51-12 67 7 26-2 46 15 48 40 34 11 36 50 6 65l-16 18H136Z" fill="url(#uniform)" stroke="#f8e8d6" strokeWidth="3"/>
        <path d="M144 82q-3-11 3-22m44 15q-4-23 7-40m41 43q12-21 8-38m29 61q19-13 24-30" fill="none" stroke="#b48382" strokeOpacity=".55" strokeWidth="3" strokeLinecap="round"/>
        <path d="M130 128q85 13 176-2l-3 30q-84 18-169 0Z" fill="#fff3dd" stroke="#d3b1a2" strokeWidth="2"/>
        <text x="219" y="153" textAnchor="middle" fill="#6a324a" fontFamily="Georgia, serif" fontSize="19" fontWeight="bold" letterSpacing="4">KOKA</text>
        <path d="M103 367q-23 60 6 77l51 3m168-80q24 60-5 77l-51 3" fill="none" stroke="url(#uniform)" strokeWidth="33" strokeLinecap="round"/>
        <path d="M136 441q14-18 34-5l11 12q-15 17-39 8Zm157 0q-14-18-34-5l-11 12q15 17 39 8Z" fill="url(#skin)"/>
      </g>
      <g className="chef-dessert">
        <ellipse cx="215" cy="435" rx="94" ry="12" fill="url(#brass)"/>
        <path d="M159 422v-32q55-24 112 0v32q-55 21-112 0Z" fill="#cd8d62"/>
        <path d="M159 403q56 18 112 0v8q-56 19-112 0Z" fill="#fff0cd"/>
        <path d="M159 390q55-25 112 0v11q-11 10-24 0-16 12-31 0-16 12-32 0-15 9-25-2Z" fill="#7c3c50"/>
        <path d="M201 379q-6-16 8-16 5 0 7 6 5-6 10-4 9 4 1 15-14 8-26-1Z" fill="#d66b79"/>
        <path d="m215 368 5-9m15 20 10-7m-58 10-7-6" stroke="#b5bb76" strokeWidth="3" strokeLinecap="round"/>
      </g>
    </svg>
    <div className="chef-caption motion-glass"><span className="live-dot"/> شيف قوقه <small>مرشد الوصفات</small></div>
  </div>;
}
