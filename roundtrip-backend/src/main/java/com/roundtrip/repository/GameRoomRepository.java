package com.roundtrip.repository;

import com.roundtrip.model.GameRoom;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface GameRoomRepository extends MongoRepository<GameRoom, String> {
    Optional<GameRoom> findByRoomCode(String roomCode);
}
