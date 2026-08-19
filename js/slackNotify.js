import { getData, commit } from './store.js';

export function getSlackWebhookUrl() {
  return getData().slackWebhookUrl || '';
}

export function setSlackWebhookUrl(url) {
  const data = getData();
  data.slackWebhookUrl = url.trim();
  commit();
}

// Best-effort only: Slack's incoming webhooks don't return a readable
// response to browser fetch (opaque due to CORS), so this cannot confirm
// delivery. Requires a Slack "Incoming Webhook" URL from the workspace.
export function notifySlack(text) {
  const url = getSlackWebhookUrl();
  if (!url) return;
  fetch(url, {
    method: 'POST',
    mode: 'no-cors',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text }),
  }).catch(() => {});
}
