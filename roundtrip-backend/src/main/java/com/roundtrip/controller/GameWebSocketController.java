package com.roundtrip.controller;

import com.roundtrip.dto.BidRequest;
import com.roundtrip.dto.GameStateDto;
import com.roundtrip.dto.PlayCardRequest;
import com.roundtrip.model.GameRoom;
import com.roundtrip.service.GameEngineService;
import com.roundtrip.service.RoomService;
import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

@Slf4j
@Controller
public class GameWebSocketController {

    private final GameEngineService gameEngineService;
    private final RoomService roomService;

    public GameWebSocketController(GameEngineService gameEngineService, RoomService roomService) {
        this.gameEngineService = gameEngineService;
        this.roomService = roomService;
    }

    /**
     * WebSocket: Player submits secret bid.
     */
    @MessageMapping("/game/{roomCode}/bid")
    public void handleWsBid(@DestinationVariable String roomCode, @Payload BidRequest request) {
        log.info("Received WS Bid for room {}: Player {} bid {}", roomCode, request.getPlayerId(), request.getBid());
        gameEngineService.submitBid(roomCode, request.getPlayerId(), request.getBid());
    }

    /**
     * WebSocket: Player plays a card.
     */
    @MessageMapping("/game/{roomCode}/play")
    public void handleWsPlayCard(@DestinationVariable String roomCode, @Payload PlayCardRequest request) {
        log.info("Received WS Card Play for room {}: Player {} card {}", roomCode, request.getPlayerId(), request.getCardId());
        gameEngineService.playCard(roomCode, request.getPlayerId(), request.getCardId());
    }

    /**
     * WebSocket: Host starts game.
     */
    @MessageMapping("/game/{roomCode}/start")
    public void handleWsStartGame(@DestinationVariable String roomCode, @Payload String hostId) {
        log.info("Received WS Start Game for room {} by host {}", roomCode, hostId);
        roomService.startGame(roomCode, hostId.replace("\"", ""));
    }

    /**
     * WebSocket: Auto-fill bots.
     */
    @MessageMapping("/game/{roomCode}/bots")
    public void handleWsAutoFillBots(@DestinationVariable String roomCode) {
        log.info("Received WS Auto Fill Bots for room {}", roomCode);
        roomService.autoFillBots(roomCode);
    }

    // === REST Fallbacks for HTTP clients / Mobile ===

    @ResponseBody
    @PostMapping("/api/rooms/{roomCode}/bid")
    public ResponseEntity<GameStateDto> restSubmitBid(
            @PathVariable String roomCode,
            @Valid @RequestBody BidRequest request) {
        GameRoom room = gameEngineService.submitBid(roomCode, request.getPlayerId(), request.getBid());
        return ResponseEntity.ok(GameStateDto.fromRoom(room, request.getPlayerId()));
    }

    @ResponseBody
    @PostMapping("/api/rooms/{roomCode}/play")
    public ResponseEntity<GameStateDto> restPlayCard(
            @PathVariable String roomCode,
            @Valid @RequestBody PlayCardRequest request) {
        GameRoom room = gameEngineService.playCard(roomCode, request.getPlayerId(), request.getCardId());
        return ResponseEntity.ok(GameStateDto.fromRoom(room, request.getPlayerId()));
    }
}
