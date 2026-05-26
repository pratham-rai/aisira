const {
    Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
    Header, Footer, AlignmentType, HeadingLevel, LevelFormat, BorderStyle,
    WidthType, ShadingType, VerticalAlign, PageBreak,
    TabStopType, TabStopPosition
} = require('docx');
const fs = require('fs');

const ORANGE = "E8751A";
const DARK_BG = "1A1A2E";
const HEADING_COLOR = "C45E10";
const ACCENT2 = "16213E";
const GRAY_TEXT = "666666";
const TEXT_DARK = "1A1A2E";
const TABLE_ALT = "FDF3EB";
const WHITE = "FFFFFF";

const cellBorder = { style: BorderStyle.SINGLE, size: 1, color: "DDDDDD" };
const cellBorders = { top: cellBorder, bottom: cellBorder, left: cellBorder, right: cellBorder };
const orangeRule = { style: BorderStyle.SINGLE, size: 6, color: ORANGE, space: 1 };

function pageBreak() {
    return new Paragraph({ children: [new TextRun({ break: 1 })] });
}
function spacer(b = 120, a = 120) {
    return new Paragraph({ spacing: { before: b, after: a }, children: [new TextRun("")] });
}
function body(text, opts = {}) {
    return new Paragraph({
        spacing: { before: 80, after: 80, line: 300 },
        alignment: opts.justify ? AlignmentType.BOTH : AlignmentType.LEFT,
        children: [new TextRun({ text, size: 22, font: "Arial", color: opts.color || TEXT_DARK, bold: opts.bold || false, italics: opts.italics || false })]
    });
}
function bullet(text) {
    return new Paragraph({
        numbering: { reference: "bullets", level: 0 },
        spacing: { before: 60, after: 60 },
        children: [new TextRun({ text, size: 21, font: "Arial", color: TEXT_DARK })]
    });
}
function subbullet(text) {
    return new Paragraph({
        numbering: { reference: "subbullets", level: 0 },
        spacing: { before: 40, after: 40 },
        children: [new TextRun({ text, size: 20, font: "Arial", color: GRAY_TEXT })]
    });
}
function h1(text) {
    return new Paragraph({
        heading: HeadingLevel.HEADING_1,
        border: { bottom: orangeRule },
        spacing: { before: 400, after: 200 },
        children: [new TextRun({ text, bold: true, color: HEADING_COLOR, size: 38, font: "Arial" })]
    });
}
function h2(text) {
    return new Paragraph({
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 280, after: 140 },
        children: [new TextRun({ text, bold: true, color: ACCENT2, size: 28, font: "Arial" })]
    });
}
function h3(text) {
    return new Paragraph({
        spacing: { before: 200, after: 100 },
        children: [new TextRun({ text, bold: true, color: ORANGE, size: 24, font: "Arial" })]
    });
}
function makeTable(headers, rows, colWidths) {
    const total = colWidths.reduce((a, b) => a + b, 0);
    const hRow = new TableRow({
        tableHeader: true,
        children: headers.map((h, i) => new TableCell({
            borders: cellBorders,
            width: { size: colWidths[i], type: WidthType.DXA },
            shading: { fill: DARK_BG, type: ShadingType.CLEAR },
            margins: { top: 100, bottom: 100, left: 140, right: 140 },
            verticalAlign: VerticalAlign.CENTER,
            children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: h, bold: true, size: 20, font: "Arial", color: WHITE })] })]
        }))
    });
    const dRows = rows.map((row, ri) => new TableRow({
        children: row.map((cell, ci) => new TableCell({
            borders: cellBorders,
            width: { size: colWidths[ci], type: WidthType.DXA },
            shading: { fill: ri % 2 === 0 ? WHITE : TABLE_ALT, type: ShadingType.CLEAR },
            margins: { top: 80, bottom: 80, left: 140, right: 140 },
            children: [new Paragraph({ children: [new TextRun({ text: cell, size: 20, font: "Arial", color: TEXT_DARK })] })]
        }))
    }));
    return new Table({ width: { size: total, type: WidthType.DXA }, columnWidths: colWidths, rows: [hRow, ...dRows] });
}
function infoBox(label, value) {
    return new Table({
        width: { size: 9360, type: WidthType.DXA },
        columnWidths: [2400, 6960],
        rows: [new TableRow({
            children: [
                new TableCell({ borders: cellBorders, width: { size: 2400, type: WidthType.DXA }, shading: { fill: "F5EDE0", type: ShadingType.CLEAR }, margins: { top: 80, bottom: 80, left: 120, right: 120 }, children: [new Paragraph({ children: [new TextRun({ text: label, bold: true, size: 20, font: "Arial", color: HEADING_COLOR })] })] }),
                new TableCell({ borders: cellBorders, width: { size: 6960, type: WidthType.DXA }, shading: { fill: WHITE, type: ShadingType.CLEAR }, margins: { top: 80, bottom: 80, left: 120, right: 120 }, children: [new Paragraph({ children: [new TextRun({ text: value, size: 20, font: "Arial" })] })] })
            ]
        })]
    });
}

// COVER
function coverPage() {
    const fields = [
        ["Project Name", "Aisira Digital Platform"], ["Version", "1.0 (Final Polish)"], ["Report Date", "May 15, 2026"],
        ["Developer", "Pratham Rai"], ["Development Partner", "Antigravity AI"], ["Website", "Aisira-8bca2.web.app"],
        ["Mobile App", "Android APK via Capacitor"], ["Status", "Live & Deployed"],
    ];
    return [
        spacer(1000),
        new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 0, after: 60 }, children: [new TextRun({ text: "Aisira", bold: true, size: 100, font: "Arial", color: ORANGE })] }),
        new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 0, after: 280 }, children: [new TextRun({ text: "The Digital Treasure of Yakshagana Events", size: 34, font: "Arial", color: ACCENT2, italics: true })] }),
        new Paragraph({ alignment: AlignmentType.CENTER, border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: ORANGE, space: 1 } }, spacing: { before: 0, after: 360 }, children: [new TextRun("")] }),
        new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 0, after: 80 }, children: [new TextRun({ text: "COMPREHENSIVE PROJECT REPORT", bold: true, size: 34, font: "Arial", color: ACCENT2 })] }),
        new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 0, after: 600 }, children: [new TextRun({ text: "Version 1.0 — Final Polish", size: 24, font: "Arial", color: GRAY_TEXT })] }),
        ...fields.flatMap(([k, v]) => [infoBox(k, v), spacer(30, 30)]),
        pageBreak()
    ];
}

// TOC
function toc() {
    const entries = [
        ["1", "Executive Summary"], ["2", "Introduction & Background"], ["3", "Project Objectives & Success Metrics"],
        ["4", "Technical Stack & Architecture"], ["5", "Core Event Discovery — Home Page"],
        ["6", "User Authentication & Role-Based Access"], ["7", "Event Submission & Management"],
        ["8", "Admin Control Center"], ["9", "Specialized Content & Mobile Support"],
        ["10", "Monetization & SEO"], ["11", "Backend Architecture & Data Models"],
        ["12", "Security Implementation"], ["13", "UI/UX Design System & Micro-Details"],
        ["14", "Deployment, DevOps & Performance"], ["15", "Future Roadmap & Conclusion"],
    ];
    return [
        h1("Table of Contents"), spacer(80),
        ...entries.map(([n, t]) => new Paragraph({
            tabStops: [{ type: TabStopType.RIGHT, position: 9200, leader: TabStopPosition.LEADING }],
            spacing: { before: 80, after: 80 },
            children: [new TextRun({ text: `${n}.   ${t}`, size: 22, font: "Arial", color: TEXT_DARK }), new TextRun({ text: "\t", size: 22, font: "Arial", color: GRAY_TEXT })]
        })),
        pageBreak()
    ];
}

function s1() {
    return [
        h1("1. Executive Summary"),
        body("Aisira is a premium, full-stack digital platform purpose-built to modernize the discovery, promotion, and archival of Yakshagana — the classical dance-drama tradition of coastal Karnataka. The platform unifies event listings, interactive mapping, automated notifications, community features, administrative tooling, and native mobile support into a single, polished application.", { justify: true }),
        spacer(80),
        body("At its core, Aisira solves a real community problem: Yakshagana events have historically been announced through fragmented channels — WhatsApp forwards, Facebook groups, and local notice boards. The platform creates a single authoritative digital destination where organizers publish events, audiences discover and save them, and admins curate quality.", { justify: true }),
        spacer(80),
        body("Key platform highlights at Version 1.0:", { bold: true }),
        bullet("Dynamic event grid with smart sorting (Earliest, Latest, Prasanga A-Z), real-time tri-field search, Thittu filtering, and date range filters (Today / This Week / This Month)."),
        bullet("Live stat cards: upcoming event count, active Thittu types, and active locations."),
        bullet("Google One-Tap Login with automatic profile picture and display name sync from Google accounts."),
        bullet("Three-tier RBAC: User, Admin, and Master Admin with distinct permission scopes enforced server-side."),
        bullet("Auto-coordinate resolution from Google Maps URLs — no manual GPS entry for organizers."),
        bullet("Multi-poster image upload per event via Cloudinary; interactive Leaflet.js map preview on submission."),
        bullet("Admin Control Center with real-time dashboard stats, batch management tabs, admin audit trail, admin performance leaderboard, and contributor rankings."),
        bullet("Dual-email reminder scheduler (12h + 1h before events) with idempotent delivery via node-cron."),
        bullet("Automated cutoff: events archive themselves 12 hours after start, keeping the home page fresh."),
        bullet("Past Events Archive accessible to all users; enhanced view for Master Admins."),
        bullet("Merchandise section (Coming Soon) built with glassmorphism aesthetics and shimmer animations."),
        bullet("Native Android APK via Capacitor — same codebase, zero duplication."),
        bullet("Google AdSense integration: fluid grid ads (every 6th card) and contextual detail page ads."),
        bullet("SEO-optimized: dynamic meta tags, Open Graph tags, and semantic HTML per event page."),
        bullet("Glassmorphism UI, skeleton loaders, toast notifications, FAB, micro-animations — fully mobile-first, scaling to 4K."),
        pageBreak()
    ];
}

function s2() {
    return [
        h1("2. Introduction & Background"),
        h2("2.1 What is Yakshagana?"),
        body("Yakshagana is a classical theatre form originating in the coastal districts of Karnataka (Dakshina Kannada, Udupi, Uttara Kannada) and Kasaragod in Kerala. Blending dance, music, dialogue, elaborate costumes, and face paint, it is among India's richest performing arts traditions. Performances depict Puranic narratives (Prasangas) from the Mahabharata, Ramayana, and Bhagavata, performed by troupes (Melas) in outdoor venues from dusk to dawn.", { justify: true }),
        spacer(80),
        body("The three principal styles (Thittus) are:"),
        bullet("Thenku (Southern) — energetic, rapid, percussive movements; dominates the southern coastal belt."),
        bullet("Badagu (Northern) — majestic cadence, elaborate headdresses and costumes; northern districts."),
        bullet("Bada-Badagu (Hybrid) — synthesizes elements of both, spanning the transitional geographic zone."),
        spacer(100),
        h2("2.2 The Problem Statement"),
        body("Despite its cultural richness, Yakshagana's event ecosystem was entirely pre-digital. Announcements lived in temporary social media posts, local newspapers, and community WhatsApp groups. There was no:"),
        bullet("Centralized listing of upcoming events across the coastal belt."),
        bullet("Map-based geographic discovery of events near the user."),
        bullet("Automated, reliable reminder system for saved events."),
        bullet("Structured submission and moderation workflow for organizers and admins."),
        bullet("Digital archive of past performances for cultural reference."),
        bullet("Platform-level accountability for admin actions or contributor recognition."),
        spacer(100),
        h2("2.3 Project Genesis"),
        body("Aisira was conceived and developed by Pratham Rai in partnership with Antigravity AI as a 'Premium Digital Experience' — a platform whose quality reflects the reverence owed to the art form it represents. The result is a production-grade SPA with native mobile support, automated backend systems, leaderboard infrastructure, and monetization built in from day one.", { justify: true }),
        pageBreak()
    ];
}

function s3() {
    return [
        h1("3. Project Objectives & Success Metrics"),
        h2("3.1 Primary Objectives"),
        bullet("Centralize event discovery into a single authoritative platform with smart sorting, multi-dimensional filtering, and map-based exploration."),
        bullet("Automate user engagement via dual-email reminders without any manual intervention."),
        bullet("Enable quality-controlled content via a multi-tier admin moderation system with full audit trail."),
        bullet("Preserve cultural history through a structured, searchable Past Events Archive."),
        bullet("Support native mobile access via Capacitor-generated Android APK."),
        spacer(80),
        h2("3.2 Secondary Objectives"),
        bullet("Reduce organizer friction with auto-coordinate resolution from Google Maps URLs."),
        bullet("Surface platform accountability through admin audit trails, leaderboards, and contributor rankings."),
        bullet("Generate sustainable revenue through Google AdSense integration."),
        bullet("Maximize discoverability via SEO-optimized pages with dynamic meta tags and Open Graph support."),
        bullet("Deliver a premium UI aesthetic (glassmorphism, micro-animations, skeleton loaders) that rivals commercial event platforms."),
        spacer(100),
        h2("3.3 Success Metrics"),
        spacer(60),
        makeTable(
            ["Objective", "Metric", "Status"],
            [
                ["Event Discovery", "Map + grid with real-time tri-field search", "Achieved"],
                ["Smart Sorting", "3 sort modes (Earliest, Latest, A-Z)", "Achieved"],
                ["Advanced Filtering", "Thittu filter + Date range (Today/Week/Month)", "Achieved"],
                ["Stat Cards", "3 live counters (events, thittus, locations)", "Achieved"],
                ["Google One-Tap Auth", "Profile sync (name + picture)", "Achieved"],
                ["3-Tier RBAC", "User / Admin / Master Admin enforced server-side", "Achieved"],
                ["Auto-Coordinate", "GPS from Google Maps URL (short + full)", "Achieved"],
                ["Multi-Poster Upload", "Array of Cloudinary URLs per event", "Achieved"],
                ["Dual Reminders", "12h + 1h emails, idempotent delivery", "Achieved"],
                ["Auto Cutoff", "Events archive 12h after start", "Achieved"],
                ["Admin Audit Trail", "Per-event action log with admin identity", "Achieved"],
                ["Leaderboard", "Admin performance + contributor rankings", "Achieved"],
                ["AdSense", "Fluid grid ads (every 6th) + detail ads", "Achieved"],
                ["SEO", "Dynamic meta + Open Graph per event", "Achieved"],
                ["Android APK", "Capacitor native build", "Achieved"],
                ["Merchandise Section", "Glassmorphism Coming Soon UI", "Achieved"],
            ],
            [3600, 3560, 2200]
        ),
        pageBreak()
    ];
}

function s4() {
    return [
        h1("4. Technical Stack & Architecture"),
        h2("4.1 Frontend"),
        makeTable(
            ["Technology", "Role", "Rationale"],
            [
                ["Vite", "Build Tool / Dev Server", "Instant HMR; optimized Rollup bundles; fastest cold-start in class"],
                ["Vanilla JavaScript", "Core SPA Language", "Zero framework overhead; full DOM control; smallest runtime footprint"],
                ["Custom CSS", "Styling Engine", "Glassmorphism, gradients, keyframe animations — unrestricted by framework conventions"],
                ["Leaflet.js", "Interactive Maps", "Open-source; 42KB gzipped; no per-tile API billing"],
                ["OpenStreetMap", "Map Tile Provider", "Free community tiles; global coverage; no rate limits"],
                ["Capacitor", "Native Mobile Bridge", "Wraps the same SPA build as a native Android WebView APK; no separate codebase"],
                ["Google AdSense", "Monetization Scripts", "Async-loaded ad units; fluid and contextual formats"],
            ],
            [2000, 2600, 4760]
        ),
        spacer(100),
        h2("4.2 Backend"),
        makeTable(
            ["Technology", "Role", "Rationale"],
            [
                ["Node.js", "Runtime", "Non-blocking I/O; ideal for cron-driven, event-heavy, concurrent workloads"],
                ["Express.js", "Web Framework", "Minimal, flexible; rich middleware ecosystem; battle-tested in production"],
                ["Mongoose", "MongoDB ODM", "Schema validation, indexing helpers, population queries"],
                ["node-cron", "Job Scheduler", "In-process cron for 15-min reminder polling; no external queue dependency at current scale"],
                ["Nodemailer", "Email Dispatch", "SMTP-based transactional email; pluggable transport for future SendGrid migration"],
                ["jsonwebtoken", "Auth Tokens", "Stateless JWT; role claims embedded; RS256-compatible"],
                ["bcryptjs", "Password Hashing", "Retained for any fallback credential flows; salted adaptive hashing"],
            ],
            [2000, 2200, 5160]
        ),
        spacer(100),
        h2("4.3 Cloud & Third-Party Services"),
        makeTable(
            ["Service", "Purpose", "Notes"],
            [
                ["MongoDB Atlas", "Cloud Database", "Managed NoSQL; replica sets; Atlas Search available on upgrade"],
                ["Cloudinary", "Media Storage & CDN", "Multi-poster uploads; WebP auto-conversion; CDN delivery"],
                ["Firebase Hosting", "Frontend Deployment", "Global CDN; auto HTTPS; cache invalidation on deploy"],
                ["Render", "Backend Deployment", "Managed Node.js; auto-deploy on git push; zero-downtime rolling"],
                ["Google OAuth 2.0", "Authentication", "One-Tap Login; profile picture & display name sync"],
                ["Google AdSense", "Monetization", "Fluid ads in event grid; contextual ads on detail pages"],
            ],
            [2400, 2760, 4200]
        ),
        spacer(100),
        h2("4.4 Architecture Overview"),
        bullet("SPA on Firebase CDN communicates with the backend exclusively via RESTful JSON APIs over HTTPS."),
        bullet("Express.js backend on Render handles all auth, business logic, database queries, and background jobs."),
        bullet("MongoDB Atlas is accessible only from the backend — no direct client-to-database connections."),
        bullet("Cloudinary manages all media; CDN URLs are stored in MongoDB and referenced by the frontend."),
        bullet("Capacitor wraps the same SPA build into a native Android WebView, sharing all code with no duplication."),
        bullet("AdSense scripts are loaded client-side with async defer, preventing main-thread blocking."),
        pageBreak()
    ];
}

function s5() {
    return [
        h1("5. Core Event Discovery — Home Page"),
        body("The home page is the primary surface of Aisira and is engineered to surface the right event to the right user instantly. It balances information density with visual elegance, using a premium card grid overlaid on a real-time interactive Leaflet.js map.", { justify: true }),
        spacer(80),
        h2("5.1 Dynamic Event Grid"),
        body("Upcoming approved events render in a responsive card grid. Each card presents:"),
        bullet("Event poster thumbnail served via Cloudinary CDN with lazy loading."),
        bullet("Prasanga (story title), Troupe name, formatted date/time, and venue."),
        bullet("Color-coded Thittu style badge (Thenku / Badagu / Bada-Badagu)."),
        bullet("'Today's Event' badge for events occurring on the current calendar date."),
        bullet("Save Reminder button (for logged-in users) — one-tap to register for dual email alerts."),
        bullet("Fade-in-up micro-animation, staggered across the grid for a living, kinetic feel."),
        spacer(100),
        h2("5.2 Smart Sorting"),
        makeTable(
            ["Sort Mode", "Sort Logic", "Default?"],
            [
                ["Earliest First", "Ascending by Date then Time — soonest event at top", "Yes"],
                ["Latest First", "Descending by Date then Time — furthest events at top", "No"],
                ["Prasanga (A-Z)", "Alphabetical sort by story title", "No"],
            ],
            [2800, 4760, 1800]
        ),
        spacer(100),
        h2("5.3 Advanced Filtering"),
        h3("5.3.1 Real-Time Search"),
        body("A search bar applies instant client-side filtering across three fields simultaneously — Prasanga Name, Troupe Name, and Location/Venue. Search is debounced to prevent excessive re-renders while maintaining snappy response. All three filters compose: a user can combine search text, Thittu style, and a date range simultaneously."),
        spacer(80),
        h3("5.3.2 Thittu Filter"),
        bullet("Filter chips for Thenku, Badagu, and Bada-Badagu — single or multi-select."),
        bullet("Active chips display with the Yakshagana Orange background and white text."),
        spacer(80),
        h3("5.3.3 Date Range Quick Filters"),
        bullet("Today: Events whose date matches the current calendar date."),
        bullet("This Week: Events within the next 7 days from today."),
        bullet("This Month: Events within the current calendar month."),
        spacer(100),
        h2("5.4 Event Status Indicators"),
        bullet("'Today's Event' badge: Orange pill badge on any card whose date matches today's date — immediately visible without reading the date field."),
        bullet("Thittu badges: Color-coded style indicators (Thenku: warm amber; Badagu: deep blue; Bada-Badagu: teal) on every card for at-a-glance classification."),
        spacer(100),
        h2("5.5 Live Stat Cards"),
        makeTable(
            ["Stat Card", "Data Displayed", "Update Behaviour"],
            [
                ["Upcoming Events", "Total count of approved, non-past events", "Recomputed on each page load"],
                ["Active Thittus", "Count of distinct Thittu styles in upcoming events", "Reflects current filter state"],
                ["Active Locations", "Count of distinct venue locations in upcoming events", "Reflects current filter state"],
            ],
            [2800, 3960, 2600]
        ),
        pageBreak()
    ];
}

function s6() {
    return [
        h1("6. User Authentication & Role-Based Access"),
        h2("6.1 Google One-Tap Login"),
        body("Aisira uses Google OAuth 2.0 One-Tap as its exclusive authentication mechanism, eliminating traditional username/password flows. This provides:"),
        bullet("Frictionless onboarding — users sign in with an existing Google account in a single tap; no registration form."),
        bullet("Automatic profile sync — display name and Google profile picture are stored and displayed across the platform."),
        bullet("Verified emails — sourced directly from Google, ensuring reminder emails reach a valid inbox."),
        bullet("Security by delegation — password management, 2FA, and breach detection are handled by Google's infrastructure."),
        spacer(100),
        h2("6.2 Role-Based Access Control (RBAC)"),
        makeTable(
            ["Role", "Permissions", "Assigned By"],
            [
                ["User", "Browse events • Submit new events • Save reminders • Receive email alerts", "Default on registration"],
                ["Admin", "All User permissions • Approve events • Reject (with reason) • Edit event details • Manage pending/batch queue", "Master Admin promotes"],
                ["Master Admin", "All Admin permissions • Global stats • Audit logs • Admin leaderboard • Contributor rankings • Promote/demote Admins", "Hardcoded / designated"],
            ],
            [1800, 5360, 2200]
        ),
        spacer(100),
        h2("6.3 JWT Session Management"),
        bullet("On successful Google OAuth callback, the backend issues a signed JWT containing the user's ID, email, and role."),
        bullet("Token is stored client-side and sent as Authorization: Bearer on all authenticated API requests."),
        bullet("Server-side middleware verifies signature and expiry on every protected route before processing."),
        bullet("Role embedded in the token is the server-side source of truth — client-side role claims are never trusted."),
        spacer(100),
        h2("6.4 Floating Action Button (FAB)"),
        body("A persistent '+' FAB appears on every page for logged-in users, providing one-tap access to the event submission form from anywhere in the application. Positioned in the bottom-right corner for natural one-thumb access. On first load, a subtle pulse animation draws attention to the FAB for new users.", { justify: true }),
        pageBreak()
    ];
}

function s7() {
    return [
        h1("7. Event Submission & Management"),
        h2("7.1 Smart Submission Form"),
        bullet("Guided field order: date/time first, then venue, story details, and poster — mirrors the organizer's mental model."),
        bullet("Client-side validation on all required fields with inline error messaging before submission."),
        bullet("Prevents submission of past dates, empty poster arrays, or malformed map URLs."),
        spacer(100),
        h2("7.2 Google Maps Auto-Coordinate Resolution"),
        body("A proprietary backend service eliminates the most error-prone step in event submission: GPS coordinate entry.", { justify: true }),
        spacer(60),
        h3("How It Works"),
        bullet("Organizer pastes any Google Maps link — full URL (maps.google.com/...) or shortened (maps.app.goo.gl/...)."),
        bullet("Backend follows the HTTP redirect chain programmatically to resolve the final destination URL."),
        bullet("Precision regex extracts embedded latitude/longitude from the resolved URL (e.g., @12.9716,77.5946,15z pattern)."),
        bullet("Extracted coordinates are stored directly in the Event document and used to place the Leaflet.js map pin."),
        bullet("If resolution fails, the system returns a descriptive error prompting the organizer to check the URL."),
        spacer(60),
        body("A live Leaflet.js map preview renders the resolved coordinates in real time during submission, giving the organizer immediate visual confirmation before they submit the form.", { italics: true }),
        spacer(100),
        h2("7.3 Multi-Poster Image Management"),
        bullet("Organizers can upload multiple promotional posters per event (front-of-house, social media variant, etc.)."),
        bullet("Uploads handled server-side via the Cloudinary Node.js SDK — API credentials never exposed to the browser."),
        bullet("Cloudinary applies automatic format optimization (WebP where supported) and responsive resizing transforms."),
        bullet("All poster URLs stored as an array in the Event document; rendered as a swipeable gallery on the event detail page."),
        spacer(100),
        h2("7.4 Approval Workflow States"),
        makeTable(
            ["State", "Public Visibility", "Triggered By"],
            [
                ["Pending", "Admin panel only", "Automatic on submission"],
                ["Approved", "Fully public — home page, map, search", "Admin action"],
                ["Rejected", "Not public; submitter sees reason", "Admin action with required reason field"],
                ["Reverted", "Returns to Pending for re-review", "Admin action on a previously approved event"],
                ["Past", "Master Admin archive; general Past Archive", "Automatic 12h after event start time"],
            ],
            [2000, 3760, 3600]
        ),
        pageBreak()
    ];
}

function s8() {
    return [
        h1("8. Admin Control Center"),
        body("The Admin Control Center is the operational backbone of Aisira. It provides admins with content quality tooling and gives Master Admins deep platform visibility and accountability features.", { justify: true }),
        spacer(80),
        h2("8.1 Centralized Real-Time Dashboard"),
        body("Four live stat cards update on every panel load:"),
        bullet("Total Pending — events awaiting admin review."),
        bullet("Total Approved — publicly visible events."),
        bullet("Total Rejected — events that did not pass moderation."),
        bullet("Total Events (All Time) — cumulative submission count across all statuses."),
        spacer(100),
        h2("8.2 Batch Management Tabs"),
        body("A tabbed interface separates events by status (Pending / Approved / Rejected / Past), enabling admins to switch context without page navigation. Each tab renders a compact admin card with key metadata and inline action buttons, supporting rapid sequential triage of the pending queue.", { justify: true }),
        spacer(100),
        h2("8.3 Admin Audit Trail (Master Admin Only)"),
        body("Every moderation action is logged with full identity and timestamp:"),
        bullet("The identity of the admin who performed the action (name + Google profile picture)."),
        bullet("Action type: Approved, Rejected, or Reverted."),
        bullet("Timestamp of the action."),
        bullet("The rejection reason (where applicable)."),
        body("Master Admins can view the complete audit trail for any event, enabling accountability and dispute resolution without ambiguity.", { italics: true }),
        spacer(100),
        h2("8.4 Leaderboard (Master Admin Only)"),
        h3("8.4.1 Admin Performance Ranking"),
        body("Ranks all Admin and Master Admin users by moderation activity:"),
        bullet("Total Approvals — count of events approved by the admin."),
        bullet("Total Rejections — count of events rejected by the admin."),
        bullet("Combined Activity Score — sum of approvals and rejections; primary ranking metric."),
        spacer(60),
        h3("8.4.2 Contributor Ranking"),
        body("Ranks all registered users by total events submitted to the platform, incentivizing organizers to use Aisira as their primary submission channel."),
        spacer(60),
        body("Both leaderboards display profile pictures, names, and counters in a ranked table. Visible exclusively to Master Admins to prevent competitive distortion among the user base.", { italics: true }),
        pageBreak()
    ];
}

function s9() {
    return [
        h1("9. Specialized Content & Mobile Support"),
        h2("9.1 Past Events Archive"),
        bullet("Events automatically transition to 'Past' status 12 hours after their scheduled start time via backend cutoff logic."),
        bullet("Removed from the public home page grid and map to keep listings fresh."),
        bullet("Any user can browse the Past Events Archive, with the same search/filter controls as the main grid."),
        bullet("Master Admins have an enhanced archive view in the Admin Control Center with submission metadata and moderation history."),
        spacer(100),
        h2("9.2 Merchandise Section (Coming Soon)"),
        bullet("Built into the platform's navigation to build brand anticipation before launch."),
        bullet("Styled in full glassmorphism — frosted glass product preview cards with orange accents."),
        bullet("Shimmer animation on Coming Soon placeholders communicates exclusivity without a broken experience."),
        bullet("Email capture / waitlist integration planned for the merchandise launch phase."),
        spacer(100),
        h2("9.3 Native Android App via Capacitor"),
        body("Aisira runs as a native Android application through Capacitor — Ionic's open-source native runtime that wraps web apps as native mobile apps.", { justify: true }),
        spacer(60),
        h3("9.3.1 How Capacitor Works"),
        bullet("The same Vite SPA build that powers the web is loaded inside Capacitor's native Android WebView."),
        bullet("Capacitor's JavaScript bridge provides access to native device APIs (camera, file system, push notifications) where needed."),
        bullet("APK built via Android Studio with Capacitor's native layer; distributable via Play Store or direct APK sideload."),
        bullet("Every web platform update ships to Android simultaneously — no separate maintenance branch."),
        spacer(60),
        h3("9.3.2 Mobile-Specific Optimisations"),
        bullet("Meta viewport: width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no — prevents unintended pinch-zoom in the native WebView."),
        bullet("Touch-optimized Leaflet.js map markers and filter controls for finger-first interaction."),
        bullet("FAB positioned bottom-right for natural one-thumb access on all mobile viewport sizes."),
        bullet("Skeleton loaders prevent layout shift during data fetches on slower mobile connections."),
        pageBreak()
    ];
}

function s10() {
    return [
        h1("10. Monetization & SEO"),
        h2("10.1 Google AdSense Integration"),
        body("Aisira monetizes its audience through Google AdSense, integrated to balance revenue with user experience — ads are present but never intrusive.", { justify: true }),
        spacer(80),
        h3("10.1.1 Fluid Ads — Event Grid"),
        bullet("Every 6th item in the event card grid is a responsive AdSense Fluid Ad unit."),
        bullet("The ad unit matches the card's dimensions and border-radius, integrating visually with the grid without layout shifts."),
        bullet("Fluid format: Google's algorithm selects the optimal ad format based on the slot's rendered dimensions."),
        spacer(80),
        h3("10.1.2 Contextual Ads — Event Detail Pages"),
        bullet("A dedicated AdSense unit positioned below the event's primary content on every detail page."),
        bullet("Contextual targeting: Google serves ads relevant to the event's location, cultural content, or user browsing profile."),
        bullet("Positioned to avoid interfering with the core event discovery or reminder-saving experience."),
        spacer(100),
        h2("10.2 SEO Optimization"),
        h3("10.2.1 Dynamic Meta Tags"),
        bullet("Title tag: '[Prasanga] by [Troupe] | Aisira' — unique and descriptive per event."),
        bullet("Meta description: Auto-generated from event description, venue, and date — within Google's 155-character guideline."),
        bullet("Open Graph (og:title, og:image, og:description): Rich social media preview cards when links are shared on WhatsApp or Facebook."),
        spacer(80),
        h3("10.2.2 Semantic HTML"),
        bullet("Event listings use HTML5 semantic elements (article, section, time, address) for clear document structure."),
        bullet("Image alt attributes populated from event metadata for screen reader and crawler accessibility."),
        bullet("Unique URL paths per event (/#/event/[id]) enable shareable, deep-linkable event pages."),
        spacer(80),
        h3("10.2.3 Core Web Vitals"),
        makeTable(
            ["Core Web Vital", "Optimization Applied"],
            [
                ["LCP (Largest Contentful Paint)", "Cloudinary CDN + WebP delivers optimized poster images; Firebase CDN serves SPA assets from edge nodes closest to the user."],
                ["INP (Interaction to Next Paint)", "Vite's optimized bundle minimizes JS parse time; async defer on AdSense scripts prevents main-thread blocking."],
                ["CLS (Cumulative Layout Shift)", "Skeleton loaders reserve correct card dimensions before data loads, eliminating layout shift during API fetches."],
            ],
            [3000, 6360]
        ),
        pageBreak()
    ];
}

function s11() {
    return [
        h1("11. Backend Architecture & Data Models"),
        h2("11.1 RESTful API Design"),
        makeTable(
            ["Endpoint", "Method", "Auth", "Description"],
            [
                ["/api/events", "GET", "Public", "All approved, non-past events"],
                ["/api/events", "POST", "User", "Submit new event (enters Pending)"],
                ["/api/events/:id", "GET", "Public", "Single event detail"],
                ["/api/events/:id/approve", "PATCH", "Admin", "Approve a pending event"],
                ["/api/events/:id/reject", "PATCH", "Admin", "Reject with mandatory reason"],
                ["/api/events/:id/revert", "PATCH", "Admin", "Revert approved to Pending"],
                ["/api/events/:id", "PUT", "Admin", "Edit event details"],
                ["/api/admin/pending", "GET", "Admin", "All pending events"],
                ["/api/admin/past", "GET", "Master Admin", "All past-archived events"],
                ["/api/admin/stats", "GET", "Admin", "Real-time dashboard counters"],
                ["/api/admin/audit/:id", "GET", "Master Admin", "Audit trail for a specific event"],
                ["/api/admin/leaderboard", "GET", "Master Admin", "Admin performance + contributor rankings"],
                ["/api/auth/google", "POST", "Public", "Google OAuth callback; issues JWT"],
                ["/api/users/me", "GET", "User", "Current user profile"],
                ["/api/users/save-reminder", "POST", "User", "Save event reminder"],
                ["/api/users/saved", "GET", "User", "User's saved events"],
                ["/api/resolve-map", "POST", "User", "Auto-resolve Maps URL to coordinates"],
                ["/api/admin/promote", "PATCH", "Master Admin", "Promote user to Admin"],
                ["/api/admin/demote", "PATCH", "Master Admin", "Demote Admin to User"],
            ],
            [2800, 1200, 1960, 3400]
        ),
        spacer(100),
        h2("11.2 User Model"),
        makeTable(
            ["Field", "Type", "Description"],
            [
                ["_id", "ObjectId", "MongoDB auto-generated primary key"],
                ["googleId", "String (unique)", "Google OAuth subject identifier"],
                ["name", "String", "Display name synced from Google profile"],
                ["email", "String (unique)", "Google-verified email; reminder dispatch target"],
                ["profilePicture", "String", "Google profile picture URL"],
                ["role", "Enum", "user | admin | masterAdmin"],
                ["savedReminders", "Array<ObjectId>", "Event IDs saved for reminder"],
                ["sentReminders", "Map<String,Object>", "{ eventId: { sent12h: Bool, sent1h: Bool } }"],
                ["submittedEvents", "Array<ObjectId>", "Events submitted (used for contributor leaderboard)"],
                ["createdAt", "Date", "Account creation timestamp"],
            ],
            [2400, 2400, 4560]
        ),
        spacer(80),
        h2("11.3 Event Model"),
        makeTable(
            ["Field", "Type", "Description"],
            [
                ["_id", "ObjectId", "MongoDB auto-generated primary key"],
                ["prasanga", "String", "Story/narrative title"],
                ["troupe", "String", "Performing troupe name"],
                ["thittu", "Enum", "Thenku | Badagu | Bada-Badagu"],
                ["date", "Date", "Scheduled performance date"],
                ["time", "String", "Start time (local)"],
                ["venue", "String", "Venue name and description"],
                ["mapLink", "String", "Original Google Maps URL (raw input)"],
                ["latitude", "Number", "GPS latitude — auto-resolved"],
                ["longitude", "Number", "GPS longitude — auto-resolved"],
                ["description", "String", "Long-form event description"],
                ["posterUrls", "Array<String>", "Cloudinary CDN URLs for all uploaded posters"],
                ["status", "Enum", "pending | approved | rejected | past"],
                ["rejectionReason", "String", "Admin's written rejection justification"],
                ["approvedBy", "ObjectId", "Ref: User — admin who approved (audit trail)"],
                ["rejectedBy", "ObjectId", "Ref: User — admin who rejected (audit trail)"],
                ["actionTimestamp", "Date", "Timestamp of last admin action"],
                ["submittedBy", "ObjectId", "Ref: submitting User (contributor leaderboard)"],
                ["createdAt", "Date", "Submission timestamp"],
            ],
            [2400, 2000, 4960]
        ),
        pageBreak()
    ];
}

function s12() {
    return [
        h1("12. Security Implementation"),
        h2("12.1 Authentication Security"),
        bullet("Google OAuth 2.0 eliminates platform-managed passwords — the single largest source of credential breaches."),
        bullet("JWT tokens are signed with a long, randomly generated secret stored exclusively as a Render environment variable."),
        bullet("Tokens have a defined expiry; expired tokens are rejected by middleware with HTTP 401."),
        bullet("The role claim inside the JWT is validated server-side on every request — clients cannot self-elevate privileges."),
        spacer(100),
        h2("12.2 Middleware Guard Architecture"),
        makeTable(
            ["Middleware", "Scope", "Behaviour on Failure"],
            [
                ["auth", "All protected routes", "401 Unauthorized — missing or invalid/expired JWT"],
                ["adminOnly", "Admin-tier endpoints", "403 Forbidden — role is 'user'"],
                ["masterAdminOnly", "Master Admin-tier endpoints", "403 Forbidden — role is 'user' or 'admin'"],
            ],
            [2400, 3360, 3600]
        ),
        spacer(100),
        h2("12.3 Environment & Secret Management"),
        bullet("All secrets (MongoDB URI, JWT secret, Cloudinary keys, Google OAuth credentials, SMTP password) stored in .env files, excluded via .gitignore."),
        bullet("Production secrets configured as environment variables in Render and Firebase dashboards — never hardcoded."),
        bullet("Cloudinary uploads handled server-side only; the API secret is never transmitted to the browser."),
        spacer(100),
        h2("12.4 Network & Data Security"),
        bullet("All API traffic encrypted via HTTPS enforced by both Firebase Hosting and Render — no HTTP fallback."),
        bullet("CORS configured to whitelist only the Firebase Hosting domain — unauthorized origins receive 403."),
        bullet("MongoDB Atlas provides IP allowlisting, restricting database access to Render's outbound IPs."),
        bullet("Input validation enforced server-side on all event submission fields — client-side validation is treated as UX, not security."),
        spacer(100),
        h2("12.5 AdSense Script Security"),
        bullet("AdSense scripts loaded from Google's CDN with async defer attributes — no main-thread blocking."),
        bullet("Firebase Hosting CSP headers can restrict unauthorized script execution at the network level."),
        pageBreak()
    ];
}

function s13() {
    return [
        h1("13. UI/UX Design System & Micro-Details"),
        h2("13.1 Design Philosophy"),
        body("Aisira's design principle is 'Premium by Default' — every visual decision conveys that Yakshagana deserves a digital home as refined as the art itself. The visual language rests on three pillars: drama (dark backgrounds, bold orange), depth (glassmorphism layers), and life (micro-animations).", { justify: true }),
        spacer(100),
        h2("13.2 Color System"),
        makeTable(
            ["Token", "Hex", "Usage"],
            [
                ["Yakshagana Orange", "#E8751A", "Primary CTAs, active badges, borders, glow effects, FAB pulse"],
                ["Deep Dark", "#0F0F14", "Primary page and component backgrounds"],
                ["Dark Surface", "#1A1A2E", "Cards, panels, admin tables, navigation"],
                ["Deep Navy", "#16213E", "Secondary surfaces, heading text"],
                ["Body Text", "#CCCCCC", "Primary readable content on dark backgrounds"],
                ["Muted Text", "#888888", "Metadata, captions, timestamps"],
                ["Success Green", "#2ECC71", "Approved status badge, positive toast notifications"],
                ["Error Red", "#E74C3C", "Rejected status badge, error toast notifications"],
                ["Warning Amber", "#F39C12", "Pending status badge, caution states"],
            ],
            [2600, 1800, 4960]
        ),
        spacer(100),
        h2("13.3 Glassmorphism Implementation"),
        bullet("backdrop-filter: blur(12px) — frosted glass effect over the dark background layer."),
        bullet("background: rgba(26, 26, 46, 0.7) — semi-transparent surface revealing the layer beneath."),
        bullet("border: 1px solid rgba(232, 117, 26, 0.2) — subtle orange perimeter reinforcing the brand."),
        bullet("box-shadow: 0 4px 24px rgba(0,0,0,0.4) — depth separation from the background."),
        body("Applied to: event cards, modals, the navigation header, admin panels, and the Merchandise section's product previews."),
        spacer(100),
        h2("13.4 Micro-Animations"),
        makeTable(
            ["Animation", "Element", "Implementation"],
            [
                ["Fade-In-Up", "Every event card and list item", "CSS @keyframes; translateY(20px)→0 + opacity 0→1; staggered delay per card index"],
                ["Hover Lift", "Interactive cards", "transform: translateY(-4px) on :hover; 0.25s ease transition"],
                ["Button Glow", "Primary CTA buttons", "box-shadow: 0 0 16px rgba(232,117,26,0.5) on :hover"],
                ["Shimmer", "Skeleton loaders + Merch section", "CSS linear-gradient animation left-to-right; 1.5s infinite loop"],
                ["Toast Slide-In", "Success/error notifications", "Slide in from bottom-right; auto-dismiss after 3 seconds"],
                ["FAB Pulse", "Floating Action Button", "Subtle scale pulse on first load; draws attention for new users"],
            ],
            [2400, 3000, 4000]
        ),
        spacer(100),
        h2("13.5 Skeleton Loading"),
        bullet("Card Skeletons: Placeholder cards matching event card dimensions render immediately on page load."),
        bullet("Detail Page Skeleton: Layout skeleton (poster area, text blocks, map area) renders while API call resolves."),
        bullet("Admin Table Skeleton: Row-shaped skeletons prevent layout shift when the event list loads."),
        bullet("All skeletons animated with the shimmer effect — provides visual feedback that data is loading, not broken."),
        spacer(100),
        h2("13.6 Toast Notification System"),
        bullet("Non-intrusive notifications appear bottom-right for all user-facing actions."),
        bullet("Color-coded: green (success), red (error), amber (warning), blue (informational)."),
        bullet("Auto-dismiss after 3 seconds; can be manually dismissed by clicking."),
        bullet("Multiple toasts stack vertically with spacing — no overlap."),
        spacer(100),
        h2("13.7 Responsive Breakpoints"),
        makeTable(
            ["Breakpoint", "Viewport", "Key Layout Behaviour"],
            [
                ["Mobile S", "< 380px", "Single column; reduced padding; compact FAB"],
                ["Mobile", "380px – 480px", "Single column; full-width cards; bottom sheet filters"],
                ["Tablet", "480px – 768px", "2-column grid; inline filter chips; split map/list option"],
                ["Desktop", "768px – 1280px", "3-column grid; persistent filter sidebar; hover interactions"],
                ["4K / Wide", "1280px+", "4-column grid; max card width capped; centered layout"],
            ],
            [1800, 2560, 4800]
        ),
        pageBreak()
    ];
}

function s14() {
    return [
        h1("14. Deployment, DevOps & Performance"),
        h2("14.1 Deployment Architecture"),
        makeTable(
            ["Component", "Platform", "Key Attributes"],
            [
                ["Frontend SPA", "Firebase Hosting", "Global CDN; auto HTTPS; cache invalidation on deploy; custom domain"],
                ["Backend API", "Render", "Managed Node.js; auto-deploy on git push; zero-downtime rolling updates"],
                ["Database", "MongoDB Atlas", "Managed NoSQL; automated daily backups; replica sets"],
                ["Media Storage", "Cloudinary", "CDN poster delivery; WebP transforms; usage-based billing"],
                ["Android App", "Capacitor APK", "Android Studio build; Play Store or direct APK distribution"],
            ],
            [2400, 2560, 4400]
        ),
        spacer(100),
        h2("14.2 CI/CD Pipeline"),
        bullet("All code maintained in a Git repository with a protected main branch."),
        bullet("Frontend: Firebase CLI auto-builds (vite build) and deploys the dist/ output on every push to main."),
        bullet("Backend: Render pulls, installs, and restarts the Node.js process on every push to main — zero manual steps."),
        bullet("Zero-downtime: Render's rolling deployment strategy keeps the backend available during redeploys."),
        spacer(100),
        h2("14.3 Frontend Performance"),
        bullet("Vite's Rollup bundler: tree-shaking, code splitting, and minification produce a compact production bundle."),
        bullet("Firebase CDN serves static assets from the closest edge node — fast first contentful paint globally."),
        bullet("Cloudinary WebP conversion minimizes image transfer size — typically the largest page weight component."),
        bullet("Skeleton loaders prevent CLS — a Core Web Vitals metric that directly affects Google search ranking."),
        spacer(100),
        h2("14.4 Backend Performance"),
        bullet("MongoDB Atlas indexes on status, date, latitude, longitude — sub-millisecond queries for the most frequent access patterns."),
        bullet("Async/await throughout: the Node.js event loop is never blocked by database or external API operations."),
        bullet("node-cron reminder job uses a selective query (only users with savedReminders) — efficient regardless of total user count."),
        spacer(100),
        h2("14.5 Scalability Path"),
        makeTable(
            ["Component", "Current", "Scaling Path"],
            [
                ["Database", "MongoDB Atlas M0", "Upgrade to M10/M20; enable Atlas Search; add sharding for global scale"],
                ["Backend", "Single Render instance", "Render horizontal scaling; or migrate to Railway/Fly.io multi-region"],
                ["Email", "SMTP (single account)", "Migrate to SendGrid or AWS SES for high-volume deliverability + analytics"],
                ["Cron Jobs", "In-process node-cron", "Migrate to Bull/BullMQ + Redis for distributed, fault-tolerant job queues"],
                ["Mobile", "Capacitor APK (sideload)", "Publish to Google Play Store; add iOS Capacitor build for App Store"],
            ],
            [2200, 3160, 4000]
        ),
        pageBreak()
    ];
}

function s15() {
    return [
        h1("15. Future Roadmap & Conclusion"),
        h2("15.1 Short-Term (v1.1 – v1.2)"),
        bullet("Push Notifications: Web Push API for browser-based event reminders, supplementing email delivery."),
        bullet("WhatsApp Reminder Integration: Event alerts via WhatsApp Business API — the primary communication channel for the Yakshagana audience."),
        bullet("Advanced Full-Text Search: MongoDB text index for searching descriptions and historical events."),
        bullet("User Profile Pages: Personal dashboards showing saved events, reminder history, and submission count."),
        bullet("Post-Event Ratings: Star ratings and audience reviews for historical archival value."),
        bullet("Merchandise Launch: Activation of the Merch section with Aisira-branded products."),
        spacer(100),
        h2("15.2 Medium-Term (v2.0)"),
        bullet("iOS Native App: Capacitor iOS build for App Store distribution — parity with Android."),
        bullet("Ticketing Integration: In-platform ticket purchase via BookMyShow or direct API integration."),
        bullet("Multilingual Support: Kannada-language interface for non-English-speaking community members."),
        bullet("Artist Profiles: Dedicated pages for prominent Veshadhaaris with performance histories and upcoming schedules."),
        bullet("Master Admin Analytics: Visual charts for event volume trends, geographic heatmaps, and user growth."),
        spacer(100),
        h2("15.3 Long-Term (v3.0+)"),
        bullet("Cultural Archive: A curated digital library of Yakshagana recordings, photographs, costume documentation, and historical records — transforming Aisira into a living cultural repository."),
        bullet("Live Streaming: Real-time broadcast integration enabling the global Yakshagana diaspora to experience performances remotely."),
        bullet("AI-Powered Recommendations: ML model trained on user save patterns to surface personalized event suggestions."),
        bullet("Troupe Management Portal: A B2B sub-platform for Yakshagana Melas to manage schedules, fan communications, and merchandise."),
        bullet("Educational Content: Structured content on Yakshagana history, costumes, music, and Prasangas for new audiences discovering the art form through the platform."),
        spacer(120),
        h2("15.4 Conclusion"),
        body("Aisira is not simply an event listing website. It is a full-scale cultural technology platform built with production-grade engineering practices, a clear monetization strategy, and a long-term vision for becoming the definitive digital home of Yakshagana.", { justify: true }),
        spacer(80),
        body("From Google One-Tap authentication and three-tier RBAC to the proprietary Google Maps Auto-Resolver, dual-email scheduler with idempotent delivery, admin audit trail, contributor leaderboard, Capacitor Android APK, AdSense integration, and SEO infrastructure — every feature reflects a deliberate product decision.", { justify: true }),
        spacer(80),
        body("The glassmorphism UI, micro-animations, skeleton loaders, FAB, stat cards, and toast system demonstrate that UX quality was treated with the same rigour as backend correctness. Aisira looks and feels like a premium commercial product — because it is.", { justify: true }),
        spacer(80),
        body("Version 1.0 is a complete, live, revenue-capable platform. The roadmap to v3.0 charts a path toward something rarer still: a technology product that becomes genuinely indispensable to a cultural community — preserving Yakshagana for generations to come.", { justify: true }),
        spacer(200),
        new Paragraph({
            alignment: AlignmentType.CENTER,
            border: { top: { style: BorderStyle.SINGLE, size: 4, color: ORANGE, space: 8 } },
            spacing: { before: 200, after: 80 },
            children: [new TextRun({ text: "Aisira — Preserving Yakshagana for Generations to Come", italics: true, size: 26, font: "Arial", color: HEADING_COLOR })]
        }),
        new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 40, after: 40 }, children: [new TextRun({ text: "Aisira-8bca2.web.app", size: 22, font: "Arial", color: ORANGE })] }),
        new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 40, after: 40 }, children: [new TextRun({ text: "Developed by Pratham Rai in partnership with Antigravity AI  •  May 2026", size: 20, font: "Arial", color: GRAY_TEXT })] }),
    ];
}

// ── ASSEMBLE ─────────────────────────────────────────────────────
const doc = new Document({
    numbering: {
        config: [
            { reference: "bullets", levels: [{ level: 0, format: LevelFormat.BULLET, text: "•", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 720, hanging: 360 }, spacing: { before: 60, after: 60 } } } }] },
            { reference: "subbullets", levels: [{ level: 0, format: LevelFormat.BULLET, text: "◦", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 1080, hanging: 360 }, spacing: { before: 40, after: 40 } } } }] },
        ]
    },
    styles: {
        default: { document: { run: { font: "Arial", size: 22, color: TEXT_DARK } } },
        paragraphStyles: [
            { id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true, run: { size: 38, bold: true, font: "Arial", color: HEADING_COLOR }, paragraph: { spacing: { before: 400, after: 200 }, outlineLevel: 0 } },
            { id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true, run: { size: 28, bold: true, font: "Arial", color: ACCENT2 }, paragraph: { spacing: { before: 280, after: 140 }, outlineLevel: 1 } },
        ]
    },
    sections: [{
        properties: { page: { size: { width: 12240, height: 15840 }, margin: { top: 1440, right: 1260, bottom: 1440, left: 1260 } } },
        headers: {
            default: new Header({
                children: [new Paragraph({
                    border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: ORANGE, space: 4 } },
                    spacing: { before: 0, after: 120 },
                    tabStops: [{ type: TabStopType.RIGHT, position: 9720 }],
                    children: [
                        new TextRun({ text: "Aisira — Comprehensive Project Report", bold: true, size: 18, font: "Arial", color: HEADING_COLOR }),
                        new TextRun({ text: "\tMay 2026", size: 18, font: "Arial", color: GRAY_TEXT })
                    ]
                })]
            })
        },
        footers: {
            default: new Footer({
                children: [new Paragraph({
                    border: { top: { style: BorderStyle.SINGLE, size: 2, color: ORANGE, space: 4 } },
                    spacing: { before: 80, after: 0 },
                    tabStops: [{ type: TabStopType.RIGHT, position: 9720 }],
                    children: [
                        new TextRun({ text: "Confidential  |  Pratham Rai & Antigravity AI", size: 16, font: "Arial", color: GRAY_TEXT }),
                        new TextRun({ text: "\tAisira-8bca2.web.app", size: 16, font: "Arial", color: ORANGE })
                    ]
                })]
            })
        },
        children: [
            ...coverPage(), ...toc(),
            ...s1(), ...s2(), ...s3(), ...s4(), ...s5(),
            ...s6(), ...s7(), ...s8(), ...s9(), ...s10(),
            ...s11(), ...s12(), ...s13(), ...s14(), ...s15(),
        ]
    }]
});

Packer.toBuffer(doc).then(buf => {
    fs.writeFileSync("/mnt/user-data/outputs/Aisira_Project_Report_v2.docx", buf);
    console.log("Done!");
}).catch(e => { console.error(e); process.exit(1); });
