package com.penguinpeak.childcare.organisation.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Size;

public record UpdateOrganisationRequest(
        @Size(max = 200) String name, @Size(max = 20) String abn, @Email @Size(max = 255) String email,
        @Size(max = 30) String phone, @Size(max = 500) String website, String logoUrl,
        @Size(max = 200) String addressStreet, @Size(max = 100) String addressSuburb,
        @Size(max = 50) String addressState, @Size(max = 10) String addressPostcode,
        @Size(max = 50) String addressCountry, @Size(max = 50) String timezone, Boolean active) { }
