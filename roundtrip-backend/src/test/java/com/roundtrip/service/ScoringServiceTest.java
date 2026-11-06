package com.roundtrip.service;

import com.roundtrip.model.Player;
import com.roundtrip.model.Round;
import com.roundtrip.model.RoundScoreSummary;
import com.roundtrip.model.Seat;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;

class ScoringServiceTest {

    private ScoringService scoringService;

    @BeforeEach
    void setUp() {
        scoringService = new ScoringService();
    }

    @Test
    @DisplayName("Penalty: If player asks 5 and gets less than 5, -5 is added to score")
    void testPenaltyWhenFailedToMakeBid() {
        // User exact rule: "if it ask 5 it not able pick 5 then -5 added to score"
        double scoreFailed = scoringService.calculateRoundScore(5, 4);
        assertEquals(-5.0, scoreFailed, "Failed bid of 5 with 4 tricks must yield -5.0");

        double scoreFailedZero = scoringService.calculateRoundScore(5, 0);
        assertEquals(-5.0, scoreFailedZero, "Failed bid of 5 with 0 tricks must yield -5.0");
    }

    @Test
    @DisplayName("Success: If player asks 5 and gets 5, +5 is added to score")
    void testSuccessExactBid() {
        double scoreExact = scoringService.calculateRoundScore(5, 5);
        assertEquals(5.0, scoreExact, "Achieving exact bid 5 must yield 5.0");
    }

    @Test
    @DisplayName("Success with Bonus: If player asks 5 and gets 7, +5.2 is added to score")
    void testSuccessExtraTricks() {
        double scoreOver = scoringService.calculateRoundScore(5, 7);
        assertEquals(5.2, scoreOver, "Achieving 7 tricks on a bid of 5 must yield 5.2");
    }

    @Test
    @DisplayName("Round Finalization across all 4 players")
    void testFinalizeRoundScores() {
        Player p1 = Player.builder().id("p1").displayName("Player 1").seat(Seat.SOUTH).totalScore(0.0).build();
        Player p2 = Player.builder().id("p2").displayName("Player 2").seat(Seat.EAST).totalScore(0.0).build();
        Player p3 = Player.builder().id("p3").displayName("Player 3").seat(Seat.NORTH).totalScore(0.0).build();
        Player p4 = Player.builder().id("p4").displayName("Player 4").seat(Seat.WEST).totalScore(0.0).build();

        Round round = Round.builder()
                .roundNumber(1)
                .build();
        round.getBids().put("p1", 5); // Bid 5, won 4 -> -5.0
        round.getTricksWon().put("p1", 4);

        round.getBids().put("p2", 3); // Bid 3, won 3 -> +3.0
        round.getTricksWon().put("p2", 3);

        round.getBids().put("p3", 2); // Bid 2, won 3 -> +2.1
        round.getTricksWon().put("p3", 3);

        round.getBids().put("p4", 3); // Bid 3, won 3 -> +3.0
        round.getTricksWon().put("p4", 3);

        RoundScoreSummary summary = scoringService.finalizeRoundScores(round, List.of(p1, p2, p3, p4));

        assertEquals(-5.0, summary.getScores().get("p1"));
        assertEquals(3.0, summary.getScores().get("p2"));
        assertEquals(2.1, summary.getScores().get("p3"));
        assertEquals(3.0, summary.getScores().get("p4"));

        assertEquals(-5.0, p1.getTotalScore());
        assertEquals(3.0, p2.getTotalScore());
        assertEquals(2.1, p3.getTotalScore());
        assertEquals(3.0, p4.getTotalScore());
    }
}
