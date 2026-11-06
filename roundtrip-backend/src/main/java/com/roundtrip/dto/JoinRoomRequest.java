package com.roundtrip.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class JoinRoomRequest {
    private String roomCode;
    private String playerId;
    private String playerName;
    private String avatarUrl;
}
