package com.roundtrip.service;

import com.roundtrip.model.*;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

@Service
public class TrumpService {

    private final DeckService deckService;

    public TrumpService(DeckService deckService) {
        this.deckService = deckService;
    }

    /**
     * Conducts the initial 4-player card draw to determine the Trump (Hukum) suit for the round.
     */
    public List<TrumpDrawCard> conductTrumpDraw(List<Player> players) {
        List<Card> drawnCards = deckService.drawFourRandomCards();
        List<TrumpDrawCard> trumpCards = new ArrayList<>(4);

        for (int i = 0; i < 4; i++) {
            Player p = i < players.size() ? players.get(i) : null;
            Seat seat = Seat.fromIndex(i);
            trumpCards.add(TrumpDrawCard.builder()
                    .seat(seat)
                    .playerId(p != null ? p.getId() : "bot-" + i)
                    .playerName(p != null ? p.getDisplayName() : "Player " + (i + 1))
                    .card(drawnCards.get(i))
                    .isDecidingTrump(false)
                    .build());
        }

        // Find the highest card among the 4 to decide the Trump suit
        TrumpDrawCard highest = trumpCards.stream()
                .max(Comparator.comparingInt((TrumpDrawCard t) -> t.getCard().getValue())
                        .thenComparing(t -> t.getCard().getSuit()))
                .orElse(trumpCards.get(0));

        highest.setDecidingTrump(true);
        return trumpCards;
    }

    public Suit determineTrumpSuit(List<TrumpDrawCard> trumpCards) {
        return trumpCards.stream()
                .filter(TrumpDrawCard::isDecidingTrump)
                .findFirst()
                .map(t -> t.getCard().getSuit())
                .orElse(Suit.SPADES);
    }
}
