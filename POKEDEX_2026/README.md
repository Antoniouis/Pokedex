# Pokedex 2026 - Local Network Multiplayer

A full-stack Pokémon web application featuring a React Vite frontend and a Node.js/Express backend with Socket.io real-time turn-based multiplayer battles.

## Prerequisites
- A running MySQL container accessible on `localhost:3306` with user `root` and password `root`.
- Node.js installed

## 1. Poblar la base de datos (Database Setup & Seeding)
The project includes a robust script that creates the `pokedex_2026` database, defines tables for Pokémon and custom teams, and fetches the first 151 Pokémon straight from the PokeAPI.

1. Open your terminal and navigate to the backend folder:
   \`\`\`bash
   cd backend
   \`\`\`
2. Install dependencies:
   \`\`\`bash
   npm install
   \`\`\`
3. Run the initialization script to scaffold the schema:
   \`\`\`bash
   node init-db.js
   \`\`\`
4. Run the seed script to fetch and populate data:
   \`\`\`bash
   node seed.js
   \`\`\`

## 2. Cómo ejecutar backend y frontend
You must run both the backend server and the frontend React application simultaneously.

**Start the Backend:**
1. From the `backend` folder, start the node server:
   \`\`\`bash
   node server.js
   \`\`\`
2. It should log: \`Server is running on http://0.0.0.0:3001\`

**Start the Frontend:**
1. Open a new terminal and navigate to the frontend folder:
   \`\`\`bash
   cd frontend
   \`\`\`
2. Install dependencies:
   \`\`\`bash
   npm install
   \`\`\`
3. Start the Vite development server exposed to your local network:
   \`\`\`bash
   npm run dev -- --host 0.0.0.0
   \`\`\`
4. It should log local and network addresses (e.g., \`http://localhost:5173/\` and \`http://192.168.1.XX:5173/\`).

## 3. Cómo jugar desde otro dispositivo en red local (Local Network Play)
The coolest feature is that the servers are bound to `0.0.0.0`, allowing any device on your Wi-Fi network to connect and battle against you in real-time.

1. **Find your Host IP:** Look at the Vite terminal output under "Network:" to find your IP address (e.g., `192.168.1.100`).
2. **Access from Host PC:** Open `http://localhost:5173` on your PC.
3. **Access from Mobile/Other PC:** Connect the other device to the same Wi-Fi. Open their browser and go to `http://192.168.1.100:5173`.
4. **Prepare for Battle:**
   - Both players must navigate to the **Team Builder** tab and craft a team of 6 Pokémon, then click **Save Team**.
   - Player 1 goes to the **Battle Lobby** and clicks **Create Multiplayer Room**. A room code will be displayed.
   - Player 2 goes to the **Battle Lobby**, types the room code, and clicks **Join**.
5. The real-time battle via Socket.io will start automatically!
