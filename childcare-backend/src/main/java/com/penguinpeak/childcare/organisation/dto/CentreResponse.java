package com.penguinpeak.childcare.organisation.dto;

import com.penguinpeak.childcare.organisation.entity.CentreStatus;
import java.time.Instant;
import java.time.LocalTime;
import java.util.List;

public record CentreResponse(Long id, Long organisationId, String name, String email, String phone,
                             String addressStreet, String addressSuburb, String addressState, String addressPostcode,
                             String addressCountry, int capacity, String timezone, CentreStatus status,
                             String licenseNumber, LocalTime openingTime, LocalTime closingTime,
                             List<Integer> operatingDays, Instant createdAt, Instant updatedAt) { }
