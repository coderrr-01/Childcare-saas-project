package com.penguinpeak.childcare.organisation.dto;

import java.time.Instant;

public record OrganisationResponse(Long id, String name, String abn, String email, String phone, String website,
                                   String logoUrl, String addressStreet, String addressSuburb, String addressState,
                                   String addressPostcode, String addressCountry, String timezone, boolean active,
                                   Instant createdAt, Instant updatedAt) { }
