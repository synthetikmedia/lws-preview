const fs = require("fs");
const path = require("path");

const CREDS_PATH = path.join("C:", "Users", "devin", ".claude", ".credentials.json");
const AUTH_PATH = path.join("C:", "Users", "canaa", ".openclaw", "agents", "main", "agent", "auth-profiles.json");
const CLIENT_ID = "9d1c250a-e61b-44d9-88ed-5944d1962f5e";
const TOKEN_URL = "https://platform.claude.com/v1/oauth/token";

async function main() {
  // Read devin's credentials
  const creds = JSON.parse(fs.readFileSync(CREDS_PATH, "utf8"));
  const refreshToken = creds.claudeAiOauth.refreshToken;

  if (!refreshToken) {
    console.error("ERROR: No refresh token found");
    process.exit(1);
  }

  // Check if token is still valid (refresh 1 hour before expiry)
  const expiresAt = creds.claudeAiOauth.expiresAt;
  const oneHour = 3600000;
  if (expiresAt && (expiresAt - Date.now()) > oneHour) {
    console.log("Token still valid, expires:", new Date(expiresAt).toLocaleString());

    // Still sync to OpenClaw in case it's out of date
    syncToOpenClaw(creds.claudeAiOauth.accessToken);
    return;
  }

  console.log("Token expired or expiring soon, refreshing...");

  // Refresh the token
  const resp = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      grant_type: "refresh_token",
      refresh_token: refreshToken,
      client_id: CLIENT_ID
    })
  });

  if (!resp.ok) {
    const text = await resp.text();
    console.error("ERROR: Refresh failed:", resp.status, text);
    process.exit(1);
  }

  const data = await resp.json();
  console.log("Token refreshed successfully!");

  // Update devin's credentials file
  creds.claudeAiOauth.accessToken = data.access_token;
  creds.claudeAiOauth.refreshToken = data.refresh_token;
  creds.claudeAiOauth.expiresAt = Date.now() + (data.expires_in * 1000);
  fs.writeFileSync(CREDS_PATH, JSON.stringify(creds), "utf8");
  console.log("Devin credentials updated, expires:", new Date(creds.claudeAiOauth.expiresAt).toLocaleString());

  // Sync to OpenClaw
  syncToOpenClaw(data.access_token);
}

function syncToOpenClaw(token) {
  const auth = JSON.parse(fs.readFileSync(AUTH_PATH, "utf8"));
  const current = auth.profiles["anthropic:default"].token;

  if (current === token) {
    console.log("OpenClaw already has current token, no update needed.");
    return;
  }

  auth.profiles["anthropic:default"].token = token;
  fs.writeFileSync(AUTH_PATH, JSON.stringify(auth, null, 2), "utf8");
  console.log("OpenClaw auth profile updated!");
}

main().catch(e => { console.error(e); process.exit(1); });
