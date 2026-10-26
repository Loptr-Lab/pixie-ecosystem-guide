const guides={
 coordinate:{title:'Join and keep the thread',body:'Prepare a public GitHub checkpoint, review it, and submit it in your chosen project.',action:'Prepare a checkpoint'},
 checkpoint:{title:'Resume across sessions',body:'Bring the GitHub issue URL. I can read the shared record without your earlier chat.',action:'Read a checkpoint'},
 resume:{title:'Find your place',body:'I can help you separate the last reviewed status from what still needs checking.',action:'Show project status'},
 contribute:{title:'Choose one useful task',body:'Tell me how much time you have. I’ll offer one bounded task and show what finished looks like.',action:'Choose available time'},
 feedback:{title:'Make the observation useful',body:'Describe your steps, what you expected, and what happened. I’ll prepare a draft for your review.',action:'Go to the report form'}
};
export function getGuide(mode){return guides[mode]||guides.resume;}
export const pixieDoors=[
 {name:'Find help with Made-Sick and PIXIE',url:'https://pixie-project-companion.ibloud-ivxx.chatgpt.site/#find-help',note:'Source-linked discovery, local enquiry preparation and portable follow-up.'},
 {name:'Start with Loptr Lab training',url:'https://loptr-lab.github.io/training/',note:'Training entry point for our ecosystem.'},
 {name:'Discover worlds',url:'https://50ways.loptrlab.com/pixie/demo/index.html',note:'Public discovery prototype and Story Finder routes.'},
 {name:'Creator workspace',url:'https://ibloud.github.io/pixie-creator-os/',note:'Prepare work locally for manual sharing.'},
 {name:'Practice session',url:'https://ibloud.github.io/pixie-creator-os/session.html',note:'Practice notes and export; no recording connection.'},
 {name:'Creator tools',url:'https://ibloud.github.io/pixie-creator-os/tools.html',note:'Local story and DJ demonstrations.'},
 {name:'Story Finder',url:'https://made-sick.org/story-finder.html',note:'Public-feed discovery; no private mailbox or DMs.'},
 {name:'Holdings',url:'https://holdings.loptrlab.com/',note:'Synthetic economics and stewardship test bench.'},
 {name:'Device stewardship',url:'https://ibloud.github.io/pixie-device-stewardship/',note:'Research and demonstration; no device-file access.'},
 {name:'DUET game help',url:'https://duet.loptrlab.com/',note:'Fixed game-help topics inside DUET; separate game surface.'},
 {name:'Learning pathways',url:'https://ibloud.github.io/tarantula-clone-hero/',note:'Early community learning and practice prototype.'}
];
