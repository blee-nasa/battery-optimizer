interface TopoMapProps {
  className?: string
}

/**
 * Decorative topographic contour map. The contours are marching-squares
 * output over a synthetic terrain built from rotated, anisotropic Gaussian
 * ridges and basins, so the lines nest and close the way real elevation
 * contours do. The layout is deliberately asymmetric (symmetric peaks read
 * as a face) and has one dominant summit. Every third contour is an index
 * line, drawn heavier.
 *
 * Three survey stations triangulate that summit, which sits at roughly
 * (78, 67) in viewBox units.
 */
const SUMMIT = { x: 78, y: 67 }

const STATIONS = [
  { x: 28, y: 34 },
  { x: 143, y: 47 },
  { x: 86, y: 152 },
]

export const TopoMap = ({ className }: TopoMapProps) => {
  return (
    <svg
      className={className}
      viewBox="0 0 180 180"
      preserveAspectRatio="xMidYMid meet"
      role="presentation"
      aria-hidden="true"
      fill="none"
      stroke="currentColor"
      strokeLinejoin="round"
      strokeLinecap="round"
    >
      <g opacity="0.75">
      <polyline strokeWidth="0.7" opacity="0.6" points="13,22 11,24 11,28 13,31 15,31 16,30 18,28 18,24 16,22 15,21 13,22" />
      <polyline strokeWidth="0.7" opacity="0.6" points="144,124 138,128 135,131 133,135 133,138 133,143 137,149 144,155 154,158 164,158 169,156 172,154 176,149 177,144 175,138 172,133 166,128 159,125 151,123 144,124" />
      <polyline strokeWidth="0.7" opacity="0.6" points="0,44 5,48 10,50 15,49 19,46 24,42 28,36 31,29 32,21 31,15 29,10 26,6 21,3 16,1 10,1 5,3 0,8" />
      <polyline strokeWidth="0.7" opacity="0.6" points="180,128 172,121 162,117 152,115 144,116 136,119 129,125 124,133 122,141 123,148 128,155 135,161 144,165 154,168 164,168 172,167 180,163" />
      <polyline strokeWidth="1.5" points="37,0 40,8 40,18 37,29 31,42 24,52 16,59 8,63 3,63 0,63" />
      <polyline strokeWidth="1.5" points="180,115 170,110 159,107 149,107 139,110 129,117 121,126 115,138 113,148 115,156 119,162 126,168 136,174 148,177 159,179 170,178 180,176" />
      <polyline strokeWidth="0.7" opacity="0.6" points="51,0 50,10 46,21 40,34 34,46 28,56 21,64 0,85" />
      <polyline strokeWidth="0.7" opacity="0.6" points="180,102 174,100 165,99 159,98 152,99 146,101 139,104 128,112 117,123 109,136 103,149 95,174 92,180" />
      <polyline strokeWidth="0.7" opacity="0.6" points="68,0 62,7 55,16 36,50 17,79 9,96 0,118" />
      <polyline strokeWidth="0.7" opacity="0.6" points="149,0 170,4 175,6 180,9" />
      <polyline strokeWidth="0.7" opacity="0.6" points="180,87 164,89 154,91 144,95 135,101 125,109 116,118 94,148 88,156 76,164 63,170 55,173 47,174 39,173 31,171 21,168 11,162 5,157 0,150" />
      <polyline strokeWidth="1.5" points="180,41 170,31 161,24 152,21 135,15 117,5 110,3 102,1 92,1 83,3 73,8 63,15 54,27 43,44 25,76 19,91 8,123 6,135 8,143 11,148 16,153 24,158 32,161 41,163 49,164 57,163 66,160 78,154 88,146 96,138 118,110 126,102 135,95 148,87 172,78 180,74" />
      <polyline strokeWidth="0.7" opacity="0.6" points="88,10 79,12 71,16 65,20 58,27 51,37 43,50 33,68 28,79 16,118 14,125 14,131 15,138 19,144 24,149 32,154 44,156 55,156 66,153 76,149 83,144 91,137 118,105 131,93 143,85 167,71 171,68 174,63 175,60 175,55 172,47 166,39 157,32 149,28 131,21 107,11 97,9 88,10" />
      <polyline strokeWidth="0.7" opacity="0.6" points="83,16 76,18 70,22 63,27 57,34 50,43 43,55 37,68 32,79 22,118 21,130 22,136 26,141 31,145 37,148 47,150 58,150 70,146 79,141 92,130 128,91 138,83 158,70 163,65 166,60 166,54 164,47 157,40 149,34 104,16 92,15 83,16" />
      <polyline strokeWidth="1.5" points="89,19 83,20 75,23 68,27 62,33 55,41 49,50 43,62 38,71 33,89 28,117 27,125 28,131 31,136 34,139 40,143 50,145 60,144 70,141 79,136 86,131 94,123 126,87 135,80 152,68 156,64 158,60 159,55 157,49 153,44 147,39 139,35 105,22 97,20 89,19" />
      <polyline strokeWidth="0.7" opacity="0.6" points="84,24 78,26 71,29 65,34 60,39 55,45 49,55 41,73 37,91 33,122 34,126 36,131 41,135 45,138 54,139 63,138 73,135 83,129 97,115 125,84 146,66 150,62 152,58 152,54 150,49 145,44 139,40 102,25 92,23 84,24" />
      <polyline strokeWidth="0.7" opacity="0.6" points="86,27 79,29 75,31 68,35 63,40 58,45 53,54 49,62 45,71 42,79 41,89 39,109 40,118 41,123 42,126 45,130 50,132 58,133 66,132 75,129 84,122 99,109 122,82 141,65 145,58 145,54 144,50 141,47 135,43 102,29 94,27 86,27" />
      <polyline strokeWidth="1.5" points="88,31 81,32 76,34 70,38 65,42 60,48 55,55 48,70 46,78 44,88 44,97 45,110 47,117 49,121 52,124 55,126 62,127 70,125 78,122 86,116 99,103 118,80 134,65 137,62 138,58 138,55 137,52 134,49 129,45 102,33 94,31 88,31" />
      <polyline strokeWidth="0.7" opacity="0.6" points="81,35 76,37 71,40 62,49 54,62 50,75 48,81 48,89 50,104 52,110 55,115 58,117 62,119 68,119 75,117 81,114 89,107 99,97 114,78 126,65 129,62 130,58 129,54 126,50 119,45 105,38 99,36 92,34 86,34 81,35" />
      <polyline strokeWidth="0.7" opacity="0.6" points="81,39 76,41 71,44 63,52 57,63 53,75 52,86 54,97 57,103 60,107 63,109 66,110 71,110 78,108 84,105 89,101 99,90 118,65 120,60 120,55 117,52 112,47 104,42 97,39 92,38 86,38 81,39" />
      <polyline strokeWidth="1.5" points="84,42 76,45 68,51 61,60 57,71 56,81 56,86 58,91 62,97 65,100 68,101 73,102 78,100 83,98 88,94 93,89 99,81 107,68 110,62 111,58 110,55 106,50 103,47 94,43 89,42 84,42" />
      <polyline strokeWidth="0.7" opacity="0.6" points="81,47 75,50 69,55 64,62 61,70 60,78 61,84 65,90 70,93 73,93 78,92 83,90 86,87 95,76 99,68 101,63 102,57 100,54 97,50 94,48 89,46 81,47" />
      <polyline strokeWidth="0.7" opacity="0.6" points="84,52 79,53 75,56 70,60 68,65 66,71 66,76 67,79 70,83 75,84 81,81 87,76 92,68 93,62 93,57 89,53 84,52" />      </g>

      <g stroke="#d0342c">
        <polygon
          points={STATIONS.map(({ x, y }) => `${x},${y}`).join(' ')}
          strokeWidth="1.2"
        />
        {STATIONS.map(({ x, y }) => (
          <line key={`${x},${y}`} x1={x} y1={y} x2={SUMMIT.x} y2={SUMMIT.y} strokeWidth="0.7" strokeDasharray="3 2.5" />
        ))}
        {STATIONS.map(({ x, y }) => (
          <circle key={`${x},${y}`} cx={x} cy={y} r="4.5" strokeWidth="1.8" fill="#fff" />
        ))}
      </g>
    </svg>
  )
}
