package com.roundtrip.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PlayCardRequest {
    @NotBlank
    private String playerId;

    @NotBlank
    private String cardId;
}
