package com.roundtrip.service;

import com.roundtrip.model.Player;
import com.roundtrip.model.Round;
import com.roundtrip.model.RoundScoreSummary;
import com.roundtrip.model.Scorecard;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.*;

@Service
public class ScoringService {

    /**
     * Calculates the score for a single player in a round based on bid and tricks won.
     * Rule:
     * - If tricks won < bid: penalty is -bid (e.g. bid 5, won 4 -> -5.0)
     * - If tricks won >= bid: score is +bid + 0.1 * (tricksWon - bid) (e.g. bid 5, won 6 -> +5.1)
     */
    public double calculateRoundScore(int bid, int tricksWon) {
        if (tricksWon < bid) {
            return -1.0 * bid;
        } else {
            double extra = (tricksWon - bid) * 0.1;
            BigDecimal bd = BigDecimal.valueOf(bid + extra).setScale(1, RoundingMode.HALF_UP);
            return bd.doubleValue();
        }
    }

    /**
     * Computes the summary for a completed round and updates players' total scores.
     */
    public RoundScoreSummary finalizeRoundScores(Round round, List<Player> players) {
        RoundScoreSummary summary = RoundScoreSummary.builder()
                .roundNumber(round.getRoundNumber())
                .trumpSuit(round.getTrumpSuit())
                .bids(new HashMap<>())
                .tricksWon(new HashMap<>())
                .scores(new HashMap<>())
                .build();

        for (Player p : players) {
            int bid = round.getBids().getOrDefault(p.getId(), p.getCurrentBid() != null ? p.getCurrentBid() : 1);
            int won = round.getTricksWon().getOrDefault(p.getId(), p.getTricksWon());

            double roundScore = calculateRoundScore(bid, won);

            summary.getBids().put(p.getId(), bid);
            summary.getTricksWon().put(p.getId(), won);
            summary.getScores().put(p.getId(), roundScore);

            round.getRoundScores().put(p.getId(), roundScore);
            p.setTotalScore(p.getTotalScore() + roundScore);
        }

        return summary;
    }

    /**
     * Builds and updates the final Scorecard with 5-round breakdown and rankings.
     */
    public Scorecard updateScorecard(Scorecard currentScorecard, String roomCode,
                                    List<RoundScoreSummary> allRoundSummaries,
                                    List<Player> players) {
        if (currentScorecard == null) {
            currentScorecard = Scorecard.builder()
                    .roomCode(roomCode)
                    .createdAt(System.currentTimeMillis())
                    .roundSummaries(new ArrayList<>())
                    .totalScores(new HashMap<>())
                    .players(new ArrayList<>())
                    .build();
        }

        currentScorecard.setRoundSummaries(new ArrayList<>(allRoundSummaries));

        Map<String, Double> totalScores = new HashMap<>();
        for (Player p : players) {
            double total = allRoundSummaries.stream()
                    .mapToDouble(r -> r.getScores().getOrDefault(p.getId(), 0.0))
                    .sum();
            BigDecimal bd = BigDecimal.valueOf(total).setScale(1, RoundingMode.HALF_UP);
            totalScores.put(p.getId(), bd.doubleValue());
            p.setTotalScore(bd.doubleValue());
        }
        currentScorecard.setTotalScores(totalScores);

        // Generate player summaries with ranks (highest total score ranks #1)
        List<Scorecard.PlayerSummary> summaries = new ArrayList<>();
        for (Player p : players) {
            summaries.add(Scorecard.PlayerSummary.builder()
                    .playerId(p.getId())
                    .displayName(p.getDisplayName())
                    .seat(p.getSeat())
                    .isBot(p.isBot())
                    .totalScore(totalScores.getOrDefault(p.getId(), 0.0))
                    .build());
        }

        summaries.sort((s1, s2) -> Double.compare(s2.getTotalScore(), s1.getTotalScore()));
        for (int i = 0; i < summaries.size(); i++) {
            summaries.get(i).setRank(i + 1);
        }
        currentScorecard.setPlayers(summaries);

        if (!summaries.isEmpty()) {
            currentScorecard.setWinnerPlayerId(summaries.get(0).getPlayerId());
            currentScorecard.setWinnerPlayerName(summaries.get(0).getDisplayName());
        }

        return currentScorecard;
    }
}
