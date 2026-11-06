package com.roundtrip.controller;

import com.roundtrip.model.Scorecard;
import com.roundtrip.repository.ScorecardRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/scorecards")
@CrossOrigin(origins = "*")
public class ScorecardController {

    private final ScorecardRepository scorecardRepository;

    public ScorecardController(ScorecardRepository scorecardRepository) {
        this.scorecardRepository = scorecardRepository;
    }

    @GetMapping("/{roomCode}")
    public ResponseEntity<Scorecard> getScorecardByRoom(@PathVariable String roomCode) {
        return scorecardRepository.findByRoomCode(roomCode)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/recent")
    public ResponseEntity<List<Scorecard>> getRecentScorecards() {
        return ResponseEntity.ok(scorecardRepository.findTop10ByOrderByFinishedAtDesc());
    }

    @PostMapping("/offline")
    public ResponseEntity<Scorecard> saveOfflineScorecard(@RequestBody Scorecard scorecard) {
        if (scorecard.getCreatedAt() == 0) {
            scorecard.setCreatedAt(System.currentTimeMillis());
        }
        if (scorecard.getFinishedAt() == 0) {
            scorecard.setFinishedAt(System.currentTimeMillis());
        }
        if (scorecard.getRoomCode() == null || scorecard.getRoomCode().isBlank()) {
            scorecard.setRoomCode("OFFLINE-" + java.util.UUID.randomUUID().toString().substring(0, 6).toUpperCase());
        }
        Scorecard saved = scorecardRepository.save(scorecard);
        return ResponseEntity.ok(saved);
    }
}
