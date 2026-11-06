package com.roundtrip;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class RoundTripApplication {

    public static void main(String[] args) {
        SpringApplication.run(RoundTripApplication.class, args);
    }
}
