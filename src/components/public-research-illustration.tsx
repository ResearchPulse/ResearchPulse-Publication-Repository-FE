export function PublicResearchIllustration({ className = '' }: { className?: string }) {
  return (
    <div className={`public-illustration-wrap ${className}`}>
      <svg
        viewBox="0 0 540 380"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        role="img"
        aria-label="Diagram showing manuscript version 1 receiving lecturer feedback, progressing to version 2, and reaching publication approval."
        className="public-illustration-svg"
      >
        {/* Background Grid Accent */}
        <pattern id="grid-pattern" width="24" height="24" patternUnits="userSpaceOnUse">
          <circle cx="2" cy="2" r="1.2" fill="#D8E2EB" opacity="0.6" />
        </pattern>
        <rect x="20" y="20" width="500" height="340" rx="16" fill="url(#grid-pattern)" />

        {/* Workflow Connector Line */}
        <path
          d="M 170 170 C 230 170, 230 140, 280 140"
          stroke="#0071BC"
          strokeWidth="2.5"
          strokeDasharray="5 5"
        />
        <path
          d="M 330 220 C 370 260, 410 240, 430 210"
          stroke="#15803D"
          strokeWidth="2.5"
          strokeLinecap="round"
        />

        {/* Manuscript Card V1 (Initial Draft) */}
        <g transform="translate(45, 90)">
          {/* Card Shadow & Background */}
          <rect
            x="0"
            y="0"
            width="170"
            height="210"
            rx="12"
            fill="#FFFFFF"
            stroke="#D8E2EB"
            strokeWidth="1.5"
            className="illustration-card"
          />
          {/* Version Pill */}
          <rect x="16" y="16" width="36" height="20" rx="4" fill="#EAF5FB" />
          <text x="34" y="30" fill="#005A95" fontSize="11" fontWeight="700" textAnchor="middle" fontFamily="sans-serif">
            v1.0
          </text>

          {/* Timestamp Indicator */}
          <rect x="60" y="21" width="70" height="10" rx="3" fill="#F1F5F9" />

          {/* Manuscript Title Lines */}
          <rect x="16" y="52" width="138" height="12" rx="3" fill="#172B4D" />
          <rect x="16" y="70" width="95" height="10" rx="3" fill="#62748A" />

          {/* Content Preview Lines */}
          <rect x="16" y="98" width="138" height="6" rx="2" fill="#E2E8F0" />
          <rect x="16" y="112" width="138" height="6" rx="2" fill="#E2E8F0" />
          <rect x="16" y="126" width="120" height="6" rx="2" fill="#E2E8F0" />
          <rect x="16" y="140" width="130" height="6" rx="2" fill="#E2E8F0" />

          {/* DOI / Hash badge */}
          <rect x="16" y="168" width="138" height="26" rx="6" fill="#F8FAFC" stroke="#E2E8F0" />
          <circle cx="28" cy="181" r="4" fill="#0071BC" />
          <text x="40" y="185" fill="#62748A" fontSize="9" fontWeight="600" fontFamily="sans-serif">
            SHA256 • Timestamped
          </text>
        </g>

        {/* Feedback / Review Node */}
        <g transform="translate(230, 45)">
          <rect
            x="0"
            y="0"
            width="175"
            height="105"
            rx="10"
            fill="#FFFFFF"
            stroke="#B8DCEF"
            strokeWidth="1.5"
            filter="drop-shadow(0 6px 16px rgba(0,113,188,0.08))"
          />
          {/* Badge: Lecturer Review */}
          <rect x="14" y="14" width="95" height="18" rx="4" fill="#EAF5FB" />
          <text x="61" y="27" fill="#0071BC" fontSize="10" fontWeight="700" textAnchor="middle" fontFamily="sans-serif">
            Lecturer Review
          </text>
          {/* Feedback Notes */}
          <text x="14" y="50" fill="#172B4D" fontSize="11" fontWeight="600" fontFamily="sans-serif">
            Methodology feedback
          </text>
          <rect x="14" y="60" width="145" height="6" rx="2" fill="#E2E8F0" />
          <rect x="14" y="72" width="115" height="6" rx="2" fill="#E2E8F0" />
          <circle cx="150" cy="23" r="5" fill="#15803D" />
          <path d="M 148 23 L 149.5 24.5 L 152.5 21.5" stroke="#FFFFFF" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
        </g>

        {/* Revised Manuscript Card V2 */}
        <g transform="translate(325, 120)">
          {/* Card Shadow & Background */}
          <rect
            x="0"
            y="0"
            width="170"
            height="215"
            rx="12"
            fill="#FFFFFF"
            stroke="#0071BC"
            strokeWidth="2"
            filter="drop-shadow(0 12px 28px rgba(0, 113, 188, 0.12))"
          />
          {/* Version Pill */}
          <rect x="16" y="16" width="36" height="20" rx="4" fill="#15803D" />
          <text x="34" y="30" fill="#FFFFFF" fontSize="11" fontWeight="700" textAnchor="middle" fontFamily="sans-serif">
            v2.0
          </text>

          {/* Approved status */}
          <rect x="58" y="16" width="68" height="20" rx="4" fill="#E9F7EE" />
          <text x="92" y="30" fill="#15803D" fontSize="10" fontWeight="700" textAnchor="middle" fontFamily="sans-serif">
            Approved
          </text>

          {/* Manuscript Title Lines */}
          <rect x="16" y="52" width="138" height="12" rx="3" fill="#172B4D" />
          <rect x="16" y="105" width="105" height="10" rx="3" fill="#62748A" />

          {/* Content Preview Lines */}
          <rect x="16" y="96" width="138" height="6" rx="2" fill="#E2E8F0" />
          <rect x="16" y="110" width="138" height="6" rx="2" fill="#E2E8F0" />
          <rect x="16" y="124" width="138" height="6" rx="2" fill="#E2E8F0" />
          <rect x="16" y="138" width="90" height="6" rx="2" fill="#E2E8F0" />

          {/* Publication Readiness Milestone */}
          <g transform="translate(16, 162)">
            <rect x="0" y="0" width="138" height="36" rx="8" fill="#EAF5FB" />
            <circle cx="18" cy="18" r="8" fill="#0071BC" />
            <path d="M 15 18 L 17 20 L 21 16" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            <text x="34" y="16" fill="#005A95" fontSize="10" fontWeight="700" fontFamily="sans-serif">
              Ready to Publish
            </text>
            <text x="34" y="27" fill="#62748A" fontSize="9" fontWeight="500" fontFamily="sans-serif">
              Editorial gate passed
            </text>
          </g>
        </g>
      </svg>
    </div>
  );
}
