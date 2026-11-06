package com.roundtrip.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SyncUserRequest {
    private String id;
    private String clerkId;
    private String displayName;
    private String email;
    private String avatarUrl;
}
