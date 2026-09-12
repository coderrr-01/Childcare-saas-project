package com.penguinpeak.childcare.child.mapper;

import com.penguinpeak.childcare.child.dto.AuthorisedPickupResponse;
import com.penguinpeak.childcare.child.dto.CreateAuthorisedPickupRequest;
import com.penguinpeak.childcare.child.dto.UpdateAuthorisedPickupRequest;
import com.penguinpeak.childcare.child.entity.AuthorisedPickup;
import org.springframework.stereotype.Component;

@Component
public class AuthorisedPickupMapper {

    public AuthorisedPickup toEntity(CreateAuthorisedPickupRequest r, Long childId) {
        AuthorisedPickup e = new AuthorisedPickup();
        e.setChildId(childId);
        e.setName(r.name());
        e.setRelationship(r.relationship());
        e.setPhone(r.phone());
        e.setMobile(r.mobile());
        e.setPhotoUrl(r.photoUrl());
        return e;
    }

    public void update(AuthorisedPickup e, UpdateAuthorisedPickupRequest r) {
        if (r.name() != null) e.setName(r.name());
        if (r.relationship() != null) e.setRelationship(r.relationship());
        if (r.phone() != null) e.setPhone(r.phone());
        if (r.mobile() != null) e.setMobile(r.mobile());
        if (r.photoUrl() != null) e.setPhotoUrl(r.photoUrl());
        if (r.active() != null) e.setActive(r.active());
    }

    public AuthorisedPickupResponse toResponse(AuthorisedPickup e) {
        return new AuthorisedPickupResponse(
                e.getId(), e.getChildId(), e.getName(), e.getRelationship(),
                e.getPhone(), e.getMobile(), e.getPhotoUrl(), e.isActive(),
                e.getCreatedAt(), e.getUpdatedAt());
    }
}
