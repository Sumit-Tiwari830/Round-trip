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
public class Trick implements Serializable {
    private int trickNumber; // 1 to 13
    private Seat leadSeat;
    private Suit leadSuit;
    @Builder.Default
    private List<PlayedCard> playedCards = new ArrayList<>();
    private Seat winnerSeat;
    private String winnerPlayerId;
    private Card winningCard;
    private boolean isCompleted;

    public void addPlayedCard(PlayedCard card) {
        if (playedCards == null) playedCards = new ArrayList<>();
        if (playedCards.isEmpty()) {
            this.leadSuit = card.getCard().getSuit();
            this.leadSeat = card.getSeat();
        }
        playedCards.add(card);
    }
}
