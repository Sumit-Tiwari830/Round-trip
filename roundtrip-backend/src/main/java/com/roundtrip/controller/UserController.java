package com.roundtrip.controller;

import com.roundtrip.dto.SyncUserRequest;
import com.roundtrip.model.User;
import com.roundtrip.repository.UserRepository;
import com.roundtrip.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "*")
public class UserController {

    private final UserService userService;
    private final UserRepository userRepository;

    public UserController(UserService userService, UserRepository userRepository) {
        this.userService = userService;
        this.userRepository = userRepository;
    }

    @PostMapping("/sync")
    public ResponseEntity<User> syncUser(@RequestBody SyncUserRequest request) {
        User user = userService.saveOrUpdateUser(
                request.getId(),
                request.getClerkId(),
                request.getDisplayName(),
                request.getEmail(),
                request.getAvatarUrl()
        );
        return ResponseEntity.ok(user);
    }

    @GetMapping("/{id}")
    public ResponseEntity<User> getUser(@PathVariable String id) {
        return userService.getUserById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/leaderboard")
    public ResponseEntity<List<User>> getLeaderboard() {
        return ResponseEntity.ok(userService.getLeaderboard());
    }

    @GetMapping
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(userRepository.findAll());
    }
}
