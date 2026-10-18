# AI Writing Buddy A1

A responsive web app for formative feedback on CEFR A1 English writing. It follows the UCV proposal: the student writes first, receives hints on up to three priority errors, revises independently, and the teacher remains the final evaluator.

## Run locally

1. Install Node.js 18 or newer.
2. In this folder, run `npm install`.
3. Set the environment variable `OPENAI_API_KEY` on your machine/server. Never put the key in browser code or commit it to this project.
4. Run `npm start`.
5. Open `http://localhost:3000`.

Example for macOS/Linux:

```bash
export OPENAI_API_KEY="your-key-here"
npm install
npm start
```

PowerShell:

```powershell
$env:OPENAI_API_KEY="your-key-here"
npm install
npm start
```

## Deploy publicly

Deploy this folder as a Node.js web service on a hosting provider that supports Node apps (for example Render or Railway). Use `npm install` as the build/install command and `npm start` as the start command. Add `OPENAI_API_KEY` as a private environment variable in the hosting dashboard. Optional: set `OPENAI_MODEL` to a model available to your API account. The host will provide a public HTTPS URL to share.

**Important:** ChatGPT subscription and OpenAI API billing are separate. A working public chatbot needs an API key and may incur usage costs. Keep the key only in the server's environment settings. Add usage limits and monitoring before sharing widely.

## Privacy and classroom use

- Ask learners not to enter personal or sensitive information.
- If learners are minors, follow the institution's consent and data-protection procedures.
- This starter has no user accounts and does not intentionally store drafts; production hosting and API providers may process request data according to their policies.
- AI feedback is formative. The teacher makes final assessment decisions.
