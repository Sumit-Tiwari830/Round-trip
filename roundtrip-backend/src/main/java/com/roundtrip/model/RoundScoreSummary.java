package com.roundtrip.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.util.HashMap;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RoundScoreSummary implements Serializable {
    private int roundNumber;
    private Suit trumpSuit;
    @Builder.Default
    private Map<String, Integer> bids = new HashMap<>(); // playerId -> bid
    @Builder.Default
    private Map<String, Integer> tricksWon = new HashMap<>(); // playerId -> won
    @Builder.Default
    private Map<String, Double> scores = new HashMap<>(); // playerId -> score (+X or -X)
}
