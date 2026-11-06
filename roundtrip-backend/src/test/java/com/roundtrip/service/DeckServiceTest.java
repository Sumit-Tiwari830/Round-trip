package com.roundtrip.service;

import com.roundtrip.model.Card;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.assertEquals;

class DeckServiceTest {

    private final DeckService deckService = new DeckService();

    @Test
    @DisplayName("Deck must have 52 unique cards and deal 13 cards to each of 4 players")
    void testDeckGenerationAndDealing() {
        List<Card> deck = deckService.createDeck();
        assertEquals(52, deck.size(), "Standard deck must contain 52 cards");

        Set<String> uniqueIds = new HashSet<>();
        for (Card card : deck) {
            uniqueIds.add(card.getId());
        }
        assertEquals(52, uniqueIds.size(), "All 52 cards must be unique");

        List<Card> shuffled = deckService.shuffle(deck);
        assertEquals(52, shuffled.size());

        List<List<Card>> hands = deckService.dealHands(shuffled);
        assertEquals(4, hands.size(), "Must deal to 4 players");
        for (List<Card> hand : hands) {
            assertEquals(13, hand.size(), "Each player must receive 13 cards");
        }
    }
}
