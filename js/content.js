// Exercise content for the Rich Life Planner.
// Authored from transition-form-plan.md. Text is intentionally verbatim.
// Structure consumed by the Alpine app (app.js) and storage layer (storage.js).

window.MODULES = [
  {
    slug: "transitions",
    name: "Transitions",
    subtitle: "Navigating the change itself",
    color: "orange",
    order: 1,
    optional: false,
    source: "Drawn from William Bridges' Transitions",
    sectionIntro:
      "William Bridges spent decades studying how people navigate major life changes. His central finding was counterintuitive: most transitions don't fail because people can't reach the new thing \u2014 they fail because people haven't fully left the old one. Bridges identified three phases every transition moves through: an Ending, a Neutral Zone, and a New Beginning. These aren't always sequential, and they're never neat. But naming them makes them navigable. The exercises in this module are more inward-looking than most. They ask harder questions. Answer them slowly.",
    exercises: [
      {
        slug: "endings",
        number: "1.1",
        title: "Endings",
        kind: "text",
        intro:
          "Every transition begins with an ending \u2014 not just of a situation, but of an identity, a role, a way of seeing yourself. This is true even when you're the one choosing to leave. Bridges found that people who skip the work of acknowledging what is ending often find it following them into the new life, unfinished. This exercise asks you to look clearly at what is ending for you \u2014 including the parts that are a relief, and the parts that are a quiet grief.",
        required: [
          {
            id: "required",
            prompt:
              "What is ending in your life right now \u2014 not just practically, but in terms of who you've been?",
          },
        ],
        optional: [
          { id: "q1", prompt: "What role or version of yourself is completing its time?" },
          { id: "q2", prompt: "What will you genuinely miss?" },
          { id: "q3", prompt: "What are you relieved to leave behind?" },
          {
            id: "q4",
            prompt:
              "What do you want to acknowledge or honour about this chapter before it closes?",
          },
        ],
        inspiration: [],
      },
      {
        slug: "neutral-zone",
        number: "1.2",
        title: "The Neutral Zone",
        kind: "text",
        intro:
          "Between the old life and the new one, there is a gap. Bridges called it the Neutral Zone \u2014 a period of not-yet, of disorientation, of not knowing who you are in the new context. It's uncomfortable, and most people rush through it or try to fill it with activity and plans. But Bridges found that the Neutral Zone is where the most important inner work happens \u2014 where old identities dissolve and new ones begin to form. You can't think your way through it. You have to live in it. This exercise helps you prepare for that, not by planning your way out of it, but by understanding what it's for.",
        required: [
          {
            id: "required",
            prompt:
              "What does \u201cnot knowing yet\u201d feel like for you \u2014 exciting, terrifying, both?",
          },
        ],
        optional: [
          {
            id: "q1",
            prompt:
              "What do you typically do when you feel disoriented or unmoored? Does that serve you?",
          },
          {
            id: "q2",
            prompt: "What would you need in order to feel okay without a plan for a while?",
          },
          {
            id: "q3",
            prompt:
              "What might become possible during a period of not-knowing that couldn't happen otherwise?",
          },
          { id: "q4", prompt: "What do you want to protect yourself from during this phase?" },
        ],
        inspiration: [],
      },
      {
        slug: "not-ready-to-let-go",
        number: "1.3",
        title: "What you're not ready to let go of",
        kind: "text",
        intro:
          "The hardest part of any transition isn't the leap forward \u2014 it's the invisible thread that pulls you back. Most people are aware of what they're excited to leave behind. Fewer are honest about what they're secretly hoping to recreate in the new life, or what they'll miss in ways they haven't yet admitted to themselves. Bridges found this is what most often derails a transition: not external obstacles, but the unlived grief of leaving. This exercise asks the harder question. Answering it honestly is what separates a genuine transition from moving your current life to a new location.",
        required: [
          {
            id: "required",
            prompt:
              "What from your current life are you secretly hoping to bring with you or recreate?",
          },
        ],
        optional: [
          { id: "q1", prompt: "What habit, comfort, or identity marker will be hardest to release?" },
          {
            id: "q2",
            prompt:
              "Is there a person, relationship dynamic, or community you're afraid of losing?",
          },
          { id: "q3", prompt: "What would you need to grieve in order to move forward cleanly?" },
        ],
        inspiration: [],
      },
      {
        slug: "what-is-beginning",
        number: "1.4",
        title: "What is beginning",
        kind: "text",
        intro:
          "Bridges distinguished a New Beginning from a mere fresh start. A fresh start is a blank slate \u2014 you wipe everything and start over. A New Beginning grows out of what ended. It carries something forward, transformed. It often can't be planned in advance because it only becomes visible once you've moved through the Neutral Zone. It arrives not as a decision but as a recognition \u2014 something that was always there, finally finding room. This exercise asks you to listen for what's already trying to emerge: the version of yourself that this transition is making possible.",
        required: [
          {
            id: "required",
            prompt: "Who are you becoming that you couldn't have been before this transition?",
          },
        ],
        optional: [
          { id: "q1", prompt: "What feels like it has been waiting for permission to emerge?" },
          { id: "q2", prompt: "What values or qualities do you want to lead with in this new chapter?" },
          { id: "q3", prompt: "What do you want to be true about you on the other side of this?" },
        ],
        inspiration: [],
      },
      {
        slug: "the-transition",
        number: "1.5",
        title: "The transition",
        kind: "text",
        intro:
          "Most people plan for a destination and tolerate the journey to get there. But some transitions have a middle chapter that deserves to be designed on its own terms \u2014 not as a gap before the real thing begins, but as a period worth wanting. Having explored what is ending and what is beginning, this exercise asks you to sketch what the in-between looks like. It might be wandering, or experimenting, or deliberately slowing down. It might be one year or five. The point is not to plan it precisely, but to ask honestly: is there a version of life between here and there that you actually want?",
        required: [
          {
            id: "required",
            prompt:
              "Is there a transition period before your Rich Life that you want to design intentionally? Describe what it looks, feels, and sounds like.",
          },
        ],
        optional: [
          { id: "q1", prompt: "What matters most during this period?" },
          { id: "q2", prompt: "What are you free from during it? What are you free to do?" },
          { id: "q3", prompt: "How long does it last \u2014 and what tells you it's over?" },
        ],
        inspiration: [
          "Imagine you have no fixed address for two years. What does your week look like?",
          "What would you do if you had permission to be completely unproductive for a while?",
          "What have you always wanted to try but never had the space to?",
          "What does freedom feel like in your body \u2014 not as an idea, but as a day?",
        ],
      },
    ],
  },
  {
    slug: "vision",
    name: "Vision",
    subtitle: "Designing the longer arc",
    color: "teal",
    order: 2,
    optional: true,
    source: "Drawn from Ramit Sethi's I Will Teach You to Be Rich",
    sectionIntro:
      "Before thinking about how to get somewhere, it helps to know what you're actually moving toward \u2014 and what the journey itself might look like. These exercises are intentionally open. There are no wrong answers, and you don't need to be certain. The goal is to articulate something honest, even if it's incomplete.",
    exercises: [
      {
        slug: "rich-life-challenge",
        number: "2.1",
        title: "Rich Life challenge",
        kind: "text",
        intro:
          "Designing a Rich Life on paper is one thing. Feeling it in your body is another. Ramit Sethi's challenge is simple: do one small thing now that belongs to the life you're designing. Not a grand gesture \u2014 a meal, a morning, a purchase, a conversation you've been putting off. Then notice what it actually feels like, before and after. The gap between anticipation and experience is where you learn what you really want. Sometimes you discover you want it even more than you thought. Sometimes you discover you were in love with the idea, not the thing itself. Either way, you learn something real.",
        required: [
          { id: "required", prompt: "What did you choose to do, and how did it feel before and after?" },
        ],
        optional: [
          { id: "q1", prompt: "Why this particular thing?" },
          { id: "q2", prompt: "What did you learn about what you actually want?" },
        ],
        inspiration: [],
      },
      {
        slug: "future-state",
        number: "2.2",
        title: "The future state",
        kind: "text",
        intro:
          "Beyond any transition, something eventually takes shape \u2014 a different kind of life, chosen rather than inherited. This isn't about the perfect house or the ideal city. It's about the texture of an ordinary day when you feel you've arrived somewhere that fits. What does that feel like? What's present that isn't now? What's no longer there?",
        required: [
          {
            id: "required",
            prompt:
              "Describe an ordinary Tuesday in your future life. Be specific \u2014 morning, afternoon, evening.",
          },
        ],
        optional: [
          { id: "q1", prompt: "Where are you? Who is around you?" },
          { id: "q2", prompt: "What's present in this life that isn't in your life now?" },
          { id: "q3", prompt: "What's no longer there?" },
        ],
        inspiration: [
          "Describe your future life to a stranger on a plane. Make them a little jealous.",
          "What did you want at 25 that you quietly gave up on?",
          "If work were optional, what would fill your days?",
          "What would your 70-year-old self thank you for choosing?",
          "Imagine you moved somewhere nobody knows you. What would you do differently?",
        ],
      },
      {
        slug: "life-chapters",
        number: "2.3",
        title: "Life chapters",
        kind: "text",
        intro:
          "Most people spend more time planning a holiday than designing their life. Life chapters asks you to zoom out and think in terms of what you want each period to be about \u2014 not what you'll achieve, but what you'll inhabit. A chapter isn't a plan. It's an intention, a texture, a set of things that matter. What do you want this next chapter of your life to stand for?",
        required: [
          {
            id: "required",
            prompt:
              "What do you want the next 5\u201310 years to be about? Not what you'll do \u2014 what it will feel like to live them.",
          },
        ],
        optional: [
          { id: "q1", prompt: "What do you want more of in your life?" },
          { id: "q2", prompt: "What do you want less of?" },
          { id: "q3", prompt: "What would you regret not doing or being during this chapter?" },
          {
            id: "q4",
            prompt: "Is there a chapter after this one that you can already sense? What is it?",
          },
        ],
        inspiration: [],
      },
      {
        slug: "money-dials",
        number: "2.4",
        title: "Money Dials",
        kind: "ranking",
        intro:
          "We all say we know what matters to us. But where we actually spend money tells a different story. Money Dials \u2014 a concept from Ramit Sethi \u2014 are the categories of life where spending genuinely makes you happier. The exercise isn't about budgeting. It's about discovering what you actually value when you're honest about it, and whether your partner values the same things. There are no right answers \u2014 only true ones.",
        rankingPrompt:
          "Rank the following 10 categories from most to least important for how you want to spend money and energy in your Rich Life.",
        categories: [
          "Travel and exploration",
          "Health and wellbeing",
          "Home and environment",
          "Experiences and adventures",
          "Relationships and time with people you love",
          "Freedom and flexibility (buying back your time)",
          "Learning and growth",
          "Generosity (giving to others, causes, community)",
          "Comfort and convenience",
          "Beauty, aesthetics, and quality",
        ],
        required: [{ id: "required", prompt: "Your ranking of the 10 categories." }],
        optional: [
          { id: "q1", prompt: "Which ranking surprises you?" },
          { id: "q2", prompt: "Which did you rank lower than you expected?" },
        ],
        inspiration: [],
      },
      {
        slug: "windfall",
        number: "2.5",
        title: "Windfall",
        kind: "text",
        intro:
          "Hypothetical money questions reveal real values. When there's no budget constraint, no practicality filter, no \u201cbut we can't afford that\u201d \u2014 what do you reach for first? This exercise uses imaginary windfalls at three scales to surface what you genuinely want, versus what you've trained yourself to want within your current constraints. Answer quickly. Your first instinct is the most honest one.",
        required: [
          { id: "w10k", prompt: "You receive \u20ac10,000 unexpectedly. What do you do with it?" },
          { id: "w100k", prompt: "You receive \u20ac100,000. What do you do with it?" },
          { id: "w1m", prompt: "You receive \u20ac1,000,000. What do you do with it?" },
        ],
        optional: [
          {
            id: "q1",
            prompt: "What do you notice about the differences between your three answers?",
          },
        ],
        inspiration: [],
      },
    ],
  },
];

// Convenience lookups
window.getModule = function (slug) {
  return window.MODULES.find((m) => m.slug === slug);
};
window.getExercise = function (moduleSlug, exerciseSlug) {
  const mod = window.getModule(moduleSlug);
  return mod ? mod.exercises.find((e) => e.slug === exerciseSlug) : null;
};
