# ♠️♥️ RoundTrip — 4-Player Multiplayer Card Arena ♣️♦️

**RoundTrip** is an authentic, production-grade 4-player online trick-taking card game built with a decoupled architecture:
- **Backend:** **Spring Boot 4 / Java 21** with Spring Data MongoDB, WebSocket (STOMP over SockJS), and Clerk JWT authentication.
- **Frontend:** **React 18 + TypeScript + Vite + Tailwind CSS** with Clerk Auth integration, live audio synthesis, and interactive casino felt table.
- **AI Engine:** Intelligent Bots that automatically fill missing seats and play legal, strategic tricks.

---

## 🎯 Official Game Rules & Mechanics

1. **4 Seats (South, East, North, West):**
   - South is your seat.
   - Any seat not taken by a real player is filled by an intelligent **Bot AI** (CyberAce Bot, Hukum King, etc.).
2. **Purely Random 52-Card Distribution:**
   - Shuffled using cryptographically secure RNG (`java.security.SecureRandom`).
   - 13 cards dealt to each of the 4 players ($13 \times 4 = 52$).
3. **4-Card Trump Deciding Reveal:**
   - At the beginning of each round, 4 random cards are dealt (one representing each player).
   - The suit of the **highest card** becomes the **Trump (Hukum)** suit for that round!
4. **Secret Blind Bidding Phase:**
   - Each player predicts how many tricks (hands, from 1 to 13) they will win.
   - **Privacy Rule:** Opponents' bids are strictly masked as `[🔒 Locked In]` until all 4 players (human + bot) have submitted.
   - Once all 4 submit, all bids reveal simultaneously on the table and scorecard!
5. **Trick Playing (13 Tricks per Round):**
   - Players must follow the lead suit if they hold a card of that suit.
   - If void in the lead suit, players can cut with a Trump card or discard.
   - Highest trump (or highest lead suit card) takes the trick and leads the next one.
6. **5 Rounds Total & Strict Penalty Scoring:**
   - Exactly **5 rounds** in a full match.
   - **Penalty Rule:** If a player bids $X$ and achieves $< X$ tricks, a penalty of **$-X$** is added to their score (e.g., if you bid 5 and win 4, your score is **$-5$**).
   - **Success Rule:** If a player achieves $\ge X$ tricks, they earn **$+X + 0.1 \times (\text{tricks won} - X)$** (e.g., bid 5 and won 6 yields **$+5.1$**).
7. **Online Scorecard:**
   - Live round-by-round and cumulative leaderboard tracking player ranks (🥇 1st, 🥈 2nd, 🥉 3rd, 4th).

---

## 📁 Project Architecture (Decoupled)

```
taas/
├── roundtrip-backend/           # Spring Boot 4 / Java 21 Backend
│   ├── src/main/java/com/roundtrip/
│   │   ├── RoundTripApplication.java
│   │   ├── config/              # WebSocketConfig (STOMP), SecurityConfig, CorsConfig
│   │   ├── controller/          # RoomRestController, GameWebSocketController, ScorecardController
│   │   ├── dto/                 # GameStateDto, BidRequest, PlayCardRequest
│   │   ├── model/               # Card, Suit, Rank, Player, GameRoom, Round, Trick, Scorecard
│   │   ├── repository/          # GameRoomRepository, ScorecardRepository
│   │   ├── security/            # ClerkJwtService, ClerkAuthenticationFilter
│   │   └── service/             # GameEngineService, DeckService, TrumpService, ScoringService, BotAiService
│   ├── pom.xml
│   ├── .env.example
│   └── Dockerfile
│
├── roundtrip-frontend/          # React 18 / TypeScript / Vite / Tailwind
│   ├── src/
│   │   ├── components/
│   │   │   ├── Logo.tsx         # High-voltage vector SVG brand logo
│   │   │   ├── GameTable.tsx    # 4-player casino card table
│   │   │   ├── PlayingCard.tsx  # Interactive responsive card component
│   │   │   ├── TrumpRevealBanner.tsx # 4-card trump deciding draw display
│   │   │   ├── SecretBidModal.tsx # Blind bidding dialog
│   │   │   ├── ScorecardBoard.tsx # 5-round live scorecard & calculation board
│   │   │   ├── MatchOverModal.tsx # Champion podium & confetti
│   │   │   ├── Lobby.tsx        # Room creation & bot autofill
│   │   │   └── Navbar.tsx       # Clerk auth & sound controls
│   │   ├── services/
│   │   │   ├── api.ts           # REST API client
│   │   │   └── websocket.ts     # STOMP / SockJS client with auto-reconnect
│   │   ├── audio/sounds.ts      # Web Audio API synthesizer
│   │   └── context/GameContext.tsx
│   ├── .env.example
│   └── Dockerfile
│
├── docker-compose.yml           # Production Docker orchestration (Mongo + Backend + Frontend)
└── README.md
```

---

## 🚀 How to Run in WSL Ubuntu

### Step 1: Start the Backend (Spring Boot)
Open a WSL terminal in `~/taas/roundtrip-backend`:
```bash
cd ~/taas/roundtrip-backend
./mvnw spring-boot:run
```
> The backend will start on `http://localhost:8080`.
> - If MongoDB is not yet started, an in-memory caching fallback ensures the server runs without crashing.
> - To run MongoDB locally in WSL: `sudo apt-get install -y mongodb-org && sudo systemctl start mongod` or launch `docker-compose up mongodb -d`.

### Step 2: Start the Frontend (React + Vite)
In a second WSL terminal in `~/taas/roundtrip-frontend`:
```bash
cd ~/taas/roundtrip-frontend
npm run dev
```
> The frontend will start on `http://localhost:5173`. Open your Windows browser and navigate to `http://localhost:5173`.

---

## 🔑 Clerk Authentication Setup

Both frontend and backend include Clerk Authentication support:

### Frontend (`roundtrip-frontend/.env`):
```env
VITE_CLERK_PUBLISHABLE_KEY=pk_test_Y2xlcmsuZXhhbXBsZS5jb20k
VITE_API_URL=http://localhost:8080
VITE_WS_URL=http://localhost:8080/ws-roundtrip
```
*(Replace `VITE_CLERK_PUBLISHABLE_KEY` with your key from [Clerk Dashboard](https://dashboard.clerk.com). When not set or set to dummy, the app automatically runs in seamless Guest/Dev mode so you can test right away!)*

### Backend (`roundtrip-backend/.env`):
```env
MONGODB_URI=mongodb://localhost:27017/roundtrip
CLERK_JWKS_URL=https://<your-clerk-domain>/.well-known/jwks.json
CLERK_ISSUER=https://<your-clerk-domain>
```

---

## 📱 Future Mobile App (React Native / Flutter)
Because the backend is decoupled with clean REST endpoints (`/api/rooms/**`, `/api/scorecards/**`) and standard WebSocket STOMP (`/ws-roundtrip/websocket`), you can connect a mobile app (React Native / Expo or Flutter) directly by reusing the exact same DTOs and WebSocket topics without modifying the backend!

---

## 🧪 Running Unit Tests
To run the automated scoring and game engine verification tests:
```bash
cd ~/taas/roundtrip-backend
./mvnw test
```
All 5 tests (exact scoring penalty, trick-taking rules, 52-card distribution) will pass with 0 errors.
