package com.roundtrip.service;

import com.roundtrip.model.User;
import com.roundtrip.repository.UserRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Slf4j
@Service
public class UserService {

    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    /**
     * Saves or updates a user profile directly into MongoDB 'users' collection.
     */
    public User saveOrUpdateUser(String id, String clerkId, String displayName, String email, String avatarUrl) {
        if (id == null || id.isBlank()) {
            id = "user-" + System.currentTimeMillis();
        }

        Optional<User> existingOpt = Optional.empty();
        if (clerkId != null && !clerkId.isBlank()) {
            existingOpt = userRepository.findByClerkId(clerkId);
        }
        if (existingOpt.isEmpty()) {
            existingOpt = userRepository.findById(id);
        }

        User user;
        long now = System.currentTimeMillis();

        if (existingOpt.isPresent()) {
            user = existingOpt.get();
            if (displayName != null && !displayName.isBlank()) user.setDisplayName(displayName);
            if (email != null && !email.isBlank()) user.setEmail(email);
            if (avatarUrl != null && !avatarUrl.isBlank()) user.setAvatarUrl(avatarUrl);
            if (clerkId != null && !clerkId.isBlank()) user.setClerkId(clerkId);
            user.setLastActiveAt(now);
        } else {
            user = User.builder()
                    .id(id)
                    .clerkId(clerkId)
                    .username(displayName != null ? displayName.toLowerCase().replaceAll("\\s+", "_") : id)
                    .displayName(displayName != null ? displayName : "Player")
                    .email(email)
                    .avatarUrl(avatarUrl != null ? avatarUrl : "https://api.dicebear.com/7.x/avataaars/svg?seed=" + id)
                    .totalMatches(0)
                    .matchesWon(0)
                    .totalScore(0.0)
                    .highestRoundScore(0.0)
                    .createdAt(now)
                    .lastActiveAt(now)
                    .build();
        }

        try {
            User saved = userRepository.save(user);
            log.info("Persisted User to MongoDB users collection: {} ({})", saved.getDisplayName(), saved.getId());
            return saved;
        } catch (Exception e) {
            log.error("Failed to save user to MongoDB: {}", e.getMessage());
            return user;
        }
    }

    public void recordMatchResult(String userId, boolean isWinner, double matchScore) {
        if (userId == null || userId.startsWith("bot-")) return;

        userRepository.findById(userId).ifPresent(user -> {
            user.setTotalMatches(user.getTotalMatches() + 1);
            if (isWinner) {
                user.setMatchesWon(user.getMatchesWon() + 1);
            }
            user.setTotalScore(user.getTotalScore() + matchScore);
            user.setLastActiveAt(System.currentTimeMillis());
            userRepository.save(user);
            log.info("Updated match stats in MongoDB for user: {}", user.getDisplayName());
        });
    }

    public Optional<User> getUserById(String id) {
        return userRepository.findById(id);
    }

    public List<User> getLeaderboard() {
        return userRepository.findTop20ByOrderByTotalScoreDesc();
    }
}
