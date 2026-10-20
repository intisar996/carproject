package com.example.Car.Services.Security;

import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;


@Service
public class RateLimitService  {

    private final Map<String, Bucket> buckets = new ConcurrentHashMap<>();
      public boolean isAllowed(String ip){
          Bucket bucket = buckets.computeIfAbsent(
                  ip,
                  key -> createBucket()
          );
          return bucket.tryConsume(1);
      }

    private Bucket createBucket() {
          return Bucket.builder()
                  .addLimit(limit ->
                          limit.capacity(5)
                                  .refillGreedy(5 , Duration.ofMinutes(1))
                  ).build();
    }


}
