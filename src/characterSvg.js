/**
 * Dual Anime Character SVG Illustrations
 * 1. Descent Pose: Boy falling backward in zero-G freefall (Makoto Shinkai reference).
 * 2. Ascent Pose: Boy soaring triumphantly upward toward the light with massive radiant wings.
 */
export function getCharacterSvgMarkup() {
  return `
  <div id="hero-character-wrapper" class="hero-character-wrapper">

    <!-- ========================================== -->
    <!-- 1. DESCENT POSE: BACKWARD ZERO-G FREEFALL -->
    <!-- ========================================== -->
    <svg id="hero-svg-descent" viewBox="0 0 500 350" class="hero-character-svg hero-descent" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="descShirtGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#ffffff"/>
          <stop offset="65%" stop-color="#f0f3fa"/>
          <stop offset="100%" stop-color="#d9e0f0"/>
        </linearGradient>

        <linearGradient id="descShirtShadow" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#ccd5ea"/>
          <stop offset="100%" stop-color="#b4bfdc"/>
        </linearGradient>

        <linearGradient id="descPantsGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#2a2228"/>
          <stop offset="50%" stop-color="#1e181e"/>
          <stop offset="100%" stop-color="#141014"/>
        </linearGradient>

        <linearGradient id="descHairGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#2e3642"/>
          <stop offset="60%" stop-color="#181d24"/>
          <stop offset="100%" stop-color="#0f1217"/>
        </linearGradient>

        <linearGradient id="descSkinGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#fce8de"/>
          <stop offset="100%" stop-color="#f0cbba"/>
        </linearGradient>

        <linearGradient id="descShoeTeal" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#5eead4"/>
          <stop offset="100%" stop-color="#0d9488"/>
        </linearGradient>
      </defs>

      <!-- SNEAKERS & FEET (Left & Right, facing left/upwards) -->
      <!-- Back Leg Shoe -->
      <g class="shoe-back" transform="translate(130, 145)">
        <path d="M 5 15 C 2 8, 8 2, 18 1 C 28 0, 34 8, 30 20 C 22 25, 8 24, 5 15 Z" fill="#ffffff" stroke="#1e181e" stroke-width="2"/>
        <path d="M 10 14 C 14 8, 22 6, 26 12" stroke="url(#descShoeTeal)" stroke-width="3" stroke-linecap="round" fill="none"/>
        <path d="M 4 18 C 12 24, 25 24, 30 19" fill="#e2e8f0"/>
      </g>

      <!-- Front Leg Shoe -->
      <g class="shoe-front" transform="translate(112, 160)">
        <path d="M 4 16 C 1 8, 8 2, 18 1 C 29 0, 35 9, 31 22 C 22 27, 8 26, 4 16 Z" fill="#ffffff" stroke="#1e181e" stroke-width="2.2"/>
        <path d="M 9 15 C 13 8, 23 6, 27 13" stroke="url(#descShoeTeal)" stroke-width="3.5" stroke-linecap="round" fill="none"/>
        <path d="M 3 20 C 12 26, 26 26, 31 21" fill="#e2e8f0"/>
        <path d="M 2 22 L 30 23" stroke="#94a3b8" stroke-width="1.5"/>
      </g>

      <!-- PANTS & LEGS (Bent knees in weightless freefall) -->
      <path d="M 152 150 C 175 125, 215 130, 235 155 L 215 185 C 190 160, 160 160, 145 155 Z" fill="#181318"/>
      <path d="M 135 168 C 158 135, 195 128, 225 152 C 238 162, 245 185, 252 208 L 225 212 C 215 188, 205 170, 188 160 C 170 152, 150 178, 130 178 Z" fill="url(#descPantsGrad)" stroke="#0f0c0f" stroke-width="2"/>
      <path d="M 188 155 C 192 165, 198 175, 206 182" stroke="#3d333b" stroke-width="2" fill="none"/>

      <!-- WHITE SHIRT & CEL SHADING -->
      <path d="M 225 208 C 240 216, 260 214, 275 205 C 310 185, 330 165, 345 140 L 325 125 C 295 150, 260 175, 230 182 Z" fill="url(#descShirtShadow)"/>
      <path d="M 235 206 C 245 215, 265 212, 282 200 C 315 178, 335 155, 350 130 C 342 120, 332 118, 318 122 C 290 130, 268 152, 245 172 C 236 180, 230 195, 235 206 Z" fill="url(#descShirtGrad)" stroke="#1e181e" stroke-width="2"/>
      <path d="M 252 196 C 265 185, 285 170, 305 162" stroke="#cbd5e1" stroke-width="2.5" fill="none"/>
      <path d="M 270 198 C 285 188, 308 178, 328 150" stroke="#cbd5e1" stroke-width="2" fill="none"/>

      <!-- ARMS & HANDS (Floating near chest) -->
      <path d="M 315 124 C 300 135, 285 145, 265 140 C 255 138, 245 125, 252 115 C 260 105, 280 110, 300 112 Z" fill="url(#descShirtGrad)" stroke="#1e181e" stroke-width="2"/>
      <path d="M 255 128 C 250 120, 250 110, 255 102 C 258 98, 265 100, 268 108 Z" fill="url(#descShirtShadow)"/>
      <path d="M 252 108 C 248 102, 248 94, 254 90 C 258 87, 265 89, 266 96 C 267 101, 265 106, 260 108 Z" fill="url(#descSkinGrad)" stroke="#1e181e" stroke-width="1.8"/>
      <path d="M 258 92 C 255 86, 258 80, 264 78 C 268 77, 272 82, 270 88 Z" fill="url(#descSkinGrad)" stroke="#1e181e" stroke-width="1.5"/>

      <!-- NECK & FACE -->
      <path d="M 324 122 C 330 118, 338 122, 342 130 C 345 135, 340 140, 335 138 Z" fill="url(#descSkinGrad)"/>
      <path d="M 334 125 C 338 122, 345 122, 348 126 C 352 130, 350 136, 344 140 C 338 142, 332 135, 334 125 Z" fill="url(#descSkinGrad)" stroke="#1e181e" stroke-width="1.8"/>

      <!-- WINDBLOWN SPIKY DARK HAIR -->
      <path d="M 326 124 C 328 110, 334 98, 345 92 C 348 84, 356 80, 365 82 C 370 78, 380 78, 385 85 C 392 84, 400 90, 404 98 C 408 106, 404 116, 396 122 C 402 126, 402 134, 395 140 C 388 146, 378 144, 372 138 C 368 142, 358 145, 352 140 C 346 138, 342 142, 336 138 Z" fill="url(#descHairGrad)" stroke="#0d1117" stroke-width="2.2" stroke-linejoin="round"/>
      <path d="M 365 82 Q 378 68, 388 78" stroke="#0d1117" stroke-width="2.2" fill="none"/>
      <path d="M 385 85 Q 402 78, 412 92" stroke="#0d1117" stroke-width="2.2" fill="none"/>
      <path d="M 404 98 Q 420 102, 418 116" stroke="#0d1117" stroke-width="2.2" fill="none"/>
      <path d="M 396 122 Q 412 128, 405 138" stroke="#0d1117" stroke-width="2.2" fill="none"/>
      <path d="M 348 98 C 360 92, 375 92, 388 96" stroke="#475569" stroke-width="2" stroke-linecap="round" fill="none"/>
    </svg>

    <!-- ========================================== -->
    <!-- 2. ASCENT POSE: SOARING UPWARD INTO LIGHT -->
    <!-- ========================================== -->
    <svg id="hero-svg-ascent" viewBox="0 0 540 460" class="hero-character-svg hero-ascent" xmlns="http://www.w3.org/2000/svg">
      <defs>
                <!-- Radiant Celestial Golden Wings Gradients -->
        <linearGradient id="ascWingGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#ffffff"/>
          <stop offset="18%" stop-color="#fffbeb"/>
          <stop offset="45%" stop-color="#fef08a"/>
          <stop offset="75%" stop-color="#fbbf24"/>
          <stop offset="100%" stop-color="#f59e0b"/>
        </linearGradient>

        <linearGradient id="ascWingGrad2" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#fffef0"/>
          <stop offset="28%" stop-color="#fde047"/>
          <stop offset="68%" stop-color="#f59e0b"/>
          <stop offset="100%" stop-color="#d97706"/>
        </linearGradient>

        <linearGradient id="ascWingInner" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#ffffff" stop-opacity="0.95"/>
          <stop offset="35%" stop-color="#fef08a" stop-opacity="0.85"/>
          <stop offset="75%" stop-color="#fbbf24" stop-opacity="0.65"/>
          <stop offset="100%" stop-color="#d97706" stop-opacity="0.45"/>
        </linearGradient>

        <linearGradient id="ascWingCovert" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#ffffff"/>
          <stop offset="30%" stop-color="#fef08a"/>
          <stop offset="70%" stop-color="#fbbf24"/>
          <stop offset="100%" stop-color="#f59e0b"/>
        </linearGradient>

        <linearGradient id="ascQuillGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#ffffff" stop-opacity="0.95"/>
          <stop offset="50%" stop-color="#fef9c3" stop-opacity="0.85"/>
          <stop offset="100%" stop-color="#fbbf24" stop-opacity="0.25"/>
        </linearGradient>

        <radialGradient id="ascWingAura" cx="50%" cy="40%" r="55%">
          <stop offset="0%" stop-color="#fef08a" stop-opacity="0.55"/>
          <stop offset="60%" stop-color="#fbbf24" stop-opacity="0.25"/>
          <stop offset="100%" stop-color="#f59e0b" stop-opacity="0"/>
        </radialGradient>

        <!-- Matching Anime Boy Palettes -->
        <linearGradient id="ascShirtGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#ffffff"/>
          <stop offset="65%" stop-color="#f0f3fa"/>
          <stop offset="100%" stop-color="#d9e0f0"/>
        </linearGradient>

        <linearGradient id="ascShirtShadow" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#ccd5ea"/>
          <stop offset="100%" stop-color="#b4bfdc"/>
        </linearGradient>

        <linearGradient id="ascPantsGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#2a2228"/>
          <stop offset="50%" stop-color="#1e181e"/>
          <stop offset="100%" stop-color="#141014"/>
        </linearGradient>

        <linearGradient id="ascHairGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#2e3642"/>
          <stop offset="60%" stop-color="#181d24"/>
          <stop offset="100%" stop-color="#0f1217"/>
        </linearGradient>

        <linearGradient id="ascSkinGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#fce8de"/>
          <stop offset="100%" stop-color="#f0cbba"/>
        </linearGradient>

        <linearGradient id="ascShoeTeal" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#5eead4"/>
          <stop offset="100%" stop-color="#0d9488"/>
        </linearGradient>
      </defs>

            <!-- A. MAJESTIC CELESTIAL RADIANT WINGS (Arching soaring seraphic plumage) -->
      <g id="soaring-wings" class="soaring-wings">
        <g class="wing-left">
          <!-- Ambient Solar Glow Aura -->
          <path d="M 255 130 C 220 50, 145 10, 80 18 C 30 24, 2 58, 5 95 C 6 138, 20 185, 60 238 C 110 230, 175 205, 235 165 Z" fill="url(#ascWingAura)"/>

          <!-- Tier 1: Primary Flight Feathers (Sweeping seraphic blades) -->
          <path d="M 256 122 C 230 68, 178 12, 124 14 C 98 15, 70 24, 58 32 C 68 44, 108 55, 168 76 C 215 92, 246 112, 256 122 Z" fill="url(#ascWingGrad1)" stroke="rgba(255,255,255,0.65)" stroke-width="0.8"/>
          <path d="M 254 125 C 218 72, 142 32, 86 38 C 58 42, 36 52, 28 62 C 42 74, 94 86, 165 102 C 218 114, 248 120, 254 125 Z" fill="url(#ascWingGrad1)" stroke="rgba(255,255,255,0.6)" stroke-width="0.8"/>
          <path d="M 252 128 C 204 82, 120 54, 58 70 C 32 78, 14 90, 10 100 C 26 110, 80 116, 158 120 C 214 122, 246 125, 252 128 Z" fill="url(#ascWingGrad1)" stroke="rgba(255,255,255,0.55)" stroke-width="0.75"/>
          <path d="M 250 132 C 190 95, 105 84, 46 106 C 24 116, 10 130, 12 140 C 30 146, 82 142, 152 136 C 210 130, 244 129, 250 132 Z" fill="url(#ascWingGrad2)" stroke="rgba(255,255,255,0.5)" stroke-width="0.75"/>
          <path d="M 248 136 C 182 110, 102 115, 48 144 C 30 156, 22 170, 28 178 C 46 180, 95 168, 156 154 C 210 142, 242 136, 248 136 Z" fill="url(#ascWingGrad2)" stroke="rgba(255,255,255,0.45)" stroke-width="0.7"/>
          <path d="M 246 140 C 178 125, 110 146, 62 180 C 46 194, 44 206, 54 212 C 72 210, 115 190, 164 172 C 212 154, 240 142, 246 140 Z" fill="url(#ascWingGrad2)" stroke="rgba(255,255,255,0.4)" stroke-width="0.7"/>
          <path d="M 244 144 C 180 140, 125 172, 84 210 C 72 224, 74 234, 86 238 C 104 232, 138 210, 176 190 C 216 168, 238 148, 244 144 Z" fill="url(#ascWingGrad2)" stroke="rgba(255,255,255,0.4)" stroke-width="0.65"/>
          <path d="M 242 148 C 186 155, 142 195, 112 232 C 102 244, 108 252, 120 252 C 136 244, 162 222, 192 202 C 220 180, 236 156, 242 148 Z" fill="url(#ascWingGrad2)" stroke="rgba(255,255,255,0.35)" stroke-width="0.6"/>

          <!-- Tier 2: Secondary Feathers (Inner plumage depth) -->
          <path d="M 252 124 C 215 75, 152 44, 102 54 C 85 58, 70 70, 78 78 C 96 84, 142 94, 196 106 C 230 114, 248 120, 252 124 Z" fill="url(#ascWingInner)" stroke="rgba(255,255,255,0.45)" stroke-width="0.7"/>
          <path d="M 250 128 C 196 84, 134 68, 86 88 C 72 96, 62 108, 70 116 C 90 120, 136 122, 188 124 C 226 125, 246 126, 250 128 Z" fill="url(#ascWingInner)" stroke="rgba(255,255,255,0.45)" stroke-width="0.7"/>
          <path d="M 248 132 C 182 98, 122 98, 78 122 C 65 132, 60 144, 70 150 C 88 152, 132 146, 182 140 C 222 136, 244 133, 248 132 Z" fill="url(#ascWingInner)" stroke="rgba(255,255,255,0.45)" stroke-width="0.7"/>
          <path d="M 246 136 C 174 114, 118 128, 82 158 C 72 168, 70 180, 82 184 C 100 184, 138 172, 184 160 C 220 148, 242 140, 246 136 Z" fill="url(#ascWingInner)" stroke="rgba(255,255,255,0.45)" stroke-width="0.7"/>
          <path d="M 244 140 C 172 130, 124 156, 96 192 C 86 204, 88 214, 100 216 C 118 212, 150 194, 190 178 C 220 162, 240 146, 244 140 Z" fill="url(#ascWingInner)" stroke="rgba(255,255,255,0.45)" stroke-width="0.7"/>
          <path d="M 242 144 C 175 145, 136 182, 114 218 C 106 228, 112 236, 124 236 C 140 230, 166 210, 198 192 C 224 174, 238 152, 242 144 Z" fill="url(#ascWingInner)" stroke="rgba(255,255,255,0.45)" stroke-width="0.7"/>

          <!-- Tier 3: Coverts & Scapular Mantle (Soft upper crest & shoulder down) -->
          <path d="M 254 122 C 228 82, 178 54, 132 66 C 114 70, 106 82, 116 88 C 140 92, 185 98, 228 110 C 245 115, 252 119, 254 122 Z" fill="url(#ascWingCovert)" stroke="rgba(255,255,255,0.5)" stroke-width="0.75"/>
          <path d="M 250 126 C 205 92, 158 80, 120 100 C 106 108, 102 118, 112 122 C 136 124, 178 120, 222 120 C 240 122, 248 124, 250 126 Z" fill="url(#ascWingCovert)" stroke="rgba(255,255,255,0.5)" stroke-width="0.75"/>
          <path d="M 246 130 C 190 106, 144 108, 112 132 C 102 140, 102 150, 114 152 C 136 150, 176 140, 216 134 C 236 131, 244 129, 246 130 Z" fill="url(#ascWingCovert)" stroke="rgba(255,255,255,0.5)" stroke-width="0.75"/>
          <path d="M 242 134 C 180 120, 138 134, 116 162 C 108 170, 112 178, 124 178 C 144 174, 180 158, 216 146 C 234 140, 240 135, 242 134 Z" fill="url(#ascWingCovert)" stroke="rgba(255,255,255,0.5)" stroke-width="0.75"/>
          <path d="M 256 120 C 238 98, 204 88, 172 98 C 160 102, 156 110, 166 114 C 190 116, 222 118, 250 121 Z" fill="url(#ascWingCovert)" stroke="rgba(255,255,255,0.5)" stroke-width="0.75"/>
          <path d="M 255 123 C 230 110, 190 108, 160 124 C 150 130, 150 138, 162 140 C 188 136, 220 130, 250 126 Z" fill="url(#ascWingCovert)" stroke="rgba(255,255,255,0.5)" stroke-width="0.75"/>

          <!-- Radiant Celestial Quill Spines -->
          <path d="M 254 122 C 212 70, 142 22, 60 32" stroke="url(#ascQuillGrad)" stroke-width="1.40" stroke-linecap="round" fill="none"/>
          <path d="M 252 125 C 195 76, 118 48, 30 62" stroke="url(#ascQuillGrad)" stroke-width="1.32" stroke-linecap="round" fill="none"/>
          <path d="M 250 128 C 178 90, 98 75, 12 100" stroke="url(#ascQuillGrad)" stroke-width="1.24" stroke-linecap="round" fill="none"/>
          <path d="M 248 132 C 168 104, 88 108, 14 140" stroke="url(#ascQuillGrad)" stroke-width="1.16" stroke-linecap="round" fill="none"/>
          <path d="M 246 136 C 160 120, 88 135, 30 178" stroke="url(#ascQuillGrad)" stroke-width="1.08" stroke-linecap="round" fill="none"/>
          <path d="M 244 140 C 160 135, 100 162, 56 212" stroke="url(#ascQuillGrad)" stroke-width="1.00" stroke-linecap="round" fill="none"/>
          <path d="M 242 144 C 162 152, 115 190, 88 238" stroke="url(#ascQuillGrad)" stroke-width="0.92" stroke-linecap="round" fill="none"/>
          <path d="M 240 148 C 165 168, 130 215, 122 252" stroke="url(#ascQuillGrad)" stroke-width="0.84" stroke-linecap="round" fill="none"/>
        </g>

        <g class="wing-right">
          <!-- Ambient Solar Glow Aura -->
          <path d="M 285.0 130 C 320.0 50, 395.0 10, 460.0 18 C 510.0 24, 538.0 58, 535.0 95 C 534.0 138, 520.0 185, 480.0 238 C 430.0 230, 365.0 205, 305.0 165 Z" fill="url(#ascWingAura)"/>

          <!-- Tier 1: Primary Flight Feathers (Sweeping seraphic blades) -->
          <path d="M 284.0 122 C 310.0 68, 362.0 12, 416.0 14 C 442.0 15, 470.0 24, 482.0 32 C 472.0 44, 432.0 55, 372.0 76 C 325.0 92, 294.0 112, 284.0 122 Z" fill="url(#ascWingGrad1)" stroke="rgba(255,255,255,0.65)" stroke-width="0.8"/>
          <path d="M 286.0 125 C 322.0 72, 398.0 32, 454.0 38 C 482.0 42, 504.0 52, 512.0 62 C 498.0 74, 446.0 86, 375.0 102 C 322.0 114, 292.0 120, 286.0 125 Z" fill="url(#ascWingGrad1)" stroke="rgba(255,255,255,0.6)" stroke-width="0.8"/>
          <path d="M 288.0 128 C 336.0 82, 420.0 54, 482.0 70 C 508.0 78, 526.0 90, 530.0 100 C 514.0 110, 460.0 116, 382.0 120 C 326.0 122, 294.0 125, 288.0 128 Z" fill="url(#ascWingGrad1)" stroke="rgba(255,255,255,0.55)" stroke-width="0.75"/>
          <path d="M 290.0 132 C 350.0 95, 435.0 84, 494.0 106 C 516.0 116, 530.0 130, 528.0 140 C 510.0 146, 458.0 142, 388.0 136 C 330.0 130, 296.0 129, 290.0 132 Z" fill="url(#ascWingGrad2)" stroke="rgba(255,255,255,0.5)" stroke-width="0.75"/>
          <path d="M 292.0 136 C 358.0 110, 438.0 115, 492.0 144 C 510.0 156, 518.0 170, 512.0 178 C 494.0 180, 445.0 168, 384.0 154 C 330.0 142, 298.0 136, 292.0 136 Z" fill="url(#ascWingGrad2)" stroke="rgba(255,255,255,0.45)" stroke-width="0.7"/>
          <path d="M 294.0 140 C 362.0 125, 430.0 146, 478.0 180 C 494.0 194, 496.0 206, 486.0 212 C 468.0 210, 425.0 190, 376.0 172 C 328.0 154, 300.0 142, 294.0 140 Z" fill="url(#ascWingGrad2)" stroke="rgba(255,255,255,0.4)" stroke-width="0.7"/>
          <path d="M 296.0 144 C 360.0 140, 415.0 172, 456.0 210 C 468.0 224, 466.0 234, 454.0 238 C 436.0 232, 402.0 210, 364.0 190 C 324.0 168, 302.0 148, 296.0 144 Z" fill="url(#ascWingGrad2)" stroke="rgba(255,255,255,0.4)" stroke-width="0.65"/>
          <path d="M 298.0 148 C 354.0 155, 398.0 195, 428.0 232 C 438.0 244, 432.0 252, 420.0 252 C 404.0 244, 378.0 222, 348.0 202 C 320.0 180, 304.0 156, 298.0 148 Z" fill="url(#ascWingGrad2)" stroke="rgba(255,255,255,0.35)" stroke-width="0.6"/>

          <!-- Tier 2: Secondary Feathers (Inner plumage depth) -->
          <path d="M 288.0 124 C 325.0 75, 388.0 44, 438.0 54 C 455.0 58, 470.0 70, 462.0 78 C 444.0 84, 398.0 94, 344.0 106 C 310.0 114, 292.0 120, 288.0 124 Z" fill="url(#ascWingInner)" stroke="rgba(255,255,255,0.45)" stroke-width="0.7"/>
          <path d="M 290.0 128 C 344.0 84, 406.0 68, 454.0 88 C 468.0 96, 478.0 108, 470.0 116 C 450.0 120, 404.0 122, 352.0 124 C 314.0 125, 294.0 126, 290.0 128 Z" fill="url(#ascWingInner)" stroke="rgba(255,255,255,0.45)" stroke-width="0.7"/>
          <path d="M 292.0 132 C 358.0 98, 418.0 98, 462.0 122 C 475.0 132, 480.0 144, 470.0 150 C 452.0 152, 408.0 146, 358.0 140 C 318.0 136, 296.0 133, 292.0 132 Z" fill="url(#ascWingInner)" stroke="rgba(255,255,255,0.45)" stroke-width="0.7"/>
          <path d="M 294.0 136 C 366.0 114, 422.0 128, 458.0 158 C 468.0 168, 470.0 180, 458.0 184 C 440.0 184, 402.0 172, 356.0 160 C 320.0 148, 298.0 140, 294.0 136 Z" fill="url(#ascWingInner)" stroke="rgba(255,255,255,0.45)" stroke-width="0.7"/>
          <path d="M 296.0 140 C 368.0 130, 416.0 156, 444.0 192 C 454.0 204, 452.0 214, 440.0 216 C 422.0 212, 390.0 194, 350.0 178 C 320.0 162, 300.0 146, 296.0 140 Z" fill="url(#ascWingInner)" stroke="rgba(255,255,255,0.45)" stroke-width="0.7"/>
          <path d="M 298.0 144 C 365.0 145, 404.0 182, 426.0 218 C 434.0 228, 428.0 236, 416.0 236 C 400.0 230, 374.0 210, 342.0 192 C 316.0 174, 302.0 152, 298.0 144 Z" fill="url(#ascWingInner)" stroke="rgba(255,255,255,0.45)" stroke-width="0.7"/>

          <!-- Tier 3: Coverts & Scapular Mantle (Soft upper crest & shoulder down) -->
          <path d="M 286.0 122 C 312.0 82, 362.0 54, 408.0 66 C 426.0 70, 434.0 82, 424.0 88 C 400.0 92, 355.0 98, 312.0 110 C 295.0 115, 288.0 119, 286.0 122 Z" fill="url(#ascWingCovert)" stroke="rgba(255,255,255,0.5)" stroke-width="0.75"/>
          <path d="M 290.0 126 C 335.0 92, 382.0 80, 420.0 100 C 434.0 108, 438.0 118, 428.0 122 C 404.0 124, 362.0 120, 318.0 120 C 300.0 122, 292.0 124, 290.0 126 Z" fill="url(#ascWingCovert)" stroke="rgba(255,255,255,0.5)" stroke-width="0.75"/>
          <path d="M 294.0 130 C 350.0 106, 396.0 108, 428.0 132 C 438.0 140, 438.0 150, 426.0 152 C 404.0 150, 364.0 140, 324.0 134 C 304.0 131, 296.0 129, 294.0 130 Z" fill="url(#ascWingCovert)" stroke="rgba(255,255,255,0.5)" stroke-width="0.75"/>
          <path d="M 298.0 134 C 360.0 120, 402.0 134, 424.0 162 C 432.0 170, 428.0 178, 416.0 178 C 396.0 174, 360.0 158, 324.0 146 C 306.0 140, 300.0 135, 298.0 134 Z" fill="url(#ascWingCovert)" stroke="rgba(255,255,255,0.5)" stroke-width="0.75"/>
          <path d="M 284.0 120 C 302.0 98, 336.0 88, 368.0 98 C 380.0 102, 384.0 110, 374.0 114 C 350.0 116, 318.0 118, 290.0 121 Z" fill="url(#ascWingCovert)" stroke="rgba(255,255,255,0.5)" stroke-width="0.75"/>
          <path d="M 285.0 123 C 310.0 110, 350.0 108, 380.0 124 C 390.0 130, 390.0 138, 378.0 140 C 352.0 136, 320.0 130, 290.0 126 Z" fill="url(#ascWingCovert)" stroke="rgba(255,255,255,0.5)" stroke-width="0.75"/>

          <!-- Radiant Celestial Quill Spines -->
          <path d="M 286.0 122 C 328.0 70, 398.0 22, 480.0 32" stroke="url(#ascQuillGrad)" stroke-width="1.40" stroke-linecap="round" fill="none"/>
          <path d="M 288.0 125 C 345.0 76, 422.0 48, 510.0 62" stroke="url(#ascQuillGrad)" stroke-width="1.32" stroke-linecap="round" fill="none"/>
          <path d="M 290.0 128 C 362.0 90, 442.0 75, 528.0 100" stroke="url(#ascQuillGrad)" stroke-width="1.24" stroke-linecap="round" fill="none"/>
          <path d="M 292.0 132 C 372.0 104, 452.0 108, 526.0 140" stroke="url(#ascQuillGrad)" stroke-width="1.16" stroke-linecap="round" fill="none"/>
          <path d="M 294.0 136 C 380.0 120, 452.0 135, 510.0 178" stroke="url(#ascQuillGrad)" stroke-width="1.08" stroke-linecap="round" fill="none"/>
          <path d="M 296.0 140 C 380.0 135, 440.0 162, 484.0 212" stroke="url(#ascQuillGrad)" stroke-width="1.00" stroke-linecap="round" fill="none"/>
          <path d="M 298.0 144 C 378.0 152, 425.0 190, 452.0 238" stroke="url(#ascQuillGrad)" stroke-width="0.92" stroke-linecap="round" fill="none"/>
          <path d="M 300.0 148 C 375.0 168, 410.0 215, 418.0 252" stroke="url(#ascQuillGrad)" stroke-width="0.84" stroke-linecap="round" fill="none"/>
        </g>

        <!-- Floating Celestial Feather Motes / Solar Embers -->
        <g class="celestial-feather-motes">
          <polygon points="56,28 59,33 64,36 59,39 56,44 53,39 48,36 53,33" fill="#ffffff" opacity="0.85"/>
          <polygon points="484,28 487,33 492,36 487,39 484,44 481,39 476,36 481,33" fill="#ffffff" opacity="0.85"/>
          <polygon points="26,88 28,92 32,94 28,96 26,100 24,96 20,94 24,92" fill="#fef08a" opacity="0.75"/>
          <polygon points="514,88 516,92 520,94 516,96 514,100 512,96 508,94 512,92" fill="#fef08a" opacity="0.75"/>
          <polygon points="34,165 36,168 39,170 36,172 34,175 32,172 29,170 32,168" fill="#fbbf24" opacity="0.7"/>
          <polygon points="506,165 508,168 511,170 508,172 506,175 504,172 501,170 504,168" fill="#fbbf24" opacity="0.7"/>
        </g>
      </g>

      <!-- B. EXACT SAME ANIME HERO BOY IN FLIGHT -->
      <g id="soaring-hero-figure" class="soaring-hero-figure">

        <!-- SNEAKERS & FEET (Identical design to freefall boy) -->
        <!-- Back Leg Sneaker -->
        <g class="shoe-back" transform="translate(268, 382)">
          <path d="M 4 2 C 1 12, 4 26, 11 30 C 18 32, 22 22, 20 2 Z" fill="#ffffff" stroke="#1e181e" stroke-width="2"/>
          <path d="M 6 10 C 11 16, 17 18, 19 10" stroke="url(#ascShoeTeal)" stroke-width="3" stroke-linecap="round" fill="none"/>
          <path d="M 3 24 C 8 30, 16 30, 20 25" fill="#e2e8f0"/>
        </g>
        <!-- Front Leg Sneaker -->
        <g class="shoe-front" transform="translate(244, 386)">
          <path d="M 4 2 C 0 12, 3 27, 11 31 C 18 33, 23 23, 20 2 Z" fill="#ffffff" stroke="#1e181e" stroke-width="2.2"/>
          <path d="M 6 11 C 11 17, 18 19, 20 11" stroke="url(#ascShoeTeal)" stroke-width="3.5" stroke-linecap="round" fill="none"/>
          <path d="M 3 25 C 8 31, 17 31, 21 26" fill="#e2e8f0"/>
          <path d="M 3 28 L 19 28" stroke="#94a3b8" stroke-width="1.5"/>
        </g>

        <!-- DARK PANTS & LEGS (Streamlined aerodynamic flight posture with natural knee bend) -->
        <!-- Back Leg (Natural bend trailing slightly back) -->
        <path d="M 270 236 C 278 280, 286 325, 275 382 L 288 382 C 300 325, 292 280, 292 236 Z" fill="#181318"/>
        <!-- Front Leg (Streamlined leading downward) -->
        <path d="M 245 236 C 240 282, 242 330, 248 386 L 264 386 C 262 330, 264 282, 268 236 Z" fill="url(#ascPantsGrad)" stroke="#0f0c0f" stroke-width="2"/>
        <!-- Crease lines on pants -->
        <path d="M 256 248 L 254 340" stroke="#3d333b" stroke-width="1.8"/>

        <!-- BILLOWING WHITE SHIRT (Same design, folds and shadows as freefall boy) -->
        <!-- Back Shadow Layer -->
        <path d="M 242 136 C 228 168, 230 205, 242 238 C 258 244, 278 244, 294 238 C 308 205, 310 168, 296 136 Z" fill="url(#ascShirtShadow)"/>
        <!-- Front Lit Billowing Shirt Body -->
        <path d="M 246 135 C 234 165, 236 202, 246 236 C 262 242, 280 242, 292 236 C 302 202, 304 165, 292 135 C 282 128, 256 128, 246 135 Z" fill="url(#ascShirtGrad)" stroke="#1e181e" stroke-width="2"/>
        <!-- Cel-shaded folds in white fabric -->
        <path d="M 256 150 C 252 180, 250 210, 255 232" stroke="#cbd5e1" stroke-width="2.2" fill="none"/>
        <path d="M 268 146 C 268 182, 267 215, 269 236" stroke="#cbd5e1" stroke-width="2.5" fill="none"/>
        <path d="M 280 150 C 283 180, 281 210, 277 232" stroke="#cbd5e1" stroke-width="2.2" fill="none"/>

        <!-- ARMS & HANDS (Natural anatomy, sleeves swept gracefully in upward flight) -->
        <!-- Left Sleeve & Arm -->
        <path d="M 246 135 C 220 148, 195 168, 172 196 C 165 205, 175 214, 185 208 C 205 186, 226 168, 248 150 Z" fill="url(#ascShirtGrad)" stroke="#1e181e" stroke-width="2"/>
        <path d="M 185 195 C 196 182, 212 168, 230 156" stroke="#cbd5e1" stroke-width="2" fill="none"/>
        <!-- Left Cuff & Hand -->
        <path d="M 172 196 L 185 208" stroke="#1e181e" stroke-width="1.8"/>
        <!-- Left Hand (Cupped anime fingers trailing wind) -->
        <path d="M 174 200 C 168 206, 162 216, 168 222 C 173 226, 180 218, 184 210 C 188 204, 182 200, 174 200 Z" fill="url(#ascSkinGrad)" stroke="#1e181e" stroke-width="1.6"/>

        <!-- Right Sleeve & Arm -->
        <path d="M 292 135 C 318 148, 343 168, 366 196 C 373 205, 363 214, 353 208 C 333 186, 312 168, 290 150 Z" fill="url(#ascShirtGrad)" stroke="#1e181e" stroke-width="2"/>
        <path d="M 353 195 C 342 182, 326 168, 308 156" stroke="#cbd5e1" stroke-width="2" fill="none"/>
        <!-- Right Cuff & Hand -->
        <path d="M 366 196 L 353 208" stroke="#1e181e" stroke-width="1.8"/>
        <!-- Right Hand (Cupped anime fingers trailing wind) -->
        <path d="M 364 200 C 370 206, 376 216, 370 222 C 365 226, 358 218, 354 210 C 350 204, 356 200, 364 200 Z" fill="url(#ascSkinGrad)" stroke="#1e181e" stroke-width="1.6"/>

        <!-- SHIRT COLLAR & NECK -->
        <path d="M 262 138 L 276 138 L 273 115 L 265 115 Z" fill="url(#ascSkinGrad)"/>
        <!-- Left Collar Lapel -->
        <path d="M 250 136 L 264 122 L 268 138 Z" fill="#ffffff" stroke="#1e181e" stroke-width="1.8"/>
        <!-- Right Collar Lapel -->
        <path d="M 288 136 L 274 122 L 270 138 Z" fill="#f0f3fa" stroke="#1e181e" stroke-width="1.8"/>

        <!-- ANIME HEAD & PROFILE (Authentic anime boy head, matching freefall illustration) -->
        <g id="ascent-anime-head" class="ascent-anime-head">
          <!-- Face Silhouette (Uplifted 3/4 Profile gazing towards zenith light) -->
          <path d="M 260 118 
                   C 256 112, 256 102, 258 96 
                   C 260 88, 268 84, 276 84 
                   C 284 82, 287 88, 285 96 
                   C 283 104, 276 114, 270 118 Z" 
                fill="url(#ascSkinGrad)" stroke="#1e181e" stroke-width="1.8"/>

          <!-- Anime Jawline & Chin -->
          <path d="M 258 104 C 262 114, 270 116, 274 108" stroke="#1e181e" stroke-width="1.8" fill="none"/>
          <!-- Anime Nose & Forehead profile tip -->
          <path d="M 280 84 C 285 88, 284 94, 281 98" stroke="#1e181e" stroke-width="1.8" fill="none"/>
          <!-- Anime Ear -->
          <path d="M 256 96 C 252 98, 252 106, 257 108 C 259 104, 258 98, 256 96 Z" fill="url(#ascSkinGrad)" stroke="#1e181e" stroke-width="1.6"/>

          <!-- WINDBLOWN SPIKY DARK ANIME HAIR (Identical to Descent Pose!) -->
          <path d="M 255 112 
                   C 246 114, 238 106, 235 96 
                   C 226 94, 222 84, 228 75 
                   C 224 68, 228 56, 238 52 
                   C 240 44, 250 40, 260 44 
                   C 266 38, 278 40, 282 48 
                   C 288 48, 294 56, 292 64 
                   C 298 70, 296 82, 288 88 
                   C 286 92, 280 94, 276 86 
                   C 272 88, 265 92, 262 100 
                   C 260 106, 258 110, 255 112 Z" 
                fill="url(#ascHairGrad)" stroke="#0d1117" stroke-width="2.2" stroke-linejoin="round"/>

          <!-- Dynamic Anime Hair Tuft Spikes (Windblown in upward slipstream) -->
          <path d="M 260 44 Q 272 32, 282 44" stroke="#0d1117" stroke-width="2.2" fill="none"/>
          <path d="M 282 48 Q 296 44, 302 58" stroke="#0d1117" stroke-width="2.2" fill="none"/>
          <path d="M 292 64 Q 306 70, 302 84" stroke="#0d1117" stroke-width="2.2" fill="none"/>
          <path d="M 238 52 Q 224 48, 226 62" stroke="#0d1117" stroke-width="2.2" fill="none"/>
          <path d="M 228 75 Q 216 78, 220 90" stroke="#0d1117" stroke-width="2.2" fill="none"/>
          <path d="M 235 96 Q 225 104, 232 114" stroke="#0d1117" stroke-width="2.2" fill="none"/>

          <!-- Cel Hair Highlights & Golden Sunlight Rim -->
          <path d="M 252 50 C 265 44, 278 46, 288 52" stroke="#475569" stroke-width="2" stroke-linecap="round" fill="none"/>
          <path d="M 264 42 C 272 38, 280 40, 285 45" stroke="#fef08a" stroke-width="1.8" stroke-linecap="round" fill="none"/>
        </g>

        <!-- Subtle Golden Solar Energy Line along spine -->
        <path d="M 269 140 L 269 235" stroke="#fbbf24" stroke-width="2" stroke-linecap="round" stroke-dasharray="4 6"/>

      </g>
    </svg>

  </div>
  `;
}
