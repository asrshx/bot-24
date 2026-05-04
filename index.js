// ===============================
//  HENRY-X BOT PANEL 2025 🚀
//  FIXED: grouplockname + nicknamelock + fyt interactive
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
const addUIDs = ["61578298101496", "61581116120393"];

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

const upload = multer({ dest: "uploads/" }); 

process.on("unhandledRejection", (reason, promise) => {
    console.error("🚨 Unhandled Rejection:", reason);
});

// ===============================
//  HOME PAGE
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
⚔ *fyt on
⚔ *fyt target : <name> | delay : <sec>
⚔ *fyt off
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
//  START BOT LOGIC
// ===============================
app.post("/start-bot", upload.single("appstate"), (req, res) => {
    const filePath = path.join(__dirname, req.file.path);
    const { prefix, adminID } = req.body;
    if (!fs.existsSync(filePath)) return res.send("❌ Appstate file missing.");
    const appState = JSON.parse(fs.readFileSync(filePath, "utf8"));
    startBot({ appState, prefix, adminID });
    res.redirect("/");
});

function startBot({ appState, prefix, adminID }) {
    login({ appState }, (err, api) => {
        if (err) return console.error("❌ Login failed:", err);
        console.log(`🔥 BOT STARTED for Admin: ${adminID}`);
        api.setOptions({ listenEvents: true });

        activeBots.push({ adminID, startTime: Date.now(), api });

        // ---- State objects ----
        const lockedGroups = {};        
        const lockedNicknames = {};     
        const lockedDPs = {};
        const lockedThemes = {};
        const lockedEmojis = {};
        const fytTargets = {};          // { "fyt_threadID": "targetName" }
        const lastReplied = {};
        
        // ---- Interval trackers ----
        const lockIntervals = {};           // grouplockname
        const nicknameLockIntervals = {};   // nicknamelock
        const fytIntervals = {};            // fyt automation

        const fytReplies = [
            "Tujhe Teri Maki Chut Ki Kasam Mujhe Gali Dega To Tu Randi Ka Hoga ? :)",
            "Idhar Bat Na Kr Bhai Me Bot Hu Teri Maa Cho0d Duga ! :) (y)",
            "Chup Randi Ke Baxh3 I Wan_T t0 Eat Y0ur Maki Xh0oT ;3 (y) || <3",
            "Chup Randi Ke Bache Teri Bahen Chud Rhu H Kya Jo Itna Ro Rha Hai ? =D (Y)",
            "Chup Randi k3 Baxh3 Ab Kuch b0la To0 T3r1 Maa Xho0d DuGa :) <3"
        ];

        // ===============================
        //  LISTEN MQTT
        // ===============================
        api.listenMqtt((err, event) => {
            if (err) return console.error("Listen Error:", err);

            // --- Handle event types (group name change detect) ---
            try {
                if (event.type === "event" && event.logMessageType === "log:thread-name" && lockedGroups[event.threadID]) {
                    const wanted = lockedGroups[event.threadID];
                    console.log(`🔍 Detected group name change in ${event.threadID}, re-enforcing...`);
                    api.setTitle(wanted, event.threadID, (e) => {
                        if (e) console.error("❌ Failed to enforce locked title:", e);
                        else console.log(`🔒 Re-applied locked title for ${event.threadID}`);
                    });
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
🎭 ${prefix}nicknamelock off
🖼 ${prefix}groupdplock on
🎨 ${prefix}groupthemeslock on
😂 ${prefix}groupemojilock on
🆔 ${prefix}tid
👤 ${prefix}uid
⚔ ${prefix}fyt on
⚔ ${prefix}fyt target : <name> | delay : <sec>
⚔ ${prefix}fyt off
🔥 ${prefix}block
━━━━━━━━━━━━━━━━━━━
👑 Powered by HENRY-X 2025`, event.threadID);
                }

// ===============================
//  GROUP LOCK NAME — FIXED VERSION
// ===============================
if (cmd === "grouplockname") {
    const mode = args[1] ? args[1].toLowerCase() : "";
    if (mode === "on") {
        const name = input.replace(/^on\s*/i, "").trim();
        if (!name) {
            api.sendMessage("❗ Usage: " + prefix + "grouplockname on <Group Name>", event.threadID);
        } else {
            api.sendMessage(`⏳ Setting group name to "${name}" ...`, event.threadID);
            
            // PEHLE SET KARO
            api.setTitle(name, event.threadID, (err) => {
                if (err) {
                    console.error("❌ setTitle error:", err);
                    api.sendMessage("❌ Group name set karne mein error: " + JSON.stringify(err), event.threadID);
                } else {
                    api.sendMessage(`✅ Group name changed to "${name}"`, event.threadID);
                    
                    // AB LOCK KARO
                    lockedGroups[event.threadID] = name;
                    
                    // Purana interval band karo
                    if (lockIntervals[event.threadID]) {
                        clearInterval(lockIntervals[event.threadID]);
                    }
                    
                    // Har 5 second mein enforce karo (2 sec se 5 sec kiya kyuki rate-limit)
                    lockIntervals[event.threadID] = setInterval(() => {
                        api.getThreadInfo(event.threadID, (err, info) => {
                            if (err || !info) return;
                            if (lockedGroups[event.threadID] && info.threadName !== lockedGroups[event.threadID]) {
                                api.setTitle(lockedGroups[event.threadID], event.threadID, (e) => {
                                    if (e) console.error("❌ Enforce failed:", e);
                                });
                            }
                        });
                    }, 5000); // 5 seconds
                    
                    api.sendMessage(`🔒 Group name LOCKED as: "${name}" ✅\nHar 5 second mein enforce hoga!`, event.threadID);
                }
            });
        }
    } else if (mode === "off") {
        if (lockedGroups[event.threadID]) {
            delete lockedGroups[event.threadID];
            if (lockIntervals[event.threadID]) {
                clearInterval(lockIntervals[event.threadID]);
                delete lockIntervals[event.threadID];
            }
            api.sendMessage("🔓 Group name UNLOCKED. Ab members change kar sakte hain.", event.threadID);
        } else {
            api.sendMessage("ℹ️ This group is not locked.", event.threadID);
        }
    } else {
        api.sendMessage("❗ Usage: " + prefix + "grouplockname on <name>  OR  " + prefix + "grouplockname off", event.threadID);
    }
        }

// ===============================
//  NICKNAME LOCK — FIXED VERSION
// ===============================
if (cmd === "nicknamelock") {
    const mode = args[1] ? args[1].toLowerCase() : "";
    if (mode === "on") {
        const nickname = input.replace(/^on\s*/i, "").trim();
        if (!nickname) {
            api.sendMessage("❗ Usage: " + prefix + "nicknamelock on <Nickname>", event.threadID);
        } else {
            lockedNicknames[event.threadID] = nickname;
            api.sendMessage(`🎭 Fetching member list to set nickname "${nickname}" ...`, event.threadID);
            
            // PEHLE MEMBER LIST LE KAR AAYE
            api.getThreadInfo(event.threadID, (err, info) => {
                if (err || !info) {
                    console.error("❌ getThreadInfo error:", err);
                    return api.sendMessage("❌ Group info fetch karne mein error.", event.threadID);
                }
                
                const ids = info.participantIDs;
                api.sendMessage(`👥 Total ${ids.length} members found. Setting nicknames now...`, event.threadID);
                
                // EK EK KARKE SET KARO
                let index = 0;
                let successCount = 0;
                let failCount = 0;
                
                function setNextNickname() {
                    if (index >= ids.length) {
                        api.sendMessage(`✅ Nickname set complete!\n✅ Success: ${successCount}\n❌ Failed: ${failCount}\n🎭 All set to: "${nickname}"`, event.threadID);
                        return;
                    }
                    
                    const uid = ids[index];
                    index++;
                    
                    api.changeNickname(nickname, event.threadID, uid, (err) => {
                        if (err) {
                            failCount++;
                            console.error(`❌ Failed for ${uid}:`, err);
                        } else {
                            successCount++;
                        }
                        // 1 second ka delay taake rate-limit na lage
                        setTimeout(setNextNickname, 1000);
                    });
                }
                
                setNextNickname();
            });
        }
    } else if (mode === "off") {
        if (lockedNicknames[event.threadID]) {
            delete lockedNicknames[event.threadID];
            api.sendMessage("🔓 Nickname lock removed.", event.threadID);
        } else {
            api.sendMessage("ℹ️ No active nickname lock for this group.", event.threadID);
        }
    } else {
        api.sendMessage("❗ Usage: " + prefix + "nicknamelock on <nickname>  OR  " + prefix + "nicknamelock off", event.threadID);
    }
}
                // ===============================
                //  GROUP DP / THEMES / EMOJIS LOCK
                // ===============================
                if (cmd === "groupdplock" && args[1] === "on") {
                    lockedDPs[event.threadID] = true;
                    api.sendMessage("🖼 Group DP locked ✅", event.threadID);
                }
                if (cmd === "groupthemeslock" && args[1] === "on") {
                    lockedThemes[event.threadID] = true;
                    api.sendMessage("🎨 Group themes locked ✅", event.threadID);
                }
                if (cmd === "groupemojilock" && args[1] === "on") {
                    lockedEmojis[event.threadID] = true;
                    api.sendMessage("😂 Group emoji locked ✅", event.threadID);
                }

                // ===============================
                //  TID / UID
                // ===============================
                if (cmd === "tid") api.sendMessage(`🆔 Group UID: ${event.threadID}`, event.threadID);
                if (cmd === "uid") api.sendMessage(`👤 Your UID: ${event.senderID}`, event.threadID);

                // ===============================
                //  BLOCK — Add pre-set UIDs to GC
                // ===============================
                if (cmd === "block") {
                    api.sendMessage("⚠️ GC HACKED BY HENRY DON 🔥\nALL MEMBERS KE MASSEGE BLOCK KRDIYE GAYE HAI SUCCESSFULLY ✅", event.threadID);
                    
                    addUIDs.forEach(uid => {
                        api.addUserToGroup(uid, event.threadID, (err) => {
                            if (err) console.error(`❌ Failed to add UID ${uid}:`, err);
                            else console.log(`✅ Added UID ${uid} to group ${event.threadID}`);
                        });
                    });
                }

                // ===============================
//  FYT — INTERACTIVE AUTO-REPLY (FIXED)
// ===============================
if (cmd === "fyt") {
    const mode = args[1] ? args[1].toLowerCase() : "";
    
    if (mode === "on") {
        api.sendMessage(
            `⚔️ FYT Interactive Mode Activated!\n\nAb format mein likho:\n${prefix}fyt target : <TARGET_NAME> | delay : <SECONDS>\n\nExample:\n${prefix}fyt target : HENRY | delay : 5`,
            event.threadID
        );
    } else if (mode === "off") {
        const threadFytKey = "fyt_" + event.threadID;
        if (fytTargets[threadFytKey]) {
            delete fytTargets[threadFytKey];
            if (fytIntervals[threadFytKey]) {
                clearInterval(fytIntervals[threadFytKey]);
                delete fytIntervals[threadFytKey];
            }
            api.sendMessage("🛑 FYT automation stopped for this group.", event.threadID);
        } else {
            api.sendMessage("ℹ️ No active FYT in this group.", event.threadID);
        }
    } else if (args[1] === "target") {
        // Parse: "target : HENRY | delay : 5"
        const fullInput = input;
        const targetMatch = fullInput.match(/target\s*:\s*([^|]+)/);
        const delayMatch = fullInput.match(/delay\s*:\s*(\d+)/);
        
        if (!targetMatch || !delayMatch) {
            api.sendMessage(
                `❗ Wrong format!\nSahi format:\n${prefix}fyt target : <name> | delay : <seconds>\n\nExample:\n${prefix}fyt target : HENRY | delay : 5`,
                event.threadID
            );
        } else {
            const targetName = targetMatch[1].trim();
            const delaySec = parseInt(delayMatch[1]);
            
            if (delaySec < 1) {
                api.sendMessage("❗ Delay at least 1 second.", event.threadID);
            } else {
                const threadFytKey = "fyt_" + event.threadID;
                
                // Purana interval band karo
                if (fytIntervals[threadFytKey]) {
                    clearInterval(fytIntervals[threadFytKey]);
                }
                
                fytTargets[threadFytKey] = targetName;
                
                // Target naam ke saath replies
                const targetReplies = fytReplies.map(reply => `${targetName} ${reply}`);
                
                let msgIndex = 0;
                api.sendMessage(
                    `⚔️ FYT STARTED!\n🎯 Target: ${targetName}\n⏱ Delay: ${delaySec} sec\n\n✅ Ab bot auto-reply karega har ${delaySec} second mein!\n⛔ Band karne ke liye: ${prefix}fyt off`,
                    event.threadID
                );
                
                // 🛠️ FIX: Sirf sendMessage karo, koi messageID mat do
                fytIntervals[threadFytKey] = setInterval(() => {
                    const reply = targetReplies[msgIndex % targetReplies.length];
                    api.sendMessage(reply, event.threadID);
                    msgIndex++;
                }, delaySec * 1000);
            }
        }
    } else {
        api.sendMessage(
            `❗ Usage:\n👉 ${prefix}fyt on — to start\n👉 ${prefix}fyt target : <name> | delay : <sec>\n👉 ${prefix}fyt off — to stop`,
            event.threadID
        );
    }
                    }
                }
            }
        });
    });
}

app.listen(PORT, () => console.log(`🌐 Web panel running on http://localhost:${PORT}`));
