package com.roundtrip.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.util.Objects;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Card implements Comparable<Card>, Serializable {
    private String id; // e.g. "SPADES_ACE", "HEARTS_10"
    private Suit suit;
    private Rank rank;

    public static Card of(Suit suit, Rank rank) {
        return Card.builder()
                .id(suit.name() + "_" + rank.name())
                .suit(suit)
                .rank(rank)
                .build();
    }

    public int getValue() {
        return rank.getValue();
    }

    @Override
    public int compareTo(Card other) {
        if (other == null) return 1;
        if (this.suit != other.suit) {
            return this.suit.compareTo(other.suit);
        }
        return Integer.compare(this.rank.getValue(), other.rank.getValue());
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Card card = (Card) o;
        return suit == card.suit && rank == card.rank;
    }

    @Override
    public int hashCode() {
        return Objects.hash(suit, rank);
    }

    @Override
    public String toString() {
        return rank.getDisplay() + suit.getSymbol();
    }
}
