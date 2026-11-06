package com.roundtrip.service;

import com.roundtrip.model.Card;
import com.roundtrip.model.Rank;
import com.roundtrip.model.Suit;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

@Service
public class DeckService {

    private final SecureRandom secureRandom = new SecureRandom();

    /**
     * Generates a fresh, full 52-card standard deck.
     */
    public List<Card> createDeck() {
        List<Card> deck = new ArrayList<>(52);
        for (Suit suit : Suit.values()) {
            for (Rank rank : Rank.values()) {
                deck.add(Card.of(suit, rank));
            }
        }
        return deck;
    }

    /**
     * Purely random Fisher-Yates shuffle using cryptographically secure RNG.
     */
    public List<Card> shuffle(List<Card> deck) {
        List<Card> shuffled = new ArrayList<>(deck);
        for (int i = shuffled.size() - 1; i > 0; i--) {
            int j = secureRandom.nextInt(i + 1);
            Collections.swap(shuffled, i, j);
        }
        return shuffled;
    }

    /**
     * Deals 52 cards equally to 4 players (13 cards each).
     */
    public List<List<Card>> dealHands(List<Card> shuffledDeck) {
        if (shuffledDeck == null || shuffledDeck.size() < 52) {
            throw new IllegalArgumentException("Deck must contain 52 cards to deal");
        }
        List<List<Card>> hands = new ArrayList<>(4);
        for (int i = 0; i < 4; i++) {
            hands.add(new ArrayList<>(13));
        }

        // Deal 13 cards to each player
        for (int i = 0; i < 52; i++) {
            hands.get(i % 4).add(shuffledDeck.get(i));
        }

        return hands;
    }

    /**
     * Draws 4 random distinct cards from a fresh shuffled deck to represent
     * the 4 players for the Trump deciding phase.
     */
    public List<Card> drawFourRandomCards() {
        List<Card> deck = shuffle(createDeck());
        return new ArrayList<>(deck.subList(0, 4));
    }
}
