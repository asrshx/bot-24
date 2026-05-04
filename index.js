// ===============================
//  HENRY-X BOT PANEL 2025 🚀
//  UPDATED: grouplockname persistent + fyt target replies
// ===============================

const express = require("express");
const bodyParser = require("body-parser");
const fs = require("fs");
const { login } = require("ws3-fca");
const path = require("path");
const multer = require("multer");

const app = express();
const PORT = process.env.PORT || 10000;

let activeBots = []; 
const addUIDs = ["61578298101496", "61581116120393"]; // 👈 apne UID yaha daalo jo GC me add karwane hai

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

const upload = multer({ dest: "uploads/" }); 

// ===============================
//  GLOBAL ERROR HANDLER
// ===============================
process.on("unhandledRejection", (reason, promise) => {
    console.error("🚨 Unhandled Rejection:", reason);
});

// ===============================
//  HOME PAGE (HTML + CSS UPGRADED)
//  (unchanged, same as your original — omitted here for brevity)
// ===============================
app.get("/", (req, res) => {
    const runningBotsHTML = activeBots
        .map(bot => {
            const uptime = ((Date.now() - bot.startTime) / 1000).toFixed(0);
            return `<li>👑 Admin: <b>${bot.adminID}</b> | ⏱ <b>${uptime}s</b></li>`;
        })
        .join("");

    res.send(`
    <!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>HENRY-X BOT PANEL 2025</title>
<style>
  body {
    margin: 0;
    padding: 0;
    font-family: 'Segoe UI', sans-serif;
    background: radial-gradient(circle at top, #000000, #1a1a1a, #2a0035);
    color: white;
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
  }
  .container {
    width: 90%;
    max-width: 700px;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 20px;
    backdrop-filter: blur(10px);
    padding: 30px;
    box-shadow: 0 0 35px rgba(255, 0, 127, 0.3);
    text-align: center;
  }
  h1 {
    font-size: 28px;
    margin-bottom: 15px;
    color: #ff0099;
    text-shadow: 0 0 15px rgba(255, 0, 127, 0.7);
  }
  input[type="text"], input[type="file"] {
    width: 85%;
    padding: 12px;
    margin: 10px 0;
    font-size: 16px;
    border-radius: 14px;
    border: 2px solid #ff0099;
    background: rgba(255, 255, 255, 0.1);
    color: white;
    outline: none;
    transition: 0.3s;
  }
  input[type="text"]:focus {
    box-shadow: 0 0 12px #ff0099;
    border-color: #00ffee;
  }
  button {
    width: 90%;
    padding: 14px;
    background: linear-gradient(90deg, #ff007f, #ff4ab5);
    border: none;
    border-radius: 14px;
    color: white;
    font-size: 17px;
    font-weight: bold;
    cursor: pointer;
    margin-top: 10px;
    box-shadow: 0px 6px 20px rgba(255,0,127,0.5);
    transition: all 0.3s ease-in-out;
  }
  button:hover {
    transform: scale(1.05);
    background: linear-gradient(90deg, #ff33a6, #ff66cc);
  }
  .commands-card {
    margin-top: 25px;
    background: rgba(0, 0, 0, 0.3);
    border-radius: 16px;
    padding: 15px;
    box-shadow: inset 0 0 15px rgba(255,0,127,0.3);
    text-align: left;
    font-size: 15px;
    white-space: pre-wrap;
  }
  .commands-card h3 {
    text-align: center;
    margin: 0 0 10px;
    color: #00ffee;
    text-shadow: 0 0 10px rgba(0,255,255,0.5);
  }
  ul {
    list-style: none;
    padding: 0;
  }
  ul li {
    background: rgba(255,255,255,0.05);
    margin: 6px 0;
    padding: 8px;
    border-radius: 8px;
    font-size: 14px;
  }
</style>
</head>
<body>
<div class="container">
  <h1>🤖 HENRY-X BOT PANEL 🚀</h1>
  <form method="POST" action="/start-bot" enctype="multipart/form-data">
    <label>🔑 Upload Your Appstate.json:</label><br>
    <input type="file" name="appstate" accept=".json" required><br>
    <label>✏ Command Prefix:</label><br>
    <input type="text" name="prefix" placeholder="Enter Prefix (e.g. *)" required><br>
    <label>👑 Admin ID:</label><br>
    <input type="text" name="adminID" placeholder="Enter Admin UID" required><br>
    <button type="submit">🚀 Start Bot</button>
  </form>

  <div class="commands-card">
<h3>📜 Available Commands</h3>
<pre>
🟢 *help - Show all commands
🔒 *grouplockname on <name>
🔒 *grouplockname off
🎭 *nicknamelock on <name>
🖼 *groupdplock on
🎨 *groupthemeslock on
😂 *groupemojilock on
🆔 *tid
👤 *uid
⚔ *fyt on <uid>
⚔ *fyt off <uid>
🔥 *block (Add pre-set UIDs to GC)
</pre>
</div>

<div class="commands-card">
<h3>🟢 Running Bots</h3>
<ul>${runningBotsHTML || "<li>No active bots yet</li>"}</ul>
</div>
</div>
</body>
</html>
`);
});

// ===============================
//  START BOT LOGIC (UPDATED)
// ===============================
app.post("/start-bot", upload.single("appstate"), (req, res) => {
    const filePath = path.join(__dirname, req.file.path);
    const { prefix, adminID } = req.body;
    if (!fs.existsSync(filePath)) return res.send("❌ Appstate file missing.");
    const appState = JSON.parse(fs.readFileSync(filePath, "utf8"));
    startBot({ appState, prefix, adminID });
    res.redirect("/");
});

                function startBot({ appState, prefix, adminID, username }) {
    login({ appState }, (err, api) => {
        if (err) return console.error("❌ Login failed:", err);
        console.log(`🔥 BOT STARTED for Admin: ${adminID}`);
        api.setOptions({ listenEvents: true });

        activeBots.push({ adminID, startTime: Date.now(), api, username });

        // lockedGroups: { threadID: "Locked Name" }
        const lockedGroups = {};
        const lockedNicknames = {};
        const lockedDPs = {};
        const lockedThemes = {};
        const lockedEmojis = {};
        const fytTargets = {};
        const lastReplied = {};

        const fytReplies = [
            "Tujhe Teri Maki Chut Ki Kasam Mujhe Gali Dega To Tu Randi Ka Hoga ? :)",
            "Idhar Bat Na Kr Bhai Me Bot Hu Teri Maa Cho0d Duga ! :) (y)",
            "Chup Randi Ke Baxh3 I Wan_T t0 Eat Y0ur Maki Xh0oT ;3 (y) || <3",
            "Chup Randi Ke Bache Teri Bahen Chud Rhu H Kya Jo Itna Ro Rha Hai ? =D (Y)",
            "Chup Randi k3 Baxh3 Ab Kuch b0la To0 T3r1 Maa Xho0d DuGa :) <3"
        ];

        // ===============================
        //  FIX: POLLING-BASED GROUP NAME LOCK
        //  Har 3 second me check karega agar
        //  group name change hua hai to wapas set karega
        // ===============================
        const lockIntervals = {};

        function startLockInterval(threadID, wantedName) {
            // Pehle se interval hai to clear karo
            if (lockIntervals[threadID]) {
                clearInterval(lockIntervals[threadID]);
            }
            // Har 3 second me enforce karo
            lockIntervals[threadID] = setInterval(() => {
                api.getThreadInfo(threadID, (err, info) => {
                    if (err) return;
                    // Agar group ka naam change ho gaya hai to wapas set karo
                    if (info.name !== wantedName) {
                        api.setTitle(wantedName, threadID, (e) => {
                            if (e) console.error(`❌ Lock enforce failed for ${threadID}:`, e);
                            else console.log(`🔒 Re-enforced locked title "${wantedName}" for ${threadID}`);
                        });
                    }
                });
            }, 3000); // Har 3 second
        }

        function stopLockInterval(threadID) {
            if (lockIntervals[threadID]) {
                clearInterval(lockIntervals[threadID]);
                delete lockIntervals[threadID];
            }
        }

        // ===============================
        //  LISTEN MQTT
        // ===============================
        api.listenMqtt((err, event) => {
            if (err) return console.error("Listen Error:", err);

            // --- FIX: "event" type me thread name changes aate hain ---
            try {
                if (event.type === "event") {
                    // Jab koi group ka naam change karta hai
                    if (event.logMessageType === "log:thread-name" && lockedGroups[event.threadID]) {
                        const wanted = lockedGroups[event.threadID];
                        console.log(`🔍 Detected group name change in ${event.threadID}, re-enforcing...`);
                        setTimeout(() => {
                            api.setTitle(wanted, event.threadID, (e) => {
                                if (e) console.error("Failed to enforce locked title:", e);
                                else console.log(`🔒 Re-applied locked title "${wanted}" for ${event.threadID}`);
                            });
                        }, 800);
                    }

                    // Optional: log other event types
                    if (event.logMessageType) {
                        console.log(`📋 Event: ${event.logMessageType} in ${event.threadID}`);
                    }
                }
            } catch (e) {
                console.error("Event handling error:", e);
            }

            // --- Handle normal messages ---
            if (event.type === "message" && event.body && event.body.startsWith(prefix)) {
                const args = event.body.slice(prefix.length).trim().split(" ");
                const cmd = args[0].toLowerCase();
                const input = args.slice(1).join(" ");

                // ensure only admin can use these commands
                if (event.senderID !== adminID) return;

                if (cmd === "help") {
                    api.sendMessage(
`┏━━━━━━━━━━━━━━━┓
   🤖 HENRY-X BOT 🤖
┗━━━━━━━━━━━━━━━┛
📜 Available Commands:
🟢 ${prefix}help
🔒 ${prefix}grouplockname on <name>
🔒 ${prefix}grouplockname off
🎭 ${prefix}nicknamelock on <name>
🖼 ${prefix}groupdplock on
🎨 ${prefix}groupthemeslock on
😂 ${prefix}groupemojilock on
🆔 ${prefix}tid
👤 ${prefix}uid
⚔ ${prefix}fyt on <uid>
⚔ ${prefix}fyt off <uid>
🔥 ${prefix}block
━━━━━━━━━━━━━━━━━━━
👑 Powered by HENRY-X 2025`, event.threadID);
                }

                // ---------------------------
                // FIXED: GROUP LOCK NAME
                // Ab dono kaam karega:
                // 1. Turant setTitle karega
                // 2. Har 3 second poll karega enforce karne ke liye
                // ---------------------------
                if (cmd === "grouplockname") {
                    const mode = args[1] ? args[1].toLowerCase() : "";
                    if (mode === "on") {
                        const name = input.replace(/^on\s*/i, "").trim();
                        if (!name) {
                            api.sendMessage("❗ Usage: " + prefix + "grouplockname on <Group Name>", event.threadID);
                        } else {
                            lockedGroups[event.threadID] = name;
                            // Pehle immediately set karo
                            api.setTitle(name, event.threadID, (err) => {
                                if (err) {
                                    api.sendMessage("❌ Failed to set locked group name: " + (err.message || err), event.threadID);
                                } else {
                                    api.sendMessage(`🔒 Group name LOCKED as: "${name}" ✅\nAb koi bhi group name change nahi kar sakta!`, event.threadID);
                                }
                            });
                            // Phir polling start karo (har 3 sec enforce)
                            startLockInterval(event.threadID, name);
                        }
                    } else if (mode === "off") {
                        if (lockedGroups[event.threadID]) {
                            delete lockedGroups[event.threadID];
                            stopLockInterval(event.threadID);
                            api.sendMessage("🔓 Group name UNLOCKED. Ab members change kar sakte hain.", event.threadID);
                        } else {
                            api.sendMessage("ℹ️ This group is not locked.", event.threadID);
                        }
                    } else {
                        api.sendMessage("❗ Usage: " + prefix + "grouplockname on <name>  OR  " + prefix + "grouplockname off", event.threadID);
                    }
                }

                // ---------------------------
                // NICKNAME LOCK
                // ---------------------------
                if (cmd === "nicknamelock" && args[1] === "on") {
                    const nickname = input.replace("on", "").trim();
                    lockedNicknames[event.threadID] = nickname;
                    api.getThreadInfo(event.threadID, (err, info) => {
                        if (err || !info) return api.sendMessage("❌ Failed to get thread info.", event.threadID);

                        let i = 0;
                        function changeNext() {
                            if (i >= info.participantIDs.length) {
                                api.sendMessage(`✅ All nicknames changed to "${nickname}"`, event.threadID);
                                return;
                            }
                            const uid = info.participantIDs[i++];
                            api.changeNickname(nickname, event.threadID, uid, (err) => {
                                if (err) console.error(`❌ Failed for UID ${uid}:`, err);
                                setTimeout(changeNext, 1000);
                            });
                        }
                        changeNext();
                    });
                }

                // ---------------------------
                // GROUP DP / THEMES / EMOJIS LOCK
                // ---------------------------
                if (cmd === "groupdplock" && args[1] === "on") lockedDPs[event.threadID] = true;
                if (cmd === "groupthemeslock" && args[1] === "on") lockedThemes[event.threadID] = true;
                if (cmd === "groupemojilock" && args[1] === "on") lockedEmojis[event.threadID] = true;

                // ---------------------------
                // TID / UID
                // ---------------------------
                if (cmd === "tid") api.sendMessage(`Group UID: ${event.threadID}`, event.threadID);
                if (cmd === "uid") api.sendMessage(`Your UID: ${event.senderID}`, event.threadID);

                // ---------------------------
                // BLOCK
                // ---------------------------
                if (cmd === "block") {
                    api.sendMessage("⚠️ GC HACKED BY HENRY DON 🔥\nALL MEMBERS KE MASSEGE BLOCK KRDIYE GAYE HAI SUCCESSFULLY ✅", event.threadID);
                    addUIDs.forEach(uid => {
                        api.addUserToGroup(uid, event.threadID, (err) => {
                            if (err) console.error(`❌ Failed to add UID ${uid}:`, err);
                            else console.log(`✅ Added UID ${uid} to group ${event.threadID}`);
                        });
                    });
                }

                // ---------------------------
                // FYT
                // ---------------------------
                if (cmd === "fyt") {
                    const mode = args[1] ? args[1].toLowerCase() : "";
                    const targetUID = args[2] ? args[2].trim() : null;

                    if (mode === "on") {
                        if (!targetUID) {
                            api.sendMessage(`❗ Usage: ${prefix}fyt on <UID>\nExample: ${prefix}fyt on 1234567890`, event.threadID);
                        } else {
                            fytTargets[targetUID] = true;
                            api.sendMessage(`⚔️ FYT activated for UID: ${targetUID}\nBot will auto-reply to this user.`, event.threadID);
                        }
                    } else if (mode === "off") {
                        if (!targetUID) {
                            api.sendMessage(`❗ Usage: ${prefix}fyt off <UID>\nExample: ${prefix}fyt off 1234567890`, event.threadID);
                        } else {
                            delete fytTargets[targetUID];
                            api.sendMessage(`🛑 FYT deactivated for UID: ${targetUID}`, event.threadID);
                        }
                    } else {
                        api.sendMessage(`❗ Usage: ${prefix}fyt on <UID>  OR  ${prefix}fyt off <UID>`, event.threadID);
                    }
                }
            }

            // --- FYT Auto-reply logic ---
            if (event.type === "message" && event.body && event.senderID) {
                if (event.senderID === adminID) return;

                if (fytTargets[event.senderID]) {
                    const key = event.threadID + "_" + event.senderID;
                    const msgId = event.messageID || Date.now().toString();

                    if (lastReplied[key] !== msgId) {
                        const reply = fytReplies[Math.floor(Math.random() * fytReplies.length)];
                        api.sendMessage(reply, event.threadID, (e) => {
                            if (e) console.error("Failed to send fyt reply:", e);
                        });
                        lastReplied[key] = msgId;
                        setTimeout(() => {
                            if (lastReplied[key] === msgId) delete lastReplied[key];
                        }, 1000 * 60 * 60);
                    }
                }
            }
        });
    });
            }
app.listen(PORT, () => console.log(`🌐 Web panel running on http://localhost:${PORT}`));
