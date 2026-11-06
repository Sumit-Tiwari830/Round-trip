package com.roundtrip.model;

public enum Seat {
    SOUTH(0, "South (You)"),
    EAST(1, "East"),
    NORTH(2, "North"),
    WEST(3, "West");

    private final int index;
    private final String label;

    Seat(int index, String label) {
        this.index = index;
        this.label = label;
    }

    public int getIndex() {
        return index;
    }

    public String getLabel() {
        return label;
    }

    public Seat next() {
        return values()[(this.index + 1) % 4];
    }

    public static Seat fromIndex(int index) {
        return values()[Math.floorMod(index, 4)];
    }
}
