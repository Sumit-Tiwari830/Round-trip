package com.roundtrip.service;

import com.roundtrip.model.*;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class BotAiService {

    private final SecureRandom random = new SecureRandom();

    private static final List<String> BOT_NAMES = List.of(
            "CyberAce Bot", "NeonSpade Bot", "Hukum King", "Quantum Joker",
            "TitanBot", "ShadowBot", "VortexBot", "ZenithBot"
    );

    /**
     * Creates a new Bot Player assigned to a specific seat.
     */
    public Player createBot(Seat seat, int index) {
        String name = BOT_NAMES.get(index % BOT_NAMES.size());
        return Player.builder()
                .id("bot-" + UUID.randomUUID().toString().substring(0, 8))
                .username("bot_" + seat.name().toLowerCase())
                .displayName(name)
                .avatarUrl("https://api.dicebear.com/7.x/bottts/svg?seed=" + name.replaceAll("\\s+", ""))
                .seat(seat)
                .isBot(true)
                .isConnected(true)
                .isHost(false)
                .hand(new ArrayList<>())
                .tricksWon(0)
                .totalScore(0.0)
                .build();
    }

    /**
     * Calculates an intelligent bid for a bot based on hand evaluation and trump suit.
     */
    public int calculateBotBid(List<Card> hand, Suit trumpSuit) {
        if (hand == null || hand.isEmpty()) return 1;

        double estimatedTricks = 0.0;

        for (Card card : hand) {
            boolean isTrump = card.getSuit() == trumpSuit;

            // High card evaluation
            if (card.getRank() == Rank.ACE) {
                estimatedTricks += isTrump ? 1.0 : 0.85;
            } else if (card.getRank() == Rank.KING) {
                estimatedTricks += isTrump ? 0.8 : 0.55;
            } else if (card.getRank() == Rank.QUEEN) {
                estimatedTricks += isTrump ? 0.6 : 0.3;
            } else if (isTrump && card.getValue() >= 10) {
                estimatedTricks += 0.4;
            }
        }

        // Trump length bonus (if bot has 4+ trumps, gets extra trick power)
        long trumpCount = hand.stream().filter(c -> c.getSuit() == trumpSuit).count();
        if (trumpCount >= 5) {
            estimatedTricks += 1.5;
        } else if (trumpCount >= 4) {
            estimatedTricks += 0.8;
        }

        // Clamp bid between 1 and 8 for realistic play
        int bid = (int) Math.round(estimatedTricks);
        return Math.max(1, Math.min(bid, 8));
    }

    /**
     * Decides which legal card the bot should play in the current trick.
     */
    public Card selectCardToPlay(Player bot, Trick currentTrick, Suit trumpSuit) {
        List<Card> hand = bot.getHand();
        if (hand == null || hand.isEmpty()) return null;

        // If leading the trick
        if (currentTrick == null || currentTrick.getPlayedCards().isEmpty()) {
            return chooseLeadCard(hand, trumpSuit);
        }

        Suit leadSuit = currentTrick.getLeadSuit();
        List<Card> leadSuitCards = hand.stream()
                .filter(c -> c.getSuit() == leadSuit)
                .sorted(Comparator.comparingInt(Card::getValue))
                .collect(Collectors.toList());

        // RULE: Must follow lead suit if possible!
        if (!leadSuitCards.isEmpty()) {
            Card currentWinningCard = findCurrentWinningCard(currentTrick, trumpSuit);
            boolean winningIsLeadSuit = currentWinningCard != null && currentWinningCard.getSuit() == leadSuit;

            if (winningIsLeadSuit) {
                // Try to beat it with the lowest card that can win
                for (Card card : leadSuitCards) {
                    if (card.getValue() > currentWinningCard.getValue()) {
                        return card;
                    }
                }
            }
            // Cannot win trick or winning card is already trumped; dump lowest lead suit card
            return leadSuitCards.get(0);
        }

        // Void in lead suit: Can play Trump or discard
        List<Card> trumpCards = hand.stream()
                .filter(c -> c.getSuit() == trumpSuit)
                .sorted(Comparator.comparingInt(Card::getValue))
                .collect(Collectors.toList());

        if (!trumpCards.isEmpty()) {
            Card currentWinningCard = findCurrentWinningCard(currentTrick, trumpSuit);
            if (currentWinningCard != null && currentWinningCard.getSuit() == trumpSuit) {
                // Someone already trumped: can we over-trump?
                for (Card trump : trumpCards) {
                    if (trump.getValue() > currentWinningCard.getValue()) {
                        return trump; // Play lowest over-trump
                    }
                }
            } else {
                // No one has trumped yet: cut with lowest trump!
                return trumpCards.get(0);
            }
        }

        // Cannot follow suit and cannot/decided not to trump: discard lowest value card
        return hand.stream()
                .min(Comparator.comparingInt(Card::getValue))
                .orElse(hand.get(0));
    }

    private Card chooseLeadCard(List<Card> hand, Suit trumpSuit) {
        // Prefer leading with non-trump Aces or Kings
        Optional<Card> nonTrumpAce = hand.stream()
                .filter(c -> c.getSuit() != trumpSuit && c.getRank() == Rank.ACE)
                .findFirst();
        if (nonTrumpAce.isPresent()) return nonTrumpAce.get();

        Optional<Card> nonTrumpKing = hand.stream()
                .filter(c -> c.getSuit() != trumpSuit && c.getRank() == Rank.KING)
                .findFirst();
        if (nonTrumpKing.isPresent()) return nonTrumpKing.get();

        // Or lead lowest non-trump card
        Optional<Card> lowestNonTrump = hand.stream()
                .filter(c -> c.getSuit() != trumpSuit)
                .min(Comparator.comparingInt(Card::getValue));
        if (lowestNonTrump.isPresent()) return lowestNonTrump.get();

        // Otherwise lead lowest trump card
        return hand.stream().min(Comparator.comparingInt(Card::getValue)).orElse(hand.get(0));
    }

    public Card findCurrentWinningCard(Trick trick, Suit trumpSuit) {
        if (trick == null || trick.getPlayedCards().isEmpty()) return null;

        PlayedCard winning = trick.getPlayedCards().get(0);
        Suit leadSuit = trick.getLeadSuit();

        for (int i = 1; i < trick.getPlayedCards().size(); i++) {
            PlayedCard candidate = trick.getPlayedCards().get(i);
            if (isCardBetter(candidate.getCard(), winning.getCard(), leadSuit, trumpSuit)) {
                winning = candidate;
            }
        }
        return winning.getCard();
    }

    public boolean isCardBetter(Card candidate, Card currentBest, Suit leadSuit, Suit trumpSuit) {
        if (candidate.getSuit() == trumpSuit && currentBest.getSuit() != trumpSuit) {
            return true;
        }
        if (candidate.getSuit() != trumpSuit && currentBest.getSuit() == trumpSuit) {
            return false;
        }
        if (candidate.getSuit() == trumpSuit && currentBest.getSuit() == trumpSuit) {
            return candidate.getValue() > currentBest.getValue();
        }
        if (candidate.getSuit() == leadSuit && currentBest.getSuit() == leadSuit) {
            return candidate.getValue() > currentBest.getValue();
        }
        return false;
    }
}
