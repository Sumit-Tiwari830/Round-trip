package com.roundtrip.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.io.Serializable;
import java.util.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "game_rooms")
public class GameRoom implements Serializable {
    @Id
    private String roomCode;
    private String hostId;
    private String hostName;

    @Builder.Default
    private GamePhase phase = GamePhase.LOBBY;

    @Builder.Default
    private int currentRoundIndex = 0; // 0..4 (5 rounds total)
    @Builder.Default
    private int totalRounds = 5;

    @Builder.Default
    private List<Player> players = new ArrayList<>();

    private Seat activeSeat; // Whose turn to play or bid
    private Seat dealerSeat;

    @Builder.Default
    private List<Round> rounds = new ArrayList<>();

    private Scorecard scorecard;

    private long createdAt;
    private long updatedAt;

    public Optional<Player> getPlayer(String playerId) {
        if (players == null) return Optional.empty();
        return players.stream().filter(p -> p.getId().equals(playerId)).findFirst();
    }

    public Optional<Player> getPlayerBySeat(Seat seat) {
        if (players == null) return Optional.empty();
        return players.stream().filter(p -> p.getSeat() == seat).findFirst();
    }

    public Round getCurrentRound() {
        if (rounds == null || rounds.isEmpty() || currentRoundIndex < 0 || currentRoundIndex >= rounds.size()) {
            return null;
        }
        return rounds.get(currentRoundIndex);
    }
}
