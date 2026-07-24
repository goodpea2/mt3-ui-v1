/**
 * Deco Shop Cost Configuration
 * Maps Stage Customizer element IDs to their purchase costs in DecoTickets (🎨).
 */
export const DECO_TICKET_COSTS = {
  // Backgrounds
  'bg-starting-star': 0,
  'bg-default': 50,
  'bg-nebula': 50,
  'bg-laser': 150,
  'bg-sunset': 150,
  'bg-void': 400,
  'bg-light-peach': 50,
  'bg-light-aurora': 50,
  'bg-light-chalk': 150,
  'bg-light-[#e5e5e5]': 150, // if custom id is dynamic
  'bg-light-cherry': 150,
  'bg-light-solar': 400,

  // Notes
  'note-default': 0,
  'note-diamond': 50,
  'note-square': 50,
  'note-star': 150,
  'note-ring': 150,
  'note-midnight': 50,
  'note-carbon': 150,
  'note-eclipse': 150,
  'note-vortex': 400,
  'note-emerald': 800,

  // Note Hit VFX
  'vfx-default': 0,
  'vfx-flare': 75,
  'vfx-ripple': 200,
  'vfx-gold': 200,
  'vfx-lightning': 600,

  // Score Panels
  'score-default': 0,
  'score-neon': 75,
  'score-glitch': 75,
  'score-royal': 200,
  'score-minimal': 200,

  // Accuracy Styles
  'accuracy-default': 0,
  'accuracy-neon': 75,
  'accuracy-glitch': 75,
  'accuracy-royal': 200,
  'accuracy-arcade': 200
};

/**
 * Helper to get the DecoTicket cost for any element.
 * If not defined in the mapping, defaults to 0.
 */
export function getDecoTicketCost(elementId) {
  return DECO_TICKET_COSTS[elementId] !== undefined ? DECO_TICKET_COSTS[elementId] : 0;
}
