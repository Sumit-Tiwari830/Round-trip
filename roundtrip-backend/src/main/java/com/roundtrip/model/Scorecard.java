package com.roundtrip.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.io.Serializable;
import java.util.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "scorecards")
public class Scorecard implements Serializable {
    @Id
    private String id;
    private String roomCode;
    private long createdAt;
    private long finishedAt;

    @Builder.Default
    private List<PlayerSummary> players = new ArrayList<>();

    @Builder.Default
    private List<RoundScoreSummary> roundSummaries = new ArrayList<>(); // Rounds 1 to 5

    @Builder.Default
    private Map<String, Double> totalScores = new HashMap<>(); // playerId -> total

    private String winnerPlayerId;
    private String winnerPlayerName;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PlayerSummary implements Serializable {
        private String playerId;
        private String displayName;
        private Seat seat;
        private boolean isBot;
        private double totalScore;
        private int rank;
    }
}
