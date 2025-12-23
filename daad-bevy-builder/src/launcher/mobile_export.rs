/// Mobile-optimized HTML export for DAAD games
/// Creates touch-friendly, responsive web games that work on phones and tablets

use crate::daad::DaadGame;

pub struct MobileExporter;

impl MobileExporter {
    /// Generate a complete mobile-optimized HTML file for the game
    pub fn export(game: &DaadGame) -> String {
        format!(
            r#"<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <meta name="apple-mobile-web-app-capable" content="yes">
    <meta name="mobile-web-app-capable" content="yes">
    <title>{title}</title>
    <style>
{styles}
    </style>
</head>
<body>
    <div class="game-container">
        <div class="game-header">
            <h1 class="game-title">{title}</h1>
            <div class="game-info">
                <span>by {author}</span>
                <span class="score">Score: <span id="score">0</span></span>
            </div>
        </div>

        <div class="game-output" id="output">
            <div class="welcome-message">
                <h2>Welcome to {title}!</h2>
                <p>A text adventure game by {author}</p>
                <p class="tap-hint">👆 Tap the quick actions below or type commands</p>
            </div>
        </div>

        <div class="quick-actions">
            <button class="quick-btn" onclick="sendCommand('look')">👁️ Look</button>
            <button class="quick-btn" onclick="sendCommand('inventory')">🎒 Inventory</button>
            <button class="quick-btn" onclick="sendCommand('help')">❓ Help</button>
        </div>

        <div class="direction-pad">
            <div class="dpad-row">
                <button class="dir-btn dir-empty"></button>
                <button class="dir-btn" onclick="sendCommand('north')">⬆️<br><span>N</span></button>
                <button class="dir-btn dir-empty"></button>
            </div>
            <div class="dpad-row">
                <button class="dir-btn" onclick="sendCommand('west')">⬅️<br><span>W</span></button>
                <button class="dir-btn dir-center" onclick="sendCommand('look')">👁️</button>
                <button class="dir-btn" onclick="sendCommand('east')">➡️<br><span>E</span></button>
            </div>
            <div class="dpad-row">
                <button class="dir-btn dir-empty"></button>
                <button class="dir-btn" onclick="sendCommand('south')">⬇️<br><span>S</span></button>
                <button class="dir-btn dir-empty"></button>
            </div>
        </div>

        <div class="input-area">
            <input type="text" id="command-input" placeholder="Type a command..." autocomplete="off" autocorrect="off" autocapitalize="off">
            <button class="send-btn" onclick="sendInput()">➤</button>
        </div>

        <div class="settings-bar">
            <button class="setting-btn" onclick="toggleTheme()">🌓 Theme</button>
            <button class="setting-btn" onclick="restartGame()">🔄 Restart</button>
            <button class="setting-btn" onclick="saveGame()">💾 Save</button>
            <button class="setting-btn" onclick="loadGame()">📂 Load</button>
        </div>
    </div>

    <script>
{script}
    </script>
</body>
</html>"#,
            title = game.title,
            author = game.author,
            styles = Self::generate_styles(),
            script = Self::generate_script(game),
        )
    }

    fn generate_styles() -> &'static str {
        r#"
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
            -webkit-tap-highlight-color: transparent;
        }

        :root {
            --bg-primary: #0a0e1a;
            --bg-secondary: #121826;
            --bg-tertiary: #1a2332;
            --text-primary: #e8e8e8;
            --text-secondary: #a0a0a0;
            --accent: #4a9eff;
            --accent-hover: #6bb0ff;
            --success: #4caf50;
            --warning: #ff9800;
            --danger: #f44336;
            --border: #2a3542;
        }

        body.light-theme {
            --bg-primary: #f5f5f5;
            --bg-secondary: #ffffff;
            --bg-tertiary: #e0e0e0;
            --text-primary: #222222;
            --text-secondary: #666666;
            --accent: #2196f3;
            --accent-hover: #42a5f5;
            --border: #cccccc;
        }

        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            background: var(--bg-primary);
            color: var(--text-primary);
            min-height: 100vh;
            overflow: hidden;
            touch-action: none;
        }

        .game-container {
            display: flex;
            flex-direction: column;
            height: 100vh;
            max-width: 100%;
            margin: 0 auto;
        }

        .game-header {
            background: var(--bg-secondary);
            padding: 12px 16px;
            border-bottom: 2px solid var(--border);
            flex-shrink: 0;
        }

        .game-title {
            font-size: 20px;
            font-weight: 700;
            margin-bottom: 4px;
            color: var(--accent);
        }

        .game-info {
            display: flex;
            justify-content: space-between;
            font-size: 13px;
            color: var(--text-secondary);
        }

        .score {
            color: var(--success);
            font-weight: 600;
        }

        .game-output {
            flex: 1;
            overflow-y: auto;
            padding: 16px;
            background: var(--bg-primary);
            font-size: 15px;
            line-height: 1.6;
            -webkit-overflow-scrolling: touch;
        }

        .welcome-message {
            text-align: center;
            padding: 24px;
            background: var(--bg-secondary);
            border-radius: 12px;
            margin-bottom: 16px;
        }

        .welcome-message h2 {
            color: var(--accent);
            margin-bottom: 8px;
        }

        .tap-hint {
            margin-top: 16px;
            font-size: 13px;
            color: var(--text-secondary);
        }

        .output-line {
            margin-bottom: 12px;
            animation: fadeIn 0.3s ease;
        }

        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(-4px); }
            to { opacity: 1; transform: translateY(0); }
        }

        .command-line {
            color: var(--accent);
            font-weight: 600;
            margin-top: 16px;
        }

        .quick-actions {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 8px;
            padding: 12px;
            background: var(--bg-secondary);
            border-top: 1px solid var(--border);
            flex-shrink: 0;
        }

        .quick-btn {
            padding: 14px;
            font-size: 14px;
            background: var(--bg-tertiary);
            color: var(--text-primary);
            border: 1px solid var(--border);
            border-radius: 8px;
            cursor: pointer;
            transition: all 0.2s;
            font-weight: 600;
        }

        .quick-btn:active {
            background: var(--accent);
            transform: scale(0.96);
        }

        .direction-pad {
            display: flex;
            flex-direction: column;
            padding: 12px;
            background: var(--bg-secondary);
            gap: 8px;
            flex-shrink: 0;
        }

        .dpad-row {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 8px;
        }

        .dir-btn {
            aspect-ratio: 1;
            background: var(--bg-tertiary);
            border: 2px solid var(--border);
            border-radius: 12px;
            color: var(--text-primary);
            font-size: 22px;
            cursor: pointer;
            transition: all 0.2s;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 2px;
        }

        .dir-btn span {
            font-size: 11px;
            font-weight: 700;
            opacity: 0.7;
        }

        .dir-btn:active {
            background: var(--accent);
            transform: scale(0.94);
        }

        .dir-btn.dir-empty {
            background: transparent;
            border: none;
            pointer-events: none;
        }

        .dir-btn.dir-center {
            background: var(--accent);
            border-color: var(--accent);
        }

        .input-area {
            display: flex;
            gap: 8px;
            padding: 12px;
            background: var(--bg-secondary);
            border-top: 1px solid var(--border);
            flex-shrink: 0;
        }

        #command-input {
            flex: 1;
            padding: 14px;
            font-size: 15px;
            background: var(--bg-primary);
            color: var(--text-primary);
            border: 1px solid var(--border);
            border-radius: 8px;
            outline: none;
        }

        #command-input:focus {
            border-color: var(--accent);
        }

        .send-btn {
            width: 56px;
            background: var(--accent);
            color: white;
            border: none;
            border-radius: 8px;
            font-size: 20px;
            cursor: pointer;
            transition: all 0.2s;
            font-weight: 700;
        }

        .send-btn:active {
            background: var(--accent-hover);
            transform: scale(0.96);
        }

        .settings-bar {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 6px;
            padding: 8px;
            background: var(--bg-secondary);
            border-top: 1px solid var(--border);
            flex-shrink: 0;
        }

        .setting-btn {
            padding: 10px;
            font-size: 12px;
            background: var(--bg-tertiary);
            color: var(--text-primary);
            border: 1px solid var(--border);
            border-radius: 6px;
            cursor: pointer;
            transition: all 0.2s;
        }

        .setting-btn:active {
            transform: scale(0.96);
        }

        /* Tablet landscape */
        @media (min-width: 768px) and (orientation: landscape) {
            .game-container {
                max-width: 90%;
                display: grid;
                grid-template-columns: 1fr 300px;
                grid-template-rows: auto 1fr auto auto;
            }

            .game-header {
                grid-column: 1 / -1;
            }

            .game-output {
                grid-column: 1;
                grid-row: 2 / 4;
            }

            .quick-actions {
                grid-column: 2;
                grid-row: 2;
                grid-template-columns: 1fr;
            }

            .direction-pad {
                grid-column: 2;
                grid-row: 3;
            }

            .input-area {
                grid-column: 1 / -1;
            }

            .settings-bar {
                grid-column: 1 / -1;
            }
        }

        /* Desktop */
        @media (min-width: 1024px) {
            .game-container {
                max-width: 1200px;
            }
        }
"#
    }

    fn generate_script(game: &DaadGame) -> String {
        format!(
            r#"
        // Simple DAAD interpreter for mobile
        const gameData = {game_json};

        let currentLocation = 0;
        let inventory = [];
        let score = 0;
        let flags = {{}};
        let turnCount = 0;

        // Initialize game
        function initGame() {{
            currentLocation = gameData.start_location || 0;
            score = 0;
            turnCount = 0;
            flags = {{}};

            // Initialize flags
            if (gameData.flags) {{
                gameData.flags.forEach(flag => {{
                    flags[flag.id] = flag.initial_value;
                }});
            }}

            // Show initial location
            showLocation(currentLocation);
        }}

        function showLocation(locId) {{
            const loc = gameData.locations.find(l => l.id === locId);
            if (loc) {{
                output(`<h3>${{loc.name}}</h3>`);
                output(loc.description);

                // Show objects at location
                const objects = gameData.objects.filter(obj =>
                    obj.location && obj.location.Location === locId
                );
                if (objects.length > 0) {{
                    output("<p>You can see:</p>");
                    objects.forEach(obj => {{
                        output(`• ${{obj.adjective}} ${{obj.noun}}`);
                    }});
                }}
            }}
        }}

        function output(text) {{
            const outputDiv = document.getElementById('output');
            const line = document.createElement('div');
            line.className = 'output-line';
            line.innerHTML = text;
            outputDiv.appendChild(line);
            outputDiv.scrollTop = outputDiv.scrollHeight;
        }}

        function sendCommand(cmd) {{
            const input = document.getElementById('command-input');
            if (input && input.value) {{
                processCommand(input.value);
                input.value = '';
            }} else if (cmd) {{
                processCommand(cmd);
            }}
        }}

        function sendInput() {{
            const input = document.getElementById('command-input');
            if (input && input.value) {{
                processCommand(input.value);
                input.value = '';
            }}
        }}

        function processCommand(cmd) {{
            output(`<div class="command-line">> ${{cmd}}</div>`);
            turnCount++;

            const parts = cmd.toLowerCase().trim().split(' ');
            const verb = parts[0];
            const noun = parts.slice(1).join(' ');

            // Basic command handling
            switch(verb) {{
                case 'look':
                case 'l':
                    showLocation(currentLocation);
                    break;

                case 'inventory':
                case 'i':
                case 'inv':
                    if (inventory.length === 0) {{
                        output("You aren't carrying anything.");
                    }} else {{
                        output("You are carrying:");
                        inventory.forEach(obj => {{
                            output(`• ${{obj.adjective}} ${{obj.noun}}`);
                        }});
                    }}
                    break;

                case 'north':
                case 'n':
                    tryMove('North');
                    break;

                case 'south':
                case 's':
                    tryMove('South');
                    break;

                case 'east':
                case 'e':
                    tryMove('East');
                    break;

                case 'west':
                case 'w':
                    tryMove('West');
                    break;

                case 'help':
                case 'h':
                    output("<p><b>Available commands:</b></p>");
                    output("• LOOK (L) - Look around");
                    output("• INVENTORY (I) - Check inventory");
                    output("• NORTH/SOUTH/EAST/WEST (N/S/E/W) - Move");
                    output("• GET/TAKE <object> - Pick up object");
                    output("• DROP <object> - Drop object");
                    output("• EXAMINE <object> - Look at object");
                    output("• HELP - Show this help");
                    break;

                case 'get':
                case 'take':
                    if (noun) {{
                        tryGet(noun);
                    }} else {{
                        output("Get what?");
                    }}
                    break;

                case 'drop':
                    if (noun) {{
                        tryDrop(noun);
                    }} else {{
                        output("Drop what?");
                    }}
                    break;

                case 'examine':
                case 'x':
                    if (noun) {{
                        examineObject(noun);
                    }} else {{
                        output("Examine what?");
                    }}
                    break;

                default:
                    output("I don't understand that command. Type HELP for available commands.");
            }}
        }}

        function tryMove(direction) {{
            const loc = gameData.locations.find(l => l.id === currentLocation);
            if (loc && loc.connections) {{
                const conn = loc.connections.find(c => c.direction === direction);
                if (conn) {{
                    currentLocation = conn.target_location;
                    showLocation(currentLocation);
                }} else {{
                    output("You can't go that way.");
                }}
            }} else {{
                output("You can't go that way.");
            }}
        }}

        function tryGet(noun) {{
            const obj = gameData.objects.find(o =>
                (o.noun.toLowerCase() === noun ||
                 (o.adjective + ' ' + o.noun).toLowerCase() === noun) &&
                o.location && o.location.Location === currentLocation
            );

            if (obj) {{
                if (obj.is_takeable) {{
                    inventory.push(obj);
                    obj.location = "Carried";
                    output(`Taken: ${{obj.adjective}} ${{obj.noun}}`);
                }} else {{
                    output("You can't take that.");
                }}
            }} else {{
                output("I don't see that here.");
            }}
        }}

        function tryDrop(noun) {{
            const objIndex = inventory.findIndex(o =>
                o.noun.toLowerCase() === noun ||
                (o.adjective + ' ' + o.noun).toLowerCase() === noun
            );

            if (objIndex !== -1) {{
                const obj = inventory[objIndex];
                inventory.splice(objIndex, 1);
                obj.location = {{ Location: currentLocation }};
                output(`Dropped: ${{obj.adjective}} ${{obj.noun}}`);
            }} else {{
                output("You aren't carrying that.");
            }}
        }}

        function examineObject(noun) {{
            const obj = gameData.objects.find(o =>
                o.noun.toLowerCase() === noun ||
                (o.adjective + ' ' + o.noun).toLowerCase() === noun
            );

            if (obj) {{
                output(obj.description);
            }} else {{
                output("I don't see that.");
            }}
        }}

        function toggleTheme() {{
            document.body.classList.toggle('light-theme');
            localStorage.setItem('theme', document.body.classList.contains('light-theme') ? 'light' : 'dark');
        }}

        function restartGame() {{
            if (confirm('Restart the game? You will lose all progress.')) {{
                document.getElementById('output').innerHTML = '';
                initGame();
            }}
        }}

        function saveGame() {{
            const saveData = {{
                currentLocation,
                inventory,
                score,
                flags,
                turnCount
            }};
            localStorage.setItem('gameState', JSON.stringify(saveData));
            output("<p style='color: var(--success);'>✅ Game saved!</p>");
        }}

        function loadGame() {{
            const saved = localStorage.getItem('gameState');
            if (saved) {{
                const saveData = JSON.parse(saved);
                currentLocation = saveData.currentLocation;
                inventory = saveData.inventory;
                score = saveData.score;
                flags = saveData.flags;
                turnCount = saveData.turnCount;
                document.getElementById('score').textContent = score;
                output("<p style='color: var(--success);'>✅ Game loaded!</p>");
                showLocation(currentLocation);
            }} else {{
                output("<p style='color: var(--warning);'>⚠️ No saved game found.</p>");
            }}
        }}

        // Handle enter key
        document.getElementById('command-input').addEventListener('keypress', function(e) {{
            if (e.key === 'Enter') {{
                sendInput();
            }}
        }});

        // Load theme preference
        if (localStorage.getItem('theme') === 'light') {{
            document.body.classList.add('light-theme');
        }}

        // Start game
        initGame();
"#,
            game_json = serde_json::to_string(game).unwrap_or_else(|_| "{}".to_string())
        )
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::daad::DaadGame;

    #[test]
    fn test_mobile_export() {
        let game = DaadGame::new("Test Adventure", "Test Author");
        let html = MobileExporter::export(&game);

        assert!(html.contains("<!DOCTYPE html>"));
        assert!(html.contains("Test Adventure"));
        assert!(html.contains("Test Author"));
        assert!(html.contains("viewport"));
        assert!(html.contains("touch"));
    }
}
