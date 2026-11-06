package com.roundtrip.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.index.Indexed;

import java.io.Serializable;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "users")
public class User implements Serializable {
    @Id
    private String id; // Matches playerId or Clerk ID

    @Indexed(sparse = true)
    private String clerkId;

    private String username;
    private String displayName;
    private String email;
    private String avatarUrl;

    @Builder.Default
    private int totalMatches = 0;

    @Builder.Default
    private int matchesWon = 0;

    @Builder.Default
    private double totalScore = 0.0;

    @Builder.Default
    private double highestRoundScore = 0.0;

    private long createdAt;
    private long lastActiveAt;
}
