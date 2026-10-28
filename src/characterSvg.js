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
        <!-- Radiant Golden Wings Gradients -->
        <linearGradient id="ascWingGrad" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#ffffff"/>
          <stop offset="25%" stop-color="#fef08a"/>
          <stop offset="65%" stop-color="#fbbf24"/>
          <stop offset="100%" stop-color="#f59e0b"/>
        </linearGradient>

        <linearGradient id="ascWingInner" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#ffffff" stop-opacity="0.95"/>
          <stop offset="45%" stop-color="#fef08a" stop-opacity="0.65"/>
          <stop offset="100%" stop-color="#fbbf24" stop-opacity="0.12"/>
        </linearGradient>

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

      <!-- A. MAJESTIC RADIANT FEATHERED WINGS (Erupting from back) -->
      <g id="soaring-wings" class="soaring-wings">
        <!-- Left Wing -->
        <g class="wing-left">
          <!-- Back Primary Wing Arc -->
          <path d="M 245 155 C 185 95, 110 45, 18 65 C 80 125, 160 178, 240 185 Z" fill="url(#ascWingInner)"/>
          <!-- Tier 1 Large Feather Sweep -->
          <path d="M 240 160 C 175 90, 85 70, 8 100 C 72 150, 162 192, 235 195 Z" fill="url(#ascWingGrad)" stroke="#ffffff" stroke-width="1.8"/>
          <!-- Tier 2 Mid Feather Sweep -->
          <path d="M 235 168 C 170 118, 92 112, 28 152 C 88 185, 168 208, 230 205 Z" fill="url(#ascWingGrad)" stroke="#ffffff" stroke-width="1.5"/>
          <!-- Tier 3 Lower Feather -->
          <path d="M 230 176 C 175 142, 112 152, 62 202 C 118 222, 182 225, 226 215 Z" fill="url(#ascWingGrad)" stroke="#ffffff" stroke-width="1.2"/>
        </g>

        <!-- Right Wing -->
        <g class="wing-right">
          <!-- Back Primary Wing Arc -->
          <path d="M 285 155 C 345 95, 420 45, 512 65 C 450 125, 370 178, 290 185 Z" fill="url(#ascWingInner)"/>
          <!-- Tier 1 Large Feather Sweep -->
          <path d="M 290 160 C 355 90, 445 70, 522 100 C 458 150, 368 192, 295 195 Z" fill="url(#ascWingGrad)" stroke="#ffffff" stroke-width="1.8"/>
          <!-- Tier 2 Mid Feather Sweep -->
          <path d="M 295 168 C 360 118, 438 112, 502 152 C 442 185, 362 208, 300 205 Z" fill="url(#ascWingGrad)" stroke="#ffffff" stroke-width="1.5"/>
          <!-- Tier 3 Lower Feather -->
          <path d="M 300 176 C 355 142, 418 152, 468 202 C 412 222, 348 225, 304 215 Z" fill="url(#ascWingGrad)" stroke="#ffffff" stroke-width="1.2"/>
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
