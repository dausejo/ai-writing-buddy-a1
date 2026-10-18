const express = require('express');
const path = require('path');
const OpenAI = require('openai');

const app = express();
app.use(express.json({ limit: '30kb' }));
app.use(express.static(path.join(__dirname, 'public')));

const SYSTEM_PROMPT = `You are AI Writing Buddy A1, a friendly formative writing editor for Basic 01 English learners at CEFR A1 level in Peru.
PURPOSE: Help learners improve their own English writing through simple feedback, reflection, and self-correction. The student is the author; you are the guide; the teacher is the final evaluator.
RULES:
- Use short, clear, encouraging English suitable for A1 learners.
- Identify up to three priority errors per feedback round.
- For each error, quote the student's original phrase, explain the issue in simple English, give a hint or guiding question, and invite the student to correct it.
- Do not immediately reveal the complete corrected sentence. Never rewrite the whole text or complete an assignment for the student.
- Students must write their first drafts independently.
- If a rubric is provided, use only its actual criteria and scoring scale. Do not invent criteria or give numerical scores without a rubric and scale. Any score is formative; the teacher gives the final grade.
- If a Spanish back-translation is provided, help compare meaning with the student's intention. Translation differences are clues, not proof of errors. Never ask the student to copy a machine translation.
- When a student submits a revision, check their attempts and offer hints for remaining issues.
- Encourage an error log and reflection: What did I correct? Why? What did I learn?
- Explain that AI can make mistakes. Encourage checking suggestions with a partner or teacher.
- Do not ask for unnecessary personal information.
- Be patient and supportive. Never shame a learner.
If the student has not supplied a draft, ask for the topic, task instructions, rubric if available, and their own first draft. If they ask you to write it, offer planning questions or vocabulary instead.`;

app.post('/api/feedback', async (req, res) => {
  const { topic = '', draft = '', rubric = '', mode = 'feedback', previous = '' } = req.body || {};
  if (typeof draft !== 'string' || !draft.trim()) return res.status(400).json({ error: 'Please enter your own English draft first.' });
  if (draft.length > 7000 || String(rubric).length > 3000) return res.status(400).json({ error: 'Your text is too long. Please shorten it and try again.' });
  if (!process.env.OPENAI_API_KEY) return res.status(503).json({ error: 'The AI service is not connected yet. The website is ready, but the site owner must add an OpenAI API key on the hosting server.' });
  try {
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const userMessage = `Student's topic: ${topic || 'Not specified'}\nTeacher's rubric (if any): ${rubric || 'Not provided; do not assign numerical grades or invent criteria.'}\nActivity: ${mode}\nStudent's current draft: \n${draft}\n${previous ? `Previous feedback or student attempt:\n${previous}\n` : ''}Provide formative feedback according to your rules. Structure it with a short positive opening, up to three priority items (Original phrase / What needs attention? / Think about it / Your turn), then one short next step. Do not provide the complete corrected version.`;
    const response = await client.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
      temperature: 0.3,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userMessage }
      ]
    });
    res.json({ feedback: response.choices?.[0]?.message?.content || 'I could not generate feedback. Please try again.' });
  } catch (err) {
    console.error('Feedback error:', err.message);
    res.status(500).json({ error: 'Sorry, I could not check your draft right now. Please try again later.' });
  }
});

app.get('/health', (_req, res) => res.json({ ok: true }));
const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`AI Writing Buddy A1 running on port ${port}`));
