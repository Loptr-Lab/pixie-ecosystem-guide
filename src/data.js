export const FOCUS_AREAS = [
  "Development & integration",
  "Games & interactive worlds",
  "Art & design",
  "Storytelling",
  "Accessibility",
  "Consent & privacy",
  "Testing & learning",
  "Community"
];

export const PIXIE_ROLES = [
  {
    id: "discovery",
    name: "Find and explore",
    project: "PIXIE Public Discovery · 50 Ways to Leave Another",
    stage: "Early read-only demo · review pending",
    summary: "Searches public Bluesky posts for a topic, explains why a result appeared, and lets a visitor dismiss it.",
    boundary: "No sign-in, following, posting, replying, or private-data access. Browser testing, result-quality review, and community review remain open.",
    links: [
      { label: "Open the read-only demo", url: "https://50ways.loptrlab.com/pixie/demo/" },
      { label: "Read the pilot status", url: "https://github.com/ibloud/50-ways-to-leave-another/blob/main/docs/pixie-v0.1-pilot.md" },
      { label: "Read about this version", url: "https://ecosystem.loptrlab.com/projects/pixie-discovery/" }
    ]
  },
  {
    id: "creator",
    name: "Make and shape creative work",
    project: "PIXIE Creator OS",
    stage: "Workspace prototype",
    summary: "Prepare mobile activations, promotions or field reports with source context and attribution, then review a manual sharing handoff.",
    boundary: "The sharing choices are previews. Signing in to another service or publishing from this workspace is not connected.",
    links: [
      { label: "Open the workspace", url: "https://ibloud.github.io/pixie-creator-os/" },
      { label: "Read about this version", url: "https://ecosystem.loptrlab.com/projects/pixie-creator/" }
    ]
  },
  {
    id: "device",
    name: "Care for creative files",
    project: "PIXIE Device Stewardship",
    stage: "Research and example",
    summary: "Explore thoughtful ways to name, organize, and return to creative files.",
    boundary: "The example does not look at or change files on your device. Working with real files is a possible future step.",
    links: [
      { label: "Try the example", url: "https://ibloud.github.io/pixie-device-stewardship/" },
      { label: "Read about this version", url: "https://ecosystem.loptrlab.com/projects/pixie-device-stewardship/" }
    ]
  },
  {
    id: "holdings",
    name: "Think through choices",
    project: "PIXIE Holdings",
    stage: "Executable test bench · device review open",
    summary: "Source-reviewed synthetic scenarios explore resource choices and consequences. The focused public page and development archive were retrieved on 18 October 2026.",
    boundary: "The ledger is synthetic. A prepared receipt does not establish a real file operation or payment; device and independent-user acceptance remain open.",
    links: [
      { label: "Read about PIXIE Holdings", url: "https://ecosystem.loptrlab.com/projects/pixie-holdings/" },
      { label: "Check current site status", url: "https://holdings.loptrlab.com/" }
    ]
  },
  {
    id: "duet",
    name: "Help while you play",
    project: "DUET",
    stage: "Small fixed-answer helper in source",
    summary: "The DUET code maps a short list of questions about rules, controls, and accessibility to written answers; it is not a general AI assistant.",
    boundary: "This help is for DUET only. It does not play, choose moves, or connect the other PIXIE projects.",
    links: [
      { label: "Play DUET", url: "https://duet.loptrlab.com/" },
      { label: "Read about this version", url: "https://ecosystem.loptrlab.com/projects/duet/" },
      { label: "See the helper source", url: "https://github.com/Loptr-Lab/duet-solo-hackathon/blob/main/agentScope.js" }
    ]
  },
  {
    id: "read-aloud",
    name: "Explore a read-aloud idea",
    project: "Veiled Dominion · read-aloud code",
    stage: "Code reference",
    summary: "The project includes code for a read-aloud option for a scene and its choices; it is not a live, try-it-here demonstration.",
    boundary: "This is source code, not a complete buildable Unity game. The code does not explain the story or choose for the player; a full accessibility review remains open.",
    links: [
      { label: "View the read-aloud code", url: "https://github.com/Loptr-Lab/veiled-dominion-engine/blob/main/50-ways.html" },
      { label: "Read about this version", url: "https://ecosystem.loptrlab.com/projects/veiled-dominion/" }
    ]
  },
  {
    id: "learning",
    name: "Learn and share with care",
    project: "Loptr Lab training · PIXIE Announcer track",
    stage: "Written learning track",
    summary: "A public guide describes six proposed practice exercises in interface design, voice, accessibility, testing, and integration. It is written training material, not a running PIXIE teaching app.",
    boundary: "The guide is out-of-world. Exercises are not a hiring gate, job promise, or canon authority; work moving to another repository needs that project's approval.",
    links: [
      { label: "Read the PIXIE training track", url: "https://github.com/Loptr-Lab/training/blob/main/docs/PIXIE_ANNOUNCER_TRACK.md" },
      { label: "Explore Kent C. Dodds courses", url: "https://kentcdodds.com/courses" }
    ]
  },
  {
    id: "codex",
    name: "Tell stories and listen",
    project: "PIXIE · Creative Experience Decks",
    stage: "Public development edition",
    summary: "Explore PIXIE's story, two deck concepts, development notes, and optional listening links.",
    boundary: "Concept studies are not finished print files. Physical editions are in development; no orders or support payments are open.",
    links: [
      { label: "Open the Codex site", url: "https://codex.loptrlab.com/" },
      { label: "Read the ecosystem project page", url: "https://ecosystem.loptrlab.com/projects/pixie-codex/" }
    ]
  }
];
