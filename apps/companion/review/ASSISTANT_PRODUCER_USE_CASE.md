# PIXIE assistant producer — owner-confirmed use case

Recorded 14 November 2026. Product direction approved by the owner in the task
conversation; this document does not establish implemented or released features.

## What the owner is building

> PIXIE is my assistant producer. I work in GarageBand on my iPad/iPhone, and my
> producer works in Logic on a Mac. PIXIE helps me understand and follow the
> producer's instructions, work through recording and revision tasks, review
> selected takes for pitch/key and timing issues, and retain context between
> sessions. Human listening decisions remain authoritative.

The owner's devices are iPad/iPhone. The producer's device is a Mac. Requiring
the owner to operate a Mac, reducing the app to file conversion/exchange, or
substituting a generic DAW shopping recommendation does not meet this use case.
GarageBand is the initial DAW choice; Logic is the producer's DAW. PIXIE is the
assistant in the app. Claude/ChatGPT or an MCP client is not PIXIE's product
identity or a required user-facing registration flow.

## Owning sources and existing work

This application module is the primary home for the assistant behavior, project
context and end-to-end acceptance record. Creator OS owns supporting local media
and audio capabilities. The existing [ecosystem architecture](https://github.com/ibloud/ibloud.github.io/blob/main/docs/ECOSYSTEM_ARCHITECTURE.md)
remains authoritative; this use case does not create a competing ecosystem map.

Checked current Companion main (`4bfc0ee`), `AGENTS.md`, `lib/principles.mjs`,
README, helper, project/reference/import workflows and existing Creator handoff;
Creator main (`f968b08`), README, CONTRIBUTING, architecture/stable-prealpha and
artist-workflow records; existing open PRs; and native-audio draft
[Creator PR #64](https://github.com/ibloud/pixie-creator-os/pull/64) at `3c88f79`.
No existing issue or implementation was found for this complete assistant-producer
journey in those reviewed sources. Reuse the project/task/notes, review and
handoff seams. A specific audio-analysis or device integration gap is not
permission to create another app, runtime, database or repository.

Creator's [audio requirements](https://github.com/ibloud/pixie-creator-os/blob/review/native-pixie-audio/docs/artist-workflow.md#assistant-producer-audio-requirements--owner-direction-14-november-2026)
are the linked technical record. Do not duplicate this use case there.

## What exists and what is missing

| Need | Existing reusable work | Missing or unverified for this use case |
| --- | --- | --- |
| Stay with the project | Authorized Companion projects, tasks, notes, sources, checkpoints and reviewed imports in main | A producer-instruction model and guided recording/revision session that persists and resumes the owner's progress. Source presence is not proof of current hosted/client acceptance. |
| Explain and follow instructions | Existing contextual helper and predefined guidance | Integrated assistant-producer conversation and contextual explanations of the producer's actual directions. The helper currently describes itself as guided, not free-form chat. |
| Work with selected audio | Creator OS local media preview, drafts, attribution and reviewed context handoff | End-to-end mobile take selection/review and evidence-linked audio feedback. Existing context messages do not transfer arbitrary media. |
| Measure sound | Draft #64 implements local macOS file analysis/DSP and seven stdio tools; synthetic tests pass on Linux Python 3.10–3.12 | Mac acceptance, a PIXIE-owned connection/interface, iPad execution and DAW integration. LUFS, spectral energy and clipping hints do not measure whether a vocal follows the intended melody. |
| Check pitch/key and timing | No implementation verified in the current audio draft or reviewed mobile workflow | Vocal pitch tracking, comparison with intended notes/reference and timing, confidence/limitations, and usable device-level feedback. Real-time feedback and after-take feedback are separate requirements; do not silently choose one. |
| Record and edit | GarageBand supplies recording and timeline editing outside PIXIE | Verified interaction, if any, between PIXIE and the owner's GarageBand session. No connector, recording control, microphone access, screen access or DAW automation is established here. |
| Collaborate with the producer | Existing reviewed project-context return and explicit save mechanisms | Tested GarageBand-to-Logic project/audio exchange, producer instruction/revision attribution and a verified return path. Do not promise fully editable Logic-to-iPad round trips or plugin/MIDI preservation without evidence. |

## Intended journey to validate

1. The owner opens the relevant Companion project and explicitly supplies the
   producer's instructions and the reference/take they want PIXIE to use.
2. PIXIE explains the requested step in context, identifies anything genuinely
   ambiguous and helps the owner carry it out in their GarageBand workflow.
   A proposed action must not be reported as an action performed inside the DAW.
3. The owner records or selects a take. Only explicitly selected audio and
   authorized context may be examined; no background listening or unrelated files.
4. PIXIE reports implemented measurements with their reference, location in the
   take, confidence and limitations. Feedback should distinguish note deviation,
   intended phrasing/expression, timing and signal-quality hints. Song key alone
   is not a complete intended-melody reference. Unsupported analysis must be
   labelled unavailable rather than inferred from loudness or spectral balance.
5. The owner makes listening decisions, chooses any revision and retains its
   notes/take identity. Resuming the project keeps the producer's instruction,
   the owner's progress and the next step connected.
6. The owner explicitly reviews what to share with the producer. Returned work
   is attributable and versioned, preserving originals and local edits. The
   actual iPad/iPhone GarageBand ↔ Mac Logic exchange must be device-tested.

This is acceptance direction, not a chosen audio-engine implementation. No new
model, microphone entitlement, cloud upload, continuous monitoring, DAW-control
adapter, native wrapper, hosting change or collaboration service is selected.
If an implementation needs one, present the precise existing-source gap and a
bounded proposal under the owning repository's review process.

## Bounded contributor opportunities and acceptance evidence

Use the existing GitHub contribution/checkpoint process. A participant may
comment on the review PR and propose one bounded task; this is not an assignment,
formal membership or promise of compensation. Existing mission/participation
terms apply. Appropriate tasks include:

- Map one producer instruction through the existing project/task/helper UI,
  preserving the instruction separately from an assistant interpretation and
  recording a synthetic example of progress/resume behavior.
- Inventory actual iPad/iPhone audio-selection and GarageBand/Logic exchange
  capabilities, with exact app/OS versions and observed limitations.
- Specify and test a synthetic after-take pitch/timing case with an explicit
  reference, known deviations and an honest unavailable/confidence result. Do
  not introduce a detector as accepted architecture from this document alone.
- Review keyboard/VoiceOver, permission, original-preservation, correction,
  failure/retry and version-attribution requirements for one step.

Record source commit, device/app versions, synthetic inputs, expected versus
observed behavior and what a human actually performed. Fixture tests, measurements,
real DAW actions and physical-device acceptance are separate evidence states.
Human listening sign-off is not replaced by a green test suite. Keep private
producer correspondence and recordings out of public issues/tests; use synthetic
fixtures in the repository. The privately supplied eight audio files were used
for a separate manual decode/analysis check, not committed as test fixtures and
not evidence of vocal or mobile DAW acceptance.

Data-loss/recovery work remains in [issue #17](https://github.com/Loptr-Lab/pixie-ecosystem-guide/issues/17).
Do not duplicate that work or weaken its release boundaries.

## Draft #64 and release boundary

The macOS audio draft is a possible supporting component, not delivery of this
mobile assistant-producer app. Its Claude Desktop registration is part of the
superseded initial setup specification; it is not the approved app onboarding.
Removal/replacement and the actual PIXIE connection are still outstanding. Do
not describe that setup as usable from the owner's iPad/iPhone.

Documentation only: no runtime/UI change, merge, deployment, installed-plugin
update, production data transfer or release is authorized by this record. The
existing backup, privacy, identity, source/canon and release rules remain in force.
