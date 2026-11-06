package com.roundtrip.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.util.ArrayList;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Player implements Serializable {
    private String id;
    private String username;
    private String displayName;
    private String avatarUrl;
    private Seat seat;
    @com.fasterxml.jackson.annotation.JsonProperty("isBot")
    private boolean isBot;
    @com.fasterxml.jackson.annotation.JsonProperty("isConnected")
    private boolean isConnected;
    @com.fasterxml.jackson.annotation.JsonProperty("isHost")
    private boolean isHost;

    @Builder.Default
    private List<Card> hand = new ArrayList<>();

    // Round-specific transient fields
    private Integer currentBid; // null until submitted
    private boolean hasBid;
    @Builder.Default
    private int tricksWon = 0;
    @Builder.Default
    private double totalScore = 0.0;

    public void addCard(Card card) {
        if (hand == null) hand = new ArrayList<>();
        hand.add(card);
    }

    public boolean removeCard(Card card) {
        if (hand == null) return false;
        return hand.removeIf(c -> c.getId().equals(card.getId()));
    }

    public void sortHand() {
        if (hand != null) {
            hand.sort((c1, c2) -> {
                if (c1.getSuit() != c2.getSuit()) {
                    return c1.getSuit().compareTo(c2.getSuit());
                }
                return Integer.compare(c2.getValue(), c1.getValue()); // Descending rank
            });
        }
    }
}
