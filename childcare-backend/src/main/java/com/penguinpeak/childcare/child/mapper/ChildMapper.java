package com.penguinpeak.childcare.child.mapper;

import com.penguinpeak.childcare.child.dto.ChildResponse;
import com.penguinpeak.childcare.child.dto.CreateChildRequest;
import com.penguinpeak.childcare.child.dto.UpdateChildRequest;
import com.penguinpeak.childcare.child.entity.Child;
import com.penguinpeak.childcare.child.entity.ChildFamilyRelationship;
import com.penguinpeak.childcare.child.entity.Family;
import java.util.List;
import org.springframework.stereotype.Component;

@Component
public class ChildMapper {

    public Child toEntity(CreateChildRequest r, Long organisationId) {
        Child e = new Child();
        e.setOrganisationId(organisationId);
        e.setCentreId(r.centreId());
        e.setRoomId(r.roomId());
        e.setFirstName(r.firstName());
        e.setLastName(r.lastName());
        e.setDateOfBirth(r.dateOfBirth());
        if (r.gender() != null) e.setGender(r.gender());
        if (r.enrolmentStatus() != null) e.setEnrolmentStatus(r.enrolmentStatus());
        e.setPhotoUrl(r.photoUrl());
        e.setNationality(r.nationality());
        e.setCulturalNotes(r.culturalNotes());
        e.setLanguagesSpoken(r.languagesSpoken());
        return e;
    }

    public void update(Child e, UpdateChildRequest r) {
        if (r.roomId() != null) e.setRoomId(r.roomId());
        if (r.firstName() != null) e.setFirstName(r.firstName());
        if (r.lastName() != null) e.setLastName(r.lastName());
        if (r.dateOfBirth() != null) e.setDateOfBirth(r.dateOfBirth());
        if (r.gender() != null) e.setGender(r.gender());
        if (r.enrolmentStatus() != null) e.setEnrolmentStatus(r.enrolmentStatus());
        if (r.photoUrl() != null) e.setPhotoUrl(r.photoUrl());
        if (r.nationality() != null) e.setNationality(r.nationality());
        if (r.culturalNotes() != null) e.setCulturalNotes(r.culturalNotes());
        if (r.languagesSpoken() != null) e.setLanguagesSpoken(r.languagesSpoken());
        if (r.active() != null) e.setActive(r.active());
    }

    public ChildResponse toResponse(Child e, List<ChildFamilyRelationship> relationships, List<Family> families) {
        List<ChildResponse.FamilySummary> familySummaries = relationships.stream()
                .map(rel -> {
                    String familyNumber = families.stream()
                            .filter(f -> f.getId().equals(rel.getFamilyId()))
                            .map(Family::getFamilyNumber)
                            .findFirst().orElse(null);
                    return new ChildResponse.FamilySummary(
                            rel.getFamilyId(), familyNumber, rel.getRelationshipType(), rel.isPrimaryGuardian());
                })
                .toList();
        return new ChildResponse(
                e.getId(), e.getOrganisationId(), e.getCentreId(), e.getRoomId(),
                e.getFirstName(), e.getLastName(), e.getDateOfBirth(), e.getGender(),
                e.getEnrolmentStatus(), e.getPhotoUrl(), e.getNationality(),
                e.getCulturalNotes(), e.getLanguagesSpoken(), e.isActive(),
                familySummaries, e.getCreatedAt(), e.getUpdatedAt());
    }

    public ChildResponse toResponse(Child e) {
        return new ChildResponse(
                e.getId(), e.getOrganisationId(), e.getCentreId(), e.getRoomId(),
                e.getFirstName(), e.getLastName(), e.getDateOfBirth(), e.getGender(),
                e.getEnrolmentStatus(), e.getPhotoUrl(), e.getNationality(),
                e.getCulturalNotes(), e.getLanguagesSpoken(), e.isActive(),
                List.of(), e.getCreatedAt(), e.getUpdatedAt());
    }
}
