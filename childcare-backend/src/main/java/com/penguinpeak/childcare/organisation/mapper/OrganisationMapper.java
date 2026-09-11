package com.penguinpeak.childcare.organisation.mapper;

import com.penguinpeak.childcare.organisation.dto.CreateOrganisationRequest;
import com.penguinpeak.childcare.organisation.dto.OrganisationResponse;
import com.penguinpeak.childcare.organisation.dto.UpdateOrganisationRequest;
import com.penguinpeak.childcare.organisation.entity.Organisation;
import org.springframework.stereotype.Component;

@Component
public class OrganisationMapper {
    public Organisation toEntity(CreateOrganisationRequest request) {
        Organisation entity = new Organisation();
        apply(entity, request.name(), request.abn(), request.email(), request.phone(), request.website(), request.logoUrl(),
                request.addressStreet(), request.addressSuburb(), request.addressState(), request.addressPostcode(),
                request.addressCountry(), request.timezone());
        return entity;
    }
    public void update(Organisation entity, UpdateOrganisationRequest request) {
        applyNonNull(entity, request);
    }
    public OrganisationResponse toResponse(Organisation entity) {
        return new OrganisationResponse(entity.getId(), entity.getName(), entity.getAbn(), entity.getEmail(), entity.getPhone(),
                entity.getWebsite(), entity.getLogoUrl(), entity.getAddressStreet(), entity.getAddressSuburb(),
                entity.getAddressState(), entity.getAddressPostcode(), entity.getAddressCountry(), entity.getTimezone(),
                entity.isActive(), entity.getCreatedAt(), entity.getUpdatedAt());
    }
    private void apply(Organisation e, String name, String abn, String email, String phone, String website, String logoUrl,
                       String street, String suburb, String state, String postcode, String country, String timezone) {
        e.setName(name); e.setAbn(abn); e.setEmail(email); e.setPhone(phone); e.setWebsite(website); e.setLogoUrl(logoUrl);
        e.setAddressStreet(street); e.setAddressSuburb(suburb); e.setAddressState(state); e.setAddressPostcode(postcode);
        if (country != null) e.setAddressCountry(country); if (timezone != null) e.setTimezone(timezone);
    }
    private void applyNonNull(Organisation e, UpdateOrganisationRequest r) {
        if (r.name() != null) e.setName(r.name()); if (r.abn() != null) e.setAbn(r.abn()); if (r.email() != null) e.setEmail(r.email());
        if (r.phone() != null) e.setPhone(r.phone()); if (r.website() != null) e.setWebsite(r.website()); if (r.logoUrl() != null) e.setLogoUrl(r.logoUrl());
        if (r.addressStreet() != null) e.setAddressStreet(r.addressStreet()); if (r.addressSuburb() != null) e.setAddressSuburb(r.addressSuburb());
        if (r.addressState() != null) e.setAddressState(r.addressState()); if (r.addressPostcode() != null) e.setAddressPostcode(r.addressPostcode());
        if (r.addressCountry() != null) e.setAddressCountry(r.addressCountry()); if (r.timezone() != null) e.setTimezone(r.timezone());
        if (r.active() != null) e.setActive(r.active());
    }
}
