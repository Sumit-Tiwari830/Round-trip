package com.roundtrip.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.util.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Round implements Serializable {
    private int roundNumber; // 1 to 5
    private Suit trumpSuit;
    @Builder.Default
    private List<TrumpDrawCard> trumpDrawCards = new ArrayList<>();
    private Seat dealerSeat;
    private Seat startingSeat;

    @Builder.Default
    private Map<String, Integer> bids = new HashMap<>(); // playerId -> bid

    @Builder.Default
    private Map<String, Integer> tricksWon = new HashMap<>(); // playerId -> won count

    @Builder.Default
    private Map<String, Double> roundScores = new HashMap<>(); // playerId -> round score

    @Builder.Default
    private List<Trick> completedTricks = new ArrayList<>();

    private Trick currentTrick;
    private boolean isCompleted;
    private long startedAt;
    private long completedAt;
}
