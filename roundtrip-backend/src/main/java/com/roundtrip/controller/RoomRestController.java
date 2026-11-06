package com.roundtrip.controller;

import com.roundtrip.dto.CreateRoomRequest;
import com.roundtrip.dto.GameStateDto;
import com.roundtrip.dto.JoinRoomRequest;
import com.roundtrip.model.GameRoom;
import com.roundtrip.service.RoomService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/rooms")
@CrossOrigin(origins = "*")
public class RoomRestController {

    private final RoomService roomService;

    public RoomRestController(RoomService roomService) {
        this.roomService = roomService;
    }

    @PostMapping
    public ResponseEntity<GameStateDto> createRoom(@RequestBody(required = false) CreateRoomRequest request) {
        if (request == null) {
            request = new CreateRoomRequest();
        }
        GameRoom room = roomService.createRoom(request);
        return ResponseEntity.ok(GameStateDto.fromRoom(room, room.getHostId()));
    }

    @GetMapping("/{roomCode}")
    public ResponseEntity<GameStateDto> getRoom(
            @PathVariable String roomCode,
            @RequestParam(required = false) String playerId) {
        return roomService.getRoom(roomCode)
                .map(room -> ResponseEntity.ok(GameStateDto.fromRoom(room, playerId)))
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/{roomCode}/join")
    public ResponseEntity<GameStateDto> joinRoom(
            @PathVariable String roomCode,
            @Valid @RequestBody JoinRoomRequest request) {
        request.setRoomCode(roomCode);
        GameRoom room = roomService.joinRoom(request);
        return ResponseEntity.ok(GameStateDto.fromRoom(room, request.getPlayerId()));
    }

    @PostMapping("/{roomCode}/bots")
    public ResponseEntity<GameStateDto> fillWithBots(
            @PathVariable String roomCode,
            @RequestParam(required = false) String playerId) {
        GameRoom room = roomService.autoFillBots(roomCode);
        return ResponseEntity.ok(GameStateDto.fromRoom(room, playerId));
    }

    @PostMapping("/{roomCode}/start")
    public ResponseEntity<GameStateDto> startGame(
            @PathVariable String roomCode,
            @RequestParam String hostId) {
        GameRoom room = roomService.startGame(roomCode, hostId);
        return ResponseEntity.ok(GameStateDto.fromRoom(room, hostId));
    }
}
