const express = require('express');
const path = require('path');

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
  if (typeof draft !== 'string' || !draft.trim()) {
    return res.status(400).json({ error: 'Please enter your own English draft first.' });
  }
  if (draft.length > 7000 || String(rubric).length > 3000) {
    return res.status(400).json({ error: 'Your text is too long. Please shorten it and try again.' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(503).json({ error: 'The AI service is not connected yet. The site owner must add a Gemini API key in the hosting settings.' });
  }

  try {
    const userMessage = `Student's topic: ${topic || 'Not specified'}\nTeacher's rubric (if any): ${rubric || 'Not provided; do not assign numerical grades or invent criteria.'}\nActivity: ${mode}\nStudent's current draft:\n${draft}\n${previous ? `Previous feedback or student attempt:\n${previous}\n` : ''}Provide formative feedback according to your rules. Structure it with a short positive opening, up to three priority items (Original phrase / What needs attention? / Think about it / Your turn), then one short next step. Do not provide the complete corrected version.`;
    const model = process.env.GEMINI_MODEL || 'gemini-2.5-flash-lite';
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`;
    const apiResponse = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
        contents: [{ role: 'user', parts: [{ text: userMessage }] }],
        generationConfig: { temperature: 0.3 }
      })
    });

    const result = await apiResponse.json().catch(() => ({}));
    if (!apiResponse.ok) {
      const providerMessage = result?.error?.message || 'Unknown Gemini API error';
      console.error(`Gemini API error (${apiResponse.status}): ${providerMessage}`);
      if (apiResponse.status === 429) {
        return res.status(503).json({ error: 'The free Gemini API quota may have been reached. Please wait and try again later, or check your Google AI Studio quota.' });
      }
      if (apiResponse.status === 401 || apiResponse.status === 403) {
        return res.status(503).json({ error: 'The Gemini API key was rejected or does not have access. Please check the key in the hosting settings.' });
      }
      return res.status(502).json({ error: 'The AI provider could not process the request. Please try again later.' });
    }

    const feedback = (result?.candidates?.[0]?.content?.parts || [])
      .map(part => part.text || '')
      .join('\n')
      .trim();
    if (!feedback) {
      console.error('Gemini API returned no text candidate.');
      return res.status(502).json({ error: 'The AI did not return feedback this time. Please try again.' });
    }
    return res.json({ feedback });
  } catch (err) {
    console.error('Feedback request failed:', err.message);
    return res.status(500).json({ error: 'Sorry, I could not check your draft right now. Please try again later.' });
  }
});

app.get('/health', (_req, res) => res.json({ ok: true }));
const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`AI Writing Buddy A1 running on port ${port}`));
