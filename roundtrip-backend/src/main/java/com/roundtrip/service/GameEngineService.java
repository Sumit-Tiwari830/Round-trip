package com.roundtrip.service;

import com.roundtrip.dto.GameStateDto;
import com.roundtrip.model.*;
import com.roundtrip.repository.GameRoomRepository;
import com.roundtrip.repository.ScorecardRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Lazy;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.TimeUnit;
import java.util.stream.Collectors;

@Slf4j
@Service
public class GameEngineService {

    private final DeckService deckService;
    private final TrumpService trumpService;
    private final ScoringService scoringService;
    private final BotAiService botAiService;
    private final GameRoomRepository roomRepository;
    private final ScorecardRepository scorecardRepository;
    private final UserService userService;
    private final SimpMessagingTemplate messagingTemplate;

    public GameEngineService(DeckService deckService,
                             TrumpService trumpService,
                             ScoringService scoringService,
                             BotAiService botAiService,
                             GameRoomRepository roomRepository,
                             ScorecardRepository scorecardRepository,
                             UserService userService,
                             @Lazy SimpMessagingTemplate messagingTemplate) {
        this.deckService = deckService;
        this.trumpService = trumpService;
        this.scoringService = scoringService;
        this.botAiService = botAiService;
        this.roomRepository = roomRepository;
        this.scorecardRepository = scorecardRepository;
        this.userService = userService;
        this.messagingTemplate = messagingTemplate;
    }

    /**
     * Starts a 5-round match. If room has fewer than 4 players, empty seats are auto-filled with Bots.
     */
    public synchronized GameRoom startGame(GameRoom room) {
        log.info("Starting Game in room {}", room.getRoomCode());

        // Ensure 4 players
        fillWithBotsIfNeeded(room);

        room.setCurrentRoundIndex(0);
        room.setTotalRounds(5);
        room.setRounds(new ArrayList<>());
        room.setScorecard(Scorecard.builder()
                .roomCode(room.getRoomCode())
                .createdAt(System.currentTimeMillis())
                .roundSummaries(new ArrayList<>())
                .totalScores(new HashMap<>())
                .players(new ArrayList<>())
                .build());

        // Reset players total scores
        for (Player p : room.getPlayers()) {
            p.setTotalScore(0.0);
        }

        initiateRound(room, 0);
        saveAndBroadcast(room);

        return room;
    }

    /**
     * Fills any unoccupied seats (up to 4) with intelligent Bot AI players.
     */
    public void fillWithBotsIfNeeded(GameRoom room) {
        List<Player> players = room.getPlayers();
        Set<Seat> occupiedSeats = players.stream().map(Player::getSeat).collect(Collectors.toSet());

        int botCounter = 1;
        for (Seat seat : Seat.values()) {
            if (!occupiedSeats.contains(seat)) {
                Player bot = botAiService.createBot(seat, botCounter++);
                players.add(bot);
                occupiedSeats.add(seat);
            }
        }
        players.sort(Comparator.comparingInt(p -> p.getSeat().getIndex()));
    }

    /**
     * Initiates a new round (1 through 5).
     */
    public void initiateRound(GameRoom room, int roundIndex) {
        room.setCurrentRoundIndex(roundIndex);
        int roundNumber = roundIndex + 1;

        // Reset players round fields
        for (Player p : room.getPlayers()) {
            p.getHand().clear();
            p.setCurrentBid(null);
            p.setHasBid(false);
            p.setTricksWon(0);
        }

        // Deal 13 cards purely randomly
        List<Card> deck = deckService.shuffle(deckService.createDeck());
        List<List<Card>> hands = deckService.dealHands(deck);
        for (int i = 0; i < 4; i++) {
            Player p = room.getPlayers().get(i);
            p.setHand(hands.get(i));
            p.sortHand();
        }

        // Trump Deciding Phase: 4 random cards from 4 players
        List<TrumpDrawCard> trumpCards = trumpService.conductTrumpDraw(room.getPlayers());
        Suit trumpSuit = trumpService.determineTrumpSuit(trumpCards);

        Seat dealerSeat = Seat.fromIndex(roundIndex);
        Seat startingSeat = dealerSeat.next();

        Round round = Round.builder()
                .roundNumber(roundNumber)
                .trumpSuit(trumpSuit)
                .trumpDrawCards(trumpCards)
                .dealerSeat(dealerSeat)
                .startingSeat(startingSeat)
                .startedAt(System.currentTimeMillis())
                .build();

        room.getRounds().add(round);
        room.setDealerSeat(dealerSeat);
        room.setActiveSeat(startingSeat);
        room.setPhase(GamePhase.TRUMP_REVEAL);

        // Schedule transition from TRUMP_REVEAL to SECRET_BIDDING after 3 seconds
        triggerDelayedAction(3000, () -> transitionToSecretBidding(room.getRoomCode()));
    }

    public synchronized void transitionToSecretBidding(String roomCode) {
        Optional<GameRoom> opt = roomRepository.findByRoomCode(roomCode);
        if (opt.isEmpty()) return;
        GameRoom room = opt.get();

        if (room.getPhase() != GamePhase.TRUMP_REVEAL) return;

        room.setPhase(GamePhase.SECRET_BIDDING);
        saveAndBroadcast(room);

        // Auto-submit bids for Bots
        submitBotBids(room);
    }

    private void submitBotBids(GameRoom room) {
        Round round = room.getCurrentRound();
        if (round == null) return;

        for (Player p : room.getPlayers()) {
            if (p.isBot() && !p.isHasBid()) {
                int botBid = botAiService.calculateBotBid(p.getHand(), round.getTrumpSuit());
                p.setCurrentBid(botBid);
                p.setHasBid(true);
                round.getBids().put(p.getId(), botBid);
            }
        }

        checkAndCompleteBidding(room);
        saveAndBroadcast(room);
    }

    /**
     * Submits a secret bid for a player.
     */
    public synchronized GameRoom submitBid(String roomCode, String playerId, int bid) {
        GameRoom room = roomRepository.findByRoomCode(roomCode)
                .orElseThrow(() -> new IllegalArgumentException("Room not found: " + roomCode));

        if (room.getPhase() != GamePhase.SECRET_BIDDING) {
            throw new IllegalStateException("Game is not in secret bidding phase");
        }

        Player player = room.getPlayer(playerId)
                .orElseThrow(() -> new IllegalArgumentException("Player not found: " + playerId));

        player.setCurrentBid(bid);
        player.setHasBid(true);

        Round round = room.getCurrentRound();
        if (round != null) {
            round.getBids().put(playerId, bid);
        }

        checkAndCompleteBidding(room);
        saveAndBroadcast(room);

        return room;
    }

    private void checkAndCompleteBidding(GameRoom room) {
        boolean allBidsSubmitted = room.getPlayers().stream().allMatch(Player::isHasBid);

        if (allBidsSubmitted) {
            log.info("All 4 players have submitted their bids in room {}. Revealing bids!", room.getRoomCode());
            room.setPhase(GamePhase.BIDS_REVEALED);

            Round round = room.getCurrentRound();
            if (round != null) {
                // Initialize the first trick
                Trick firstTrick = Trick.builder()
                        .trickNumber(1)
                        .leadSeat(round.getStartingSeat())
                        .build();
                round.setCurrentTrick(firstTrick);
                room.setActiveSeat(round.getStartingSeat());
            }

            // After 2.5 seconds, start playing tricks
            triggerDelayedAction(2500, () -> {
                Optional<GameRoom> freshRoom = roomRepository.findByRoomCode(room.getRoomCode());
                freshRoom.ifPresent(r -> {
                    if (r.getPhase() == GamePhase.BIDS_REVEALED) {
                        r.setPhase(GamePhase.PLAYING_TRICKS);
                        saveAndBroadcast(r);
                        triggerBotTurnIfNeeded(r);
                    }
                });
            });
        }
    }

    /**
     * Executes playing a card by a player.
     */
    public synchronized GameRoom playCard(String roomCode, String playerId, String cardId) {
        GameRoom room = roomRepository.findByRoomCode(roomCode)
                .orElseThrow(() -> new IllegalArgumentException("Room not found: " + roomCode));

        if (room.getPhase() != GamePhase.PLAYING_TRICKS) {
            throw new IllegalStateException("Game is not in trick playing phase");
        }

        Player player = room.getPlayer(playerId)
                .orElseThrow(() -> new IllegalArgumentException("Player not found"));

        if (player.getSeat() != room.getActiveSeat()) {
            throw new IllegalStateException("It is not your turn! Current turn: " + room.getActiveSeat());
        }

        Round round = room.getCurrentRound();
        if (round == null) throw new IllegalStateException("Active round not found");

        Card cardToPlay = player.getHand().stream()
                .filter(c -> c.getId().equals(cardId))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("Card not in hand: " + cardId));

        Trick currentTrick = round.getCurrentTrick();

        // Validate legal move: must follow lead suit if possible
        validateCardPlay(player, cardToPlay, currentTrick);

        // Execute card play
        player.removeCard(cardToPlay);
        PlayedCard playedCard = PlayedCard.builder()
                .playerId(player.getId())
                .seat(player.getSeat())
                .card(cardToPlay)
                .playedAt(System.currentTimeMillis())
                .build();

        currentTrick.addPlayedCard(playedCard);

        if (currentTrick.getPlayedCards().size() == 4) {
            // Trick is complete
            resolveTrick(room, round, currentTrick);
        } else {
            // Advance active seat to next player
            room.setActiveSeat(player.getSeat().next());
            saveAndBroadcast(room);
            triggerBotTurnIfNeeded(room);
        }

        return room;
    }

    private void validateCardPlay(Player player, Card cardToPlay, Trick currentTrick) {
        if (currentTrick != null && !currentTrick.getPlayedCards().isEmpty()) {
            Suit leadSuit = currentTrick.getLeadSuit();
            boolean hasLeadSuit = player.getHand().stream().anyMatch(c -> c.getSuit() == leadSuit);
            if (hasLeadSuit && cardToPlay.getSuit() != leadSuit) {
                throw new IllegalArgumentException("Must follow lead suit: " + leadSuit.getDisplayName());
            }
        }
    }

    private void resolveTrick(GameRoom room, Round round, Trick trick) {
        PlayedCard winningPlay = trick.getPlayedCards().get(0);
        Suit leadSuit = trick.getLeadSuit();
        Suit trumpSuit = round.getTrumpSuit();

        for (int i = 1; i < trick.getPlayedCards().size(); i++) {
            PlayedCard candidate = trick.getPlayedCards().get(i);
            if (botAiService.isCardBetter(candidate.getCard(), winningPlay.getCard(), leadSuit, trumpSuit)) {
                winningPlay = candidate;
            }
        }

        trick.setWinnerSeat(winningPlay.getSeat());
        trick.setWinnerPlayerId(winningPlay.getPlayerId());
        trick.setWinningCard(winningPlay.getCard());
        trick.setCompleted(true);

        // Update player tricks won
        Player winner = room.getPlayer(winningPlay.getPlayerId()).orElse(null);
        if (winner != null) {
            winner.setTricksWon(winner.getTricksWon() + 1);
            round.getTricksWon().put(winner.getId(), winner.getTricksWon());
        }

        round.getCompletedTricks().add(trick);
        saveAndBroadcast(room);

        final Seat trickWinnerSeat = winningPlay.getSeat();

        // Delay 2 seconds so players can see the winning card before clearing table
        triggerDelayedAction(2000, () -> {
            Optional<GameRoom> freshRoom = roomRepository.findByRoomCode(room.getRoomCode());
            freshRoom.ifPresent(r -> {
                Round currRound = r.getCurrentRound();
                if (currRound.getCompletedTricks().size() == 13) {
                    // All 13 tricks in this round are done! Finalize round
                    finalizeRound(r, currRound);
                } else {
                    // Start next trick, winner leads
                    Trick nextTrick = Trick.builder()
                            .trickNumber(currRound.getCompletedTricks().size() + 1)
                            .leadSeat(trickWinnerSeat)
                            .build();
                    currRound.setCurrentTrick(nextTrick);
                    r.setActiveSeat(trickWinnerSeat);
                    saveAndBroadcast(r);
                    triggerBotTurnIfNeeded(r);
                }
            });
        });
    }

    private void finalizeRound(GameRoom room, Round round) {
        round.setCompleted(true);
        round.setCompletedAt(System.currentTimeMillis());

        // Finalize scores for this round
        RoundScoreSummary summary = scoringService.finalizeRoundScores(round, room.getPlayers());

        // Update scorecard
        List<RoundScoreSummary> allSummaries = room.getRounds().stream()
                .filter(Round::isCompleted)
                .map(r -> RoundScoreSummary.builder()
                        .roundNumber(r.getRoundNumber())
                        .trumpSuit(r.getTrumpSuit())
                        .bids(r.getBids())
                        .tricksWon(r.getTricksWon())
                        .scores(r.getRoundScores())
                        .build())
                .collect(Collectors.toList());

        Scorecard scorecard = scoringService.updateScorecard(room.getScorecard(), room.getRoomCode(),
                allSummaries, room.getPlayers());
        room.setScorecard(scorecard);
        scorecardRepository.save(scorecard);

        if (room.getCurrentRoundIndex() >= room.getTotalRounds() - 1) {
            // Match Completed (5 rounds finished)!
            room.setPhase(GamePhase.MATCH_OVER);
            scorecard.setFinishedAt(System.currentTimeMillis());
            scorecardRepository.save(scorecard);

            // Record match stats in MongoDB for all human players
            String winnerId = scorecard.getWinnerPlayerId();
            for (Player p : room.getPlayers()) {
                if (!p.isBot()) {
                    boolean isWinner = p.getId().equals(winnerId);
                    userService.recordMatchResult(p.getId(), isWinner, p.getTotalScore());
                }
            }

            saveAndBroadcast(room);
        } else {
            // Round finished, show summary then advance to next round
            room.setPhase(GamePhase.ROUND_SUMMARY);
            saveAndBroadcast(room);

            triggerDelayedAction(5000, () -> {
                Optional<GameRoom> fresh = roomRepository.findByRoomCode(room.getRoomCode());
                fresh.ifPresent(r -> {
                    if (r.getPhase() == GamePhase.ROUND_SUMMARY) {
                        initiateRound(r, r.getCurrentRoundIndex() + 1);
                        saveAndBroadcast(r);
                    }
                });
            });
        }
    }

    private void triggerBotTurnIfNeeded(GameRoom room) {
        if (room.getPhase() != GamePhase.PLAYING_TRICKS) return;

        Player activePlayer = room.getPlayerBySeat(room.getActiveSeat()).orElse(null);
        if (activePlayer != null && activePlayer.isBot()) {
            triggerDelayedAction(900, () -> {
                Optional<GameRoom> fresh = roomRepository.findByRoomCode(room.getRoomCode());
                fresh.ifPresent(r -> {
                    if (r.getPhase() == GamePhase.PLAYING_TRICKS && r.getActiveSeat() == activePlayer.getSeat()) {
                        Round round = r.getCurrentRound();
                        Card chosenCard = botAiService.selectCardToPlay(activePlayer, round.getCurrentTrick(), round.getTrumpSuit());
                        if (chosenCard != null) {
                            playCard(r.getRoomCode(), activePlayer.getId(), chosenCard.getId());
                        }
                    }
                });
            });
        }
    }

    private void triggerDelayedAction(long delayMs, Runnable action) {
        CompletableFuture.delayedExecutor(delayMs, TimeUnit.MILLISECONDS).execute(action);
    }

    public void saveAndBroadcast(GameRoom room) {
        room.setUpdatedAt(System.currentTimeMillis());
        try {
            roomRepository.save(room);
        } catch (Exception e) {
            log.warn("MongoDB save warning (graceful in-memory fallback): {}", e.getMessage());
        }

        // Broadcast customized state to each player and general room channel
        try {
            for (Player p : room.getPlayers()) {
                GameStateDto playerView = GameStateDto.fromRoom(room, p.getId());
                messagingTemplate.convertAndSend("/topic/room/" + room.getRoomCode() + "/player/" + p.getId(), playerView);
            }
            // General spectator view
            GameStateDto generalView = GameStateDto.fromRoom(room, null);
            messagingTemplate.convertAndSend("/topic/room/" + room.getRoomCode(), generalView);
        } catch (Exception e) {
            log.debug("WebSocket broadcast info: {}", e.getMessage());
        }
    }
}
