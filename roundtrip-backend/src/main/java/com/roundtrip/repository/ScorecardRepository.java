package com.roundtrip.repository;

import com.roundtrip.model.Scorecard;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ScorecardRepository extends MongoRepository<Scorecard, String> {
    Optional<Scorecard> findByRoomCode(String roomCode);
    List<Scorecard> findTop10ByOrderByFinishedAtDesc();
}
