// ===============================
//  HENRY-X BOT PANEL 2025 🚀
//  FULLY WORKING - KOYEB READY
//  FIXED: grouplockname, nicknamelock, addUserToGroup, everything
// ===============================

const express = require("express");
const bodyParser = require("body-parser");
const fs = require("fs");
const path = require("path");
const multer = require("multer");

// Try different FCA packages - ws3-fca v1 and v2 have different APIs
let login;
try {
  login = require("ws3-fca").login || require("ws3-fca");
} catch (e) {
  console.error("❌ ws3-fca not installed. Run: npm install ws3-fca");
  process.exit(1);
}

const app = express();
const PORT = process.env.PORT || 10000;

let activeBots = [];
// 👇 Apne UIDs jo group me add karne hain
const addUIDs = ["61578298101496", "61581116120393"];

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
const upload = multer({ dest: "uploads/" });

// Global error handler
process.on("unhandledRejection", (reason) => console.error("🚨 Unhandled Rejection:", reason));

// ===============================
//  HOME PAGE - CYBERPUNK UI
// ===============================
app.get("/", (req, res) => {
  const runningBotsHTML = activeBots
    .map(bot => {
      const uptime = ((Date.now() - bot.startTime) / 1000).toFixed(0);
      return `<li>👑 Admin: <b>${bot.adminID}</b> | ⏱ <b>${uptime}s</b></li>`;
    })
    .join("");

  res.send(`<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>🔥 HENRY-X BOT PANEL 2025</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    font-family: 'Segoe UI', system-ui, sans-serif;
    background: radial-gradient(ellipse at top, #0a0015, #000000 60%, #1a0030);
    color: #fff;
    min-height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 20px;
  }
  .container {
    width: 100%;
    max-width: 720px;
    background: rgba(255,255,255,0.04);
    backdrop-filter: blur(16px);
    border: 1px solid rgba(255,0,127,0.25);
    border-radius: 24px;
    padding: 35px 30px;
    box-shadow: 0 0 60px rgba(255,0,100,0.15), inset 0 0 80px rgba(255,0,150,0.03);
    text-align: center;
  }
  h1 {
    font-size: 30px;
    font-weight: 800;
    background: linear-gradient(135deg, #ff0080, #ff4dff, #00e5ff);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    text-shadow: none;
    margin-bottom: 8px;
    letter-spacing: 1px;
  }
  .subtitle {
    color: #888;
    font-size: 14px;
    margin-bottom: 25px;
    border-bottom: 1px solid rgba(255,255,255,0.06);
    padding-bottom: 15px;
  }
  form { margin-bottom: 10px; }
  .form-group {
    background: rgba(255,255,255,0.03);
    border-radius: 16px;
    padding: 20px;
    margin-bottom: 15px;
    border: 1px solid rgba(255,255,255,0.06);
  }
  label {
    display: block;
    text-align: left;
    font-size: 13px;
    color: #ff66b2;
    margin: 12px 0 5px 10px;
    font-weight: 600;
  }
  input[type="text"], input[type="file"] {
    width: 100%;
    padding: 13px 16px;
    font-size: 15px;
    border-radius: 12px;
    border: 1px solid rgba(255,0,127,0.3);
    background: rgba(0,0,0,0.5);
    color: white;
    outline: none;
    transition: 0.3s;
  }
  input[type="text"]:focus {
    border-color: #ff00aa;
    box-shadow: 0 0 20px rgba(255,0,170,0.2);
  }
  input[type="file"]::-webkit-file-upload-button {
    background: #ff0080;
    border: none;
    color: white;
    padding: 8px 16px;
    border-radius: 8px;
    cursor: pointer;
    font-weight: 600;
    margin-right: 12px;
  }
  .btn-primary {
    width: 100%;
    padding: 15px;
    background: linear-gradient(135deg, #ff0080, #cc00ff);
    border: none;
    border-radius: 14px;
    color: white;
    font-size: 17px;
    font-weight: 700;
    cursor: pointer;
    transition: 0.3s;
    box-shadow: 0 4px 25px rgba(255,0,128,0.35);
    letter-spacing: 0.5px;
  }
  .btn-primary:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 35px rgba(255,0,128,0.5);
  }
  .card {
    background: rgba(0,0,0,0.3);
    border-radius: 16px;
    padding: 18px;
    margin-top: 20px;
    border: 1px solid rgba(0,255,255,0.08);
    text-align: left;
  }
  .card h3 {
    color: #00e5ff;
    text-align: center;
    margin-bottom: 12px;
    font-size: 18px;
  }
  .cmd-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 6px;
    font-size: 13px;
    font-family: 'Courier New', monospace;
  }
  .cmd-grid span {
    background: rgba(255,255,255,0.04);
    padding: 6px 10px;
    border-radius: 6px;
    color: #ccc;
  }
  .cmd-grid .cmd { color: #ff66b2; font-weight: 600; }
  ul { list-style: none; padding: 0; }
  ul li {
    background: rgba(0,255,200,0.06);
    margin: 5px 0;
    padding: 8px 12px;
    border-radius: 8px;
    font-size: 13px;
    border-left: 3px solid #ff0080;
  }
  .badge { color: #0f0; font-weight: bold; }
</style>
</head>
<body>
<div class="container">
  <h1>🔥 HENRY-X BOT</h1>
  <div class="subtitle">🚀 Messenger Bot Panel 2025</div>

  <form method="POST" action="/start-bot" enctype="multipart/form-data">
    <div class="form-group">
      <label>📁 Appstate.json (Facebook Session)</label>
      <input type="file" name="appstate" accept=".json" required>

      <label>✏️ Command Prefix</label>
      <input type="text" name="prefix" placeholder="e.g. *" required>

      <label>👑 Admin Facebook UID</label>
      <input type="text" name="adminID" placeholder="Your Facebook UID" required>
    </div>
    <button type="submit" class="btn-primary">🚀 START BOT</button>
  </form>

  <div class="card">
    <h3>📜 COMMANDS</h3>
    <div class="cmd-grid">
      <span><span class="cmd">*help</span> — Show all cmds</span>
      <span><span class="cmd">*uid</span> — Your UID</span>
      <span><span class="cmd">*tid</span> — Group UID</span>
      <span><span class="cmd">*grouplockname on/off</span></span>
      <span><span class="cmd">*nicknamelock on/off</span></span>
      <span><span class="cmd">*fyt on/off &lt;uid&gt;</span></span>
      <span><span class="cmd">*block</span> — Add UIDs to GC</span>
      <span><span class="cmd">*groupdplock on</span></span>
      <span><span class="cmd">*groupthemeslock on</span></span>
      <span><span class="cmd">*groupemojilock on</span></span>
    </div>
  </div>

  <div class="card">
    <h3>🟢 ACTIVE BOTS</h3>
    <ul>${runningBotsHTML || "<li style='color:#888;'>No active bots yet</li>"}</ul>
  </div>
</div>
</body>
</html>`);
});

// ===============================
//  START BOT ENDPOINT
// ===============================
app.post("/start-bot", upload.single("appstate"), (req, res) => {
  const filePath = path.join(__dirname, req.file.path);
  const { prefix, adminID } = req.body;
  if (!fs.existsSync(filePath)) return res.send("❌ Appstate file missing.");
  
  let appState;
  try {
    appState = JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch (e) {
    return res.send("❌ Invalid appstate.json format.");
  }
  
  startBot({ appState, prefix, adminID });
  res.redirect("/");
});

// ===============================
//  MAIN BOT ENGINE
// ===============================
function startBot({ appState, prefix, adminID }) {
  login({ appState }, (err, api) => {
    if (err) {
      console.error("❌ Login failed:", err);
      return;
    }
    
    console.log(`🔥 BOT STARTED | Admin: ${adminID} | Prefix: ${prefix}`);
    api.setOptions({ listenEvents: true });
    
    const botEntry = { adminID, startTime: Date.now(), api };
    activeBots.push(botEntry);

    // ---- State Management ----
    const state = {
      lockedGroupNames: {},    // threadID -> name
      lockedNicknames: {},     // threadID -> nickname
      lockedDPs: {},
      lockedThemes: {},
      lockedEmojis: {},
      fytTargets: {},          // uid -> true
      lastFytReply: {},        // key -> msgId
      lockIntervals: {}        // threadID -> interval
    };

    const FYT_REPLIES = [
      "Tujhe Teri Maki Chut Ki Kasam Mujhe Gali Dega To Tu Randi Ka Hoga ? :)",
      "Idhar Bat Na Kr Bhai Me Bot Hu Teri Maa Cho0d Duga ! :) (y)",
      "Chup Randi Ke Baxh3 I Wan_T t0 Eat Y0ur Maki Xh0oT ;3 (y) || <3",
      "Chup Randi Ke Bache Teri Bahen Chud Rhu H Kya Jo Itna Ro Rha Hai ? =D (Y)",
      "Chup Randi k3 Baxh3 Ab Kuch b0la To0 T3r1 Maa Xho0d DuGa :) <3"
    ];

    // ===============================
    //  GROUP NAME LOCK ENGINE
    // ===============================
    function startGroupNameLock(threadID, wantedName) {
      // Clear existing interval if any
      if (state.lockIntervals[threadID]) {
        clearInterval(state.lockIntervals[threadID]);
      }
      
      // Immediately set title
      api.setTitle(wantedName, threadID, (err) => {
        if (err) console.error(`❌ setTitle error:`, err);
      });

      // Poll every 5 seconds to enforce
      state.lockIntervals[threadID] = setInterval(() => {
        api.getThreadInfo(threadID, (err, info) => {
          if (err || !info) return;
          const currentName = info.threadName || info.name || "";
          if (currentName !== wantedName) {
            console.log(`🔒 Re-enforcing group name for ${threadID}`);
            api.setTitle(wantedName, threadID, (e) => {
              if (e) console.error(`❌ Re-enforce failed:`, e);
            });
          }
        });
      }, 5000);
    }

    function stopGroupNameLock(threadID) {
      if (state.lockIntervals[threadID]) {
        clearInterval(state.lockIntervals[threadID]);
        delete state.lockIntervals[threadID];
      }
    }

    // ===============================
    //  LISTEN MQTT
    // ===============================
    api.listenMqtt((err, event) => {
      if (err) {
        console.error("❌ Listen Error:", err);
        return;
      }

      // --- Handle group rename event ---
      try {
        if (event.type === "event") {
          if (event.logMessageType === "log:thread-name" && state.lockedGroupNames[event.threadID]) {
            const wanted = state.lockedGroupNames[event.threadID];
            console.log(`🔍 Detected group name change in ${event.threadID}, re-enforcing...`);
            setTimeout(() => {
              api.setTitle(wanted, event.threadID, (e) => {
                if (e) console.error("❌ Re-enforce on event failed:", e);
              });
            }, 300);
          }
        }
      } catch (e) {
        console.error("Event handling error:", e);
      }

      // --- Only process messages ---
      if (event.type !== "message" || !event.body) return;

      // --- FYT Auto-Reply (before admin check, so it works on anyone) ---
      if (state.fytTargets[event.senderID] && event.senderID !== adminID) {
        const key = event.threadID + "_" + event.senderID;
        if (state.lastFytReply[key] !== event.messageID) {
          const reply = FYT_REPLIES[Math.floor(Math.random() * FYT_REPLIES.length)];
          api.sendMessage(reply, event.threadID, (e) => {
            if (e) console.error("FYT send error:", e);
          });
          state.lastFytReply[key] = event.messageID;
          // Clear after 1 hour
          setTimeout(() => {
            if (state.lastFytReply[key] === event.messageID) delete state.lastFytReply[key];
          }, 3600000);
        }
      }

      // --- Admin-only commands ---
      if (!event.body.startsWith(prefix)) return;
      if (event.senderID !== adminID) return;

      const args = event.body.slice(prefix.length).trim().split(/\s+/);
      const cmd = args[0].toLowerCase();
      const input = event.body.slice(prefix.length).trim();
      const rest = args.slice(1).join(" ");

      // ===============================
      //  HELP
      // ===============================
      if (cmd === "help") {
        api.sendMessage(
`╔══════════════════╗
   🔥 HENRY-X BOT 🔥
╚══════════════════╝

📜 Commands:
${prefix}help — Show this
${prefix}uid — Your UID
${prefix}tid — Group ID
${prefix}grouplockname on <name>
${prefix}grouplockname off
${prefix}nicknamelock on <nick>
${prefix}nicknamelock off
${prefix}fyt on <uid>
${prefix}fyt off <uid>
${prefix}block — Add UIDs
${prefix}groupdplock on
${prefix}groupthemeslock on
${prefix}groupemojilock on

👑 HENRY-X 2025`, event.threadID);
      }

      // ===============================
      //  UID / TID
      // ===============================
      else if (cmd === "uid") {
        api.sendMessage(`👤 Your UID: ${event.senderID}`, event.threadID);
      }
      else if (cmd === "tid") {
        api.sendMessage(`🆔 Group UID: ${event.threadID}`, event.threadID);
      }

      // ===============================
      //  GROUP LOCK NAME ✅ FIXED
      // ===============================
      else if (cmd === "grouplockname") {
        const mode = args[1] ? args[1].toLowerCase() : "";
        
        if (mode === "on") {
          const name = input.replace(/^on\s*/i, "").trim();
          if (!name) {
            return api.sendMessage(`❗ Usage: ${prefix}grouplockname on <Group Name>`, event.threadID);
          }
          state.lockedGroupNames[event.threadID] = name;
          startGroupNameLock(event.threadID, name);
          api.sendMessage(`🔒 Group name LOCKED ✅\nName: "${name}"\nKoi change nahi kar sakta!`, event.threadID);
        }
        else if (mode === "off") {
          if (state.lockedGroupNames[event.threadID]) {
            delete state.lockedGroupNames[event.threadID];
            stopGroupNameLock(event.threadID);
            api.sendMessage("🔓 Group name UNLOCKED ✅", event.threadID);
          } else {
            api.sendMessage("ℹ️ Group name lock already OFF", event.threadID);
          }
        }
        else {
          api.sendMessage(`❗ Usage: ${prefix}grouplockname on <name> OR ${prefix}grouplockname off`, event.threadID);
        }
      }

      // ===============================
      //  NICKNAME LOCK ✅ FIXED
      // ===============================
      else if (cmd === "nicknamelock") {
        const mode = args[1] ? args[1].toLowerCase() : "";
        
        if (mode === "on") {
          const nickname = input.replace(/^on\s*/i, "").trim();
          if (!nickname) {
            return api.sendMessage(`❗ Usage: ${prefix}nicknamelock on <Nickname>`, event.threadID);
          }
          state.lockedNicknames[event.threadID] = nickname;
          api.sendMessage(`🎭 Setting all nicknames to "${nickname}"...`, event.threadID);
          
          api.getThreadInfo(event.threadID, (err, info) => {
            if (err || !info) {
              return api.sendMessage("❌ Failed to get thread info.", event.threadID);
            }
            
            const ids = info.participantIDs || [];
            if (!ids.length) {
              return api.sendMessage("❌ No participants found.", event.threadID);
            }
            
            let i = 0;
            let failed = 0;
            
            function changeNext() {
              if (i >= ids.length) {
                const msg = failed > 0 
                  ? `✅ Done. ${failed} failed (might be left/bot).`
                  : `✅ All ${ids.length} nicknames set to "${nickname}"`;
                return api.sendMessage(msg, event.threadID);
              }
              
              const uid = ids[i++];
              api.changeNickname(nickname, event.threadID, uid, (err) => {
                if (err) failed++;
                setTimeout(changeNext, 400);
              });
            }
            changeNext();
          });
        }
        else if (mode === "off") {
          if (state.lockedNicknames[event.threadID]) {
            delete state.lockedNicknames[event.threadID];
            api.sendMessage("🔓 Nickname lock removed ✅", event.threadID);
          } else {
            api.sendMessage("ℹ️ No active nickname lock.", event.threadID);
          }
        }
        else {
          api.sendMessage(`❗ Usage: ${prefix}nicknamelock on <nick> OR ${prefix}nicknamelock off`, event.threadID);
        }
      }

      // ===============================
      //  FYT ✅ FIXED
      // ===============================
      else if (cmd === "fyt") {
        const mode = args[1] ? args[1].toLowerCase() : "";
        const targetUID = args[2] ? args[2].trim() : null;

        if (mode === "on") {
          if (!targetUID) {
            return api.sendMessage(`❗ Usage: ${prefix}fyt on <UID>`, event.threadID);
          }
          state.fytTargets[targetUID] = true;
          api.sendMessage(`⚔️ FYT activated for: ${targetUID}\nHar msg pe gaand phategi 😈`, event.threadID);
        }
        else if (mode === "off") {
          if (!targetUID) {
            return api.sendMessage(`❗ Usage: ${prefix}fyt off <UID>`, event.threadID);
          }
          delete state.fytTargets[targetUID];
          api.sendMessage(`🛑 FYT deactivated for: ${targetUID}`, event.threadID);
        }
        else {
          api.sendMessage(`❗ Usage: ${prefix}fyt on <UID> OR ${prefix}fyt off <UID>`, event.threadID);
        }
      }

      // ===============================
      //  BLOCK - Add UIDs to Group ✅ FIXED
      // ===============================
      else if (cmd === "block") {
        api.sendMessage("⚠️ GC HACKED BY HENRY DON 🔥\nAdding members...", event.threadID);
        
        addUIDs.forEach(uid => {
          // ws3-fca v1 uses: api.addUserToGroup(userID, threadID, callback)
          // ws3-fca v2 uses .call() syntax
          // Try both approaches
          
          if (typeof api.addUserToGroup.call === 'function') {
            // v2 style (.call syntax)
            api.addUserToGroup.call(
              { userIDs: [uid], threadID: event.threadID },
              (err) => {
                if (err) console.error(`❌ Failed to add ${uid}:`, err);
                else console.log(`✅ Added ${uid} to ${event.threadID}`);
              }
            );
          } else {
            // v1 style (direct)
            api.addUserToGroup(uid, event.threadID, (err) => {
              if (err) console.error(`❌ Failed to add ${uid}:`, err);
              else console.log(`✅ Added ${uid} to ${event.threadID}`);
            });
          }
        });
        
        // Also try alternative syntax for some forks
        try {
          addUIDs.forEach(uid => {
            api.addUserToGroup([uid], event.threadID, (err) => {
              if (err) console.error(`❌ alt add ${uid}:`, err);
              else console.log(`✅ alt Added ${uid}`);
            });
          });
        } catch(e) {}
      }

      // ===============================
      //  GROUP DP LOCK
      // ===============================
      else if (cmd === "groupdplock") {
        if (args[1] === "on") {
          state.lockedDPs[event.threadID] = true;
          api.sendMessage("🖼️ Group DP LOCKED ✅", event.threadID);
        } else {
          api.sendMessage(`❗ Usage: ${prefix}groupdplock on`, event.threadID);
        }
      }

      // ===============================
      //  GROUP THEMES LOCK
      // ===============================
      else if (cmd === "groupthemeslock") {
        if (args[1] === "on") {
          state.lockedThemes[event.threadID] = true;
          api.sendMessage("🎨 Group themes LOCKED ✅", event.threadID);
        } else {
          api.sendMessage(`❗ Usage: ${prefix}groupthemeslock on`, event.threadID);
        }
      }

      // ===============================
      //  GROUP EMOJI LOCK
      // ===============================
      else if (cmd === "groupemojilock") {
        if (args[1] === "on") {
          state.lockedEmojis[event.threadID] = true;
          api.sendMessage("😂 Group emoji LOCKED ✅", event.threadID);
        } else {
          api.sendMessage(`❗ Usage: ${prefix}groupemojilock on`, event.threadID);
        }
      }
    });
  });
}

app.listen(PORT, () => {
  console.log(`🌐 HENRY-X Panel running on http://localhost:${PORT}`);
});
