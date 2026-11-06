package com.roundtrip.model;

public enum Suit {
    SPADES("♠", "Spades", "black"),
    HEARTS("♥", "Hearts", "red"),
    CLUBS("♣", "Clubs", "black"),
    DIAMONDS("♦", "Diamonds", "red");

    private final String symbol;
    private final String displayName;
    private final String color;

    Suit(String symbol, String displayName, String color) {
        this.symbol = symbol;
        this.displayName = displayName;
        this.color = color;
    }

    public String getSymbol() {
        return symbol;
    }

    public String getDisplayName() {
        return displayName;
    }

    public String getColor() {
        return color;
    }
}
