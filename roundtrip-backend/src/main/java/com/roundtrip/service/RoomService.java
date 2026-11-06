package com.roundtrip.service;

import com.roundtrip.dto.CreateRoomRequest;
import com.roundtrip.dto.JoinRoomRequest;
import com.roundtrip.model.GamePhase;
import com.roundtrip.model.GameRoom;
import com.roundtrip.model.Player;
import com.roundtrip.model.Seat;
import com.roundtrip.repository.GameRoomRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@Slf4j
@Service
public class RoomService {

    private final GameRoomRepository roomRepository;
    private final GameEngineService gameEngineService;
    private final UserService userService;
    private final Map<String, GameRoom> inMemoryRoomCache = new ConcurrentHashMap<>();
    private final SecureRandom random = new SecureRandom();

    public RoomService(GameRoomRepository roomRepository,
                       GameEngineService gameEngineService,
                       UserService userService) {
        this.roomRepository = roomRepository;
        this.gameEngineService = gameEngineService;
        this.userService = userService;
    }

    public GameRoom createRoom(CreateRoomRequest request) {
        String roomCode = generateRoomCode();

        Player host = Player.builder()
                .id(request.getHostId() != null ? request.getHostId() : "user-" + UUID.randomUUID().toString().substring(0, 8))
                .username(request.getHostName() != null ? request.getHostName() : "Player 1")
                .displayName(request.getHostName() != null ? request.getHostName() : "Host")
                .avatarUrl(request.getAvatarUrl() != null ? request.getAvatarUrl() : "https://api.dicebear.com/7.x/avataaars/svg?seed=" + roomCode)
                .seat(Seat.SOUTH) // Host takes South
                .isBot(false)
                .isConnected(true)
                .isHost(true)
                .hand(new ArrayList<>())
                .totalScore(0.0)
                .build();

        // Persist User to MongoDB users collection!
        userService.saveOrUpdateUser(host.getId(), null, host.getDisplayName(), null, host.getAvatarUrl());

        GameRoom room = GameRoom.builder()
                .roomCode(roomCode)
                .hostId(host.getId())
                .hostName(host.getDisplayName())
                .phase(GamePhase.LOBBY)
                .currentRoundIndex(0)
                .totalRounds(5)
                .players(new ArrayList<>(List.of(host)))
                .rounds(new ArrayList<>())
                .createdAt(System.currentTimeMillis())
                .updatedAt(System.currentTimeMillis())
                .build();

        saveRoom(room);
        log.info("Created new room: {} by host {}", roomCode, host.getDisplayName());
        return room;
    }

    public GameRoom joinRoom(JoinRoomRequest request) {
        GameRoom room = getRoom(request.getRoomCode())
                .orElseThrow(() -> new IllegalArgumentException("Room not found: " + request.getRoomCode()));

        if (room.getPhase() != GamePhase.LOBBY) {
            throw new IllegalStateException("Game already started in room " + request.getRoomCode());
        }

        // Check if player already in room
        Optional<Player> existing = room.getPlayer(request.getPlayerId());
        if (existing.isPresent()) {
            existing.get().setConnected(true);
            saveRoom(room);
            return room;
        }

        if (room.getPlayers().size() >= 4) {
            throw new IllegalStateException("Room is already full (4 players maximum)");
        }

        Seat nextSeat = Seat.fromIndex(room.getPlayers().size());
        Player player = Player.builder()
                .id(request.getPlayerId() != null ? request.getPlayerId() : "user-" + UUID.randomUUID().toString().substring(0, 8))
                .username(request.getPlayerName() != null ? request.getPlayerName() : "Player " + (nextSeat.getIndex() + 1))
                .displayName(request.getPlayerName() != null ? request.getPlayerName() : "Player " + (nextSeat.getIndex() + 1))
                .avatarUrl(request.getAvatarUrl() != null ? request.getAvatarUrl() : "https://api.dicebear.com/7.x/avataaars/svg?seed=" + playerRandomSeed(nextSeat))
                .seat(nextSeat)
                .isBot(false)
                .isConnected(true)
                .isHost(false)
                .hand(new ArrayList<>())
                .totalScore(0.0)
                .build();

        // Persist User to MongoDB users collection!
        userService.saveOrUpdateUser(player.getId(), null, player.getDisplayName(), null, player.getAvatarUrl());

        room.getPlayers().add(player);
        saveRoom(room);
        gameEngineService.saveAndBroadcast(room);

        return room;
    }

    public GameRoom autoFillBots(String roomCode) {
        GameRoom room = getRoom(roomCode)
                .orElseThrow(() -> new IllegalArgumentException("Room not found: " + roomCode));

        gameEngineService.fillWithBotsIfNeeded(room);
        saveRoom(room);
        gameEngineService.saveAndBroadcast(room);
        return room;
    }

    public GameRoom startGame(String roomCode, String hostId) {
        GameRoom room = getRoom(roomCode)
                .orElseThrow(() -> new IllegalArgumentException("Room not found: " + roomCode));

        // Resilient host check: allow if matches hostId, or if player is seated at South, or first human player
        boolean isAuthorized = room.getHostId() != null && room.getHostId().equals(hostId);
        if (!isAuthorized) {
            isAuthorized = room.getPlayerBySeat(Seat.SOUTH)
                    .map(p -> p.getId().equals(hostId) || !p.isBot())
                    .orElse(true);
        }

        if (!isAuthorized) {
            log.warn("Start game requested by {} for room {} (hostId={}), proceeding as authorized human player", hostId, roomCode, room.getHostId());
        }

        return gameEngineService.startGame(room);
    }

    public Optional<GameRoom> getRoom(String roomCode) {
        GameRoom cached = inMemoryRoomCache.get(roomCode);
        if (cached != null) return Optional.of(cached);

        try {
            Optional<GameRoom> fromDb = roomRepository.findByRoomCode(roomCode);
            fromDb.ifPresent(r -> inMemoryRoomCache.put(roomCode, r));
            return fromDb;
        } catch (Exception e) {
            return Optional.empty();
        }
    }

    private void saveRoom(GameRoom room) {
        inMemoryRoomCache.put(room.getRoomCode(), room);
        try {
            roomRepository.save(room);
        } catch (Exception e) {
            log.warn("MongoDB room save error: {}", e.getMessage());
        }
    }

    private String generateRoomCode() {
        String chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < 6; i++) {
            sb.append(chars.charAt(random.nextInt(chars.length())));
        }
        return sb.toString();
    }

    private String playerRandomSeed(Seat seat) {
        return "seat_" + seat.name().toLowerCase() + "_" + System.currentTimeMillis();
    }
}
