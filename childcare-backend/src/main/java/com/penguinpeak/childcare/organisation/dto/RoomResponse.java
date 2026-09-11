package com.penguinpeak.childcare.organisation.dto;

import java.time.Instant;

public record RoomResponse(Long id, Long organisationId, Long centreId, String name, int capacity,
                           Integer minAgeMonths, Integer maxAgeMonths, boolean active, Instant createdAt,
                           Instant updatedAt) { }
