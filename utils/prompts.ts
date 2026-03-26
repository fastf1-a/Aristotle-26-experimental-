import { ExtractedContent, OutputFormat, Persona, SummaryLength } from '../types';
import { PERSONAS } from '../constants';

export const buildPrompt = (
  content: ExtractedContent, 
  format: OutputFormat, 
  language: string, 
  customInstructions?: string,
  personaId: Persona = 'General Assistant',
  length: SummaryLength = 'Medium',
  maxSummaryLength?: number,
  isShort: boolean = false
): string => {
  const persona = PERSONAS.find(p => p.id === personaId) || PERSONAS[0];
  const personaInstruction = persona.instruction;

  const lengthInstructions: Record<SummaryLength, string> = {
    'Short': 'Be extremely concise. Focus only on the absolute most critical information. Keep the response very brief.',
    'Medium': 'Provide a balanced response with a good level of detail while remaining focused.',
    'Long': 'Provide an exhaustive, highly detailed response. Explore all nuances and provide deep context for every point.'
  };

  const formatInstructions: Record<OutputFormat, string> = {
    'Quick Summary': `Provide a high-impact, scannable summary in ${language}. 
      Structure:
      1. **Core Essence**: One punchy, memorable sentence capturing the "Why" and the primary thesis.
      2. **The Big Picture**: 3-5 high-density bullet points of critical data, arguments, or insights.
      3. **Key Quote**: The most powerful verbatim quote from the source.
      4. **Strategic Takeaway**: A brief "So What?" explanation of the long-term impact.
      Use bold text for emphasis and prioritize information density.`,

    'Detailed Analysis': `Conduct a sophisticated, multi-dimensional analysis in ${language}. 
      Include these sections with clear headings:
      - **Executive Narrative**: 3-paragraph overview of thesis and trajectory.
      - **Thematic Deep Dive**: Categorized primary/secondary points with nuances.
      - **Logic & Assumptions**: Evaluation of flow and underlying fallacies.
      - **Entity Mapping**: Key people/orgs/concepts and their roles.
      - **SWOT Analysis**: Structured breakdown of Strengths, Weaknesses, Opportunities, Threats.
      - **Critical Evaluation**: Assessment of credibility, tone, and bias.
      - **Counter-Arguments**: Identify opposing viewpoints or potential rebuttals.
      - **Future Trajectory**: Predicted long-term implications and "What's Next".`,

    'Full Transcript': `Provide the complete, high-fidelity content in ${language}. 
      - For Media: Verbatim transcript with speaker labels (e.g., Speaker 1) and timestamps (e.g., [00:00]). Use heuristics if not explicit.
      - For Text: Full, cleaned, structured content preserving all headings, subheadings, and formatting nuances.
      - Tone Preservation: Maintain the original speaker's/author's tone and style exactly.
      - CRITICAL: 100% accuracy. Do NOT summarize or omit any details. Provide full depth.`,

    'Slides Outline': `Design a professional 10-12 slide presentation outline in ${language}.
      For each slide:
      - **Slide Title**: Benefit-driven, punchy heading.
      - **Key Message**: The "One Thing" the audience should remember from this slide.
      - **Bullet Points**: 3-5 concise, high-impact points.
      - **Visual Concept**: Detailed suggestions for charts, metaphors, or imagery.
      - **Speaker Notes**: Natural, engaging script including transitions to the next slide.
      Include Hook, Agenda, Problem, Solution, Data Evidence, and a clear Call to Action.`,

    'Quiz': `Create a 10-question comprehensive mastery quiz in ${language}.
      For each question:
      - **Question**: Clear, challenging, and thought-provoking.
      - **Difficulty**: (Beginner/Intermediate/Advanced).
      - **Options**: 4 plausible choices (A, B, C, D).
      - **Correct Answer**: Clearly identified.
      - **Rationale**: 2-sentence pedagogical explanation of why the answer is correct and why others are wrong.
      - **Learning Objective**: What specific concept is being tested.
      Provide a "Mastery Score" guide and an "Answer Key" at the end.`,

    'Flashcards': `Create 15-20 high-retention, active-recall flashcards in ${language}.
      Format:
      ---
      **FRONT**: [Question or Concept Name]
      **BACK**: [Concise, clear answer or definition]
      **MNEMONIC**: [A memory trick or real-world example to aid retention]
      **CATEGORY**: [Topic area]
      ---
      Use (---) to separate cards. Focus on the most important "need-to-know" facts.`,

    'Mind Map': `Create a detailed hierarchical ASCII mind map in ${language}.
      Wrap in a Markdown code block (\`\`\`).
      
      Structure:
      CENTRAL TOPIC
      ├── [Main Branch 1: Key Theme]
      │   ├── [Sub-branch: Supporting Detail]
      │   │   └── (Point) ➔ [Evidence/Example]
      │   └── [Sub-branch: Nuance]
      ├── [Main Branch 2: Critical Argument]
      │   └── [Sub-branch: Data Point]
      └── [Synthesis/Conclusion]
      
      Ensure the hierarchy is logical and easy to follow visually.`,

    'ELI5': `Explain the core concepts in ${language} as if I am a curious 5-year-old. 
      - **Tone**: Warm, encouraging, and storytelling-based.
      - **The "Big Idea"**: Start with a simple analogy (e.g., "Imagine if your brain was a library...").
      - **Simple Steps**: Break down complex parts into "Lego-brick" sized pieces.
      - **No Scary Words**: Replace all jargon with "playground talk".
      - **The Lesson**: What is the one thing I should tell my friends at recess?
      - **Fun Fact**: One surprising thing that makes this cool.`,

    'Action Items': `Extract a strategic, high-velocity action plan in ${language}.
      1. **Immediate Wins**: Low-effort, high-impact tasks to complete within 24-48 hours.
      2. **Strategic Projects**: Long-term initiatives requiring deeper planning.
      3. **Knowledge Gaps**: Critical unanswered questions or areas needing more research.
      4. **Success KPIs**: Specific, measurable outcomes to track progress.
      5. **Resource Needs**: Tools or expertise required to execute these items.`,

    'Podcast Script': `Write an engaging, high-energy 5-10 minute conversational podcast script in ${language}.
      - **Host 1 (The Skeptic/Curious)**: Asks the "Why" and "How" questions, represents the audience's initial confusion.
      - **Host 2 (The Expert/Analyst)**: Provides deep data, nuance, and explains the "So What".
      Include a compelling Hook, a structured 3-part discussion, and a strong Outro. 
      Use stage directions like [Laughs], [Pauses for effect], [Sound of paper rustling] to make it feel real.`,

    'Tweet Thread': `Write a viral, high-engagement 8-12 tweet thread in ${language}.
      - **Tweet 1**: A scroll-stopping Mega-Hook that promises a specific transformation or insight.
      - **Tweets 2-11**: "Value Bombs" - one clear, punchy insight per tweet with supporting evidence.
      - **Tweet 12**: A concise TL;DR summary and a strong Call to Action (CTA).
      Use emojis strategically, maintain high curiosity, and use punchy line breaks.`,

    'Executive Brief': `Write a high-density, 1-page executive briefing in ${language} for a C-suite audience.
      1. **BLUF (Bottom Line Up Front)**: The most critical information in 2 sentences.
      2. **Strategic Context**: Why this matters to the business/industry right now.
      3. **Key Findings**: 3-5 strategic points backed by data or logic.
      4. **Risk/Opportunity Matrix**: A breakdown of potential pitfalls and competitive advantages.
      5. **Recommended Path**: A clear, authoritative recommendation for the next step.`,

    'Study Notes': `Create comprehensive, academic-grade study notes in ${language} using the Cornell Method.
      - **Abstract**: A 100-word high-level summary.
      - **Glossary of Terms**: 5-10 essential terms with precise definitions.
      - **Core Concepts**: A structured breakdown of the main arguments and evidence.
      - **Synthesis**: How this connects to broader themes or other fields of study.
      - **Mastery Review**: 5 challenging open-ended questions to test deep understanding.`,

    'Custom Prompt': `FOLLOW THESE CUSTOM INSTRUCTIONS EXACTLY:
      ${customInstructions || "Analyze this content deeply and provide a structured response."}`
  };

  const instruction = formatInstructions[format];
  const lengthInstruction = lengthInstructions[length];
  
  if (isShort) {
    const truncatedContent = content.content.length > 300 
      ? content.content.substring(0, 300) + "..." 
      : content.content;
      
    return `TASK: ${instruction}
PERSONA: ${personaInstruction}
LENGTH: ${lengthInstruction}
LANGUAGE: Respond in ${language}.

CONTENT TO ANALYZE:
Title: ${content.title}
URL: ${content.url}
Text: ${truncatedContent}

(Note: Full content is in my clipboard, please ask if you need it all.)`;
  }

  return `--- NEURAL CONTEXT & SOURCE ---
SOURCE URL: ${content.url}
CONTENT TYPE: ${content.type.toUpperCase()}
TITLE: ${content.title}

--- PERSONA & VOICE ---
${personaInstruction}

--- CONTENT TO ANALYZE ---
${content.content}

--- MISSION PARAMETERS ---
FORMAT: ${format}
INSTRUCTIONS: ${instruction}
LENGTH: ${lengthInstruction}
${maxSummaryLength ? `MAX LENGTH: Your response MUST NOT exceed ${maxSummaryLength} characters.` : ''}

--- FINAL REQUIREMENT ---
You MUST respond in ${language}. Ensure the output matches the requested format exactly. Use professional, high-density formatting.`;
};
