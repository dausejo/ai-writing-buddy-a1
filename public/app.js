const form = document.getElementById('writing-form');
const draft = document.getElementById('draft');
const count = document.getElementById('word-count');
const submitBtn = document.getElementById('submit-btn');
const emptyState = document.getElementById('empty-state');
const loading = document.getElementById('loading');
const errorBox = document.getElementById('error');
const feedback = document.getElementById('feedback');
const copyBtn = document.getElementById('copy-feedback');
let lastFeedback = '';
function updateCount(){ const words = draft.value.trim() ? draft.value.trim().split(/\s+/).length : 0; count.textContent = `${words} ${words === 1 ? 'word' : 'words'}`; }
draft.addEventListener('input', updateCount);
form.addEventListener('submit', async (event) => {
  event.preventDefault();
  const text = draft.value.trim();
  if (!text) { draft.focus(); return; }
  emptyState.classList.add('hidden'); feedback.classList.add('hidden'); errorBox.classList.add('hidden'); copyBtn.classList.add('hidden'); loading.classList.remove('hidden'); submitBtn.disabled = true;
  try {
    const response = await fetch('/api/feedback', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ topic:document.getElementById('topic').value.trim(), draft:text, rubric:document.getElementById('rubric').value.trim(), mode:document.getElementById('mode').value }) });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Something went wrong. Please try again.');
    lastFeedback = data.feedback; feedback.textContent = lastFeedback; feedback.classList.remove('hidden'); copyBtn.classList.remove('hidden');
  } catch (err) { errorBox.textContent = err.message || 'Connection problem. Please try again.'; errorBox.classList.remove('hidden'); }
  finally { loading.classList.add('hidden'); submitBtn.disabled = false; }
});
copyBtn.addEventListener('click', async () => { try { await navigator.clipboard.writeText(lastFeedback); copyBtn.textContent = 'Copied!'; setTimeout(()=>copyBtn.textContent='Copy feedback',1600); } catch { copyBtn.textContent='Please select and copy the feedback'; } });
updateCount();
