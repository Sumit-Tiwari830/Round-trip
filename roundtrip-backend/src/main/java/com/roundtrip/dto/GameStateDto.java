package com.roundtrip.dto;

import com.roundtrip.model.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GameStateDto implements Serializable {
    private String roomCode;
    private String hostId;
    private GamePhase phase;
    private int currentRound; // 1 to 5
    private int totalRounds; // 5
    private Seat activeSeat;
    private Seat dealerSeat;
    private Suit trumpSuit;
    private List<TrumpDrawCard> trumpDrawCards;
    private Trick currentTrick;
    private List<Trick> completedTricks;
    private List<PlayerViewDto> players;
    private Scorecard scorecard;
    private String message;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PlayerViewDto implements Serializable {
        private String id;
        private String displayName;
        private String avatarUrl;
        private Seat seat;
        @com.fasterxml.jackson.annotation.JsonProperty("isBot")
        private boolean isBot;
        @com.fasterxml.jackson.annotation.JsonProperty("isConnected")
        private boolean isConnected;
        @com.fasterxml.jackson.annotation.JsonProperty("isHost")
        private boolean isHost;
        private int cardCount;
        private List<Card> hand; // Populated only for the viewing player
        private Integer bid; // Hidden during SECRET_BIDDING for other players
        private boolean hasSubmittedBid;
        private int tricksWon;
        private double totalScore;
    }

    public static GameStateDto fromRoom(GameRoom room, String viewingPlayerId) {
        if (room == null) return null;

        Round round = room.getCurrentRound();
        boolean isSecretBidding = room.getPhase() == GamePhase.SECRET_BIDDING;

        List<PlayerViewDto> playerViews = room.getPlayers().stream().map(p -> {
            boolean isSelf = p.getId().equals(viewingPlayerId);
            Integer visibleBid = null;

            if (isSelf || !isSecretBidding) {
                visibleBid = p.getCurrentBid();
            }

            return PlayerViewDto.builder()
                    .id(p.getId())
                    .displayName(p.getDisplayName())
                    .avatarUrl(p.getAvatarUrl())
                    .seat(p.getSeat())
                    .isBot(p.isBot())
                    .isConnected(p.isConnected())
                    .isHost(p.isHost())
                    .cardCount(p.getHand() != null ? p.getHand().size() : 0)
                    .hand(isSelf ? new ArrayList<>(p.getHand()) : new ArrayList<>())
                    .bid(visibleBid)
                    .hasSubmittedBid(p.isHasBid())
                    .tricksWon(p.getTricksWon())
                    .totalScore(p.getTotalScore())
                    .build();
        }).collect(Collectors.toList());

        return GameStateDto.builder()
                .roomCode(room.getRoomCode())
                .hostId(room.getHostId())
                .phase(room.getPhase())
                .currentRound(room.getCurrentRoundIndex() + 1)
                .totalRounds(room.getTotalRounds())
                .activeSeat(room.getActiveSeat())
                .dealerSeat(room.getDealerSeat())
                .trumpSuit(round != null ? round.getTrumpSuit() : null)
                .trumpDrawCards(round != null ? round.getTrumpDrawCards() : new ArrayList<>())
                .currentTrick(round != null ? round.getCurrentTrick() : null)
                .completedTricks(round != null ? round.getCompletedTricks() : new ArrayList<>())
                .players(playerViews)
                .scorecard(room.getScorecard())
                .build();
    }
}
