package com.penguinpeak.childcare.child.mapper;

import com.penguinpeak.childcare.child.dto.CreateFamilyRequest;
import com.penguinpeak.childcare.child.dto.FamilyMemberResponse;
import com.penguinpeak.childcare.child.dto.FamilyResponse;
import com.penguinpeak.childcare.child.dto.UpdateFamilyRequest;
import com.penguinpeak.childcare.child.entity.Family;
import com.penguinpeak.childcare.child.entity.FamilyMember;
import java.util.List;
import org.springframework.stereotype.Component;

@Component
public class FamilyMapper {

    public Family toEntity(CreateFamilyRequest r, Long organisationId) {
        Family e = new Family();
        e.setOrganisationId(organisationId);
        e.setCentreId(r.centreId());
        e.setFamilyNumber(r.familyNumber());
        e.setNotes(r.notes());
        return e;
    }

    public void update(Family e, UpdateFamilyRequest r) {
        if (r.familyNumber() != null) e.setFamilyNumber(r.familyNumber());
        if (r.notes() != null) e.setNotes(r.notes());
        if (r.active() != null) e.setActive(r.active());
    }

    public FamilyResponse toResponse(Family e, List<FamilyMember> members) {
        List<FamilyMemberResponse> memberResponses = members.stream().map(this::toMemberResponse).toList();
        return new FamilyResponse(
                e.getId(), e.getOrganisationId(), e.getCentreId(),
                e.getFamilyNumber(), e.getNotes(), e.isActive(),
                memberResponses, e.getCreatedAt(), e.getUpdatedAt());
    }

    public FamilyResponse toResponse(Family e) {
        return new FamilyResponse(
                e.getId(), e.getOrganisationId(), e.getCentreId(),
                e.getFamilyNumber(), e.getNotes(), e.isActive(),
                List.of(), e.getCreatedAt(), e.getUpdatedAt());
    }

    public FamilyMemberResponse toMemberResponse(FamilyMember m) {
        return new FamilyMemberResponse(
                m.getId(), m.getFamilyId(), m.getUserId(),
                m.getFirstName(), m.getLastName(), m.getRelationship(),
                m.getEmail(), m.getPhone(), m.getMobile(), m.getOccupation(),
                m.isPrimary(), m.isEmergencyContact(),
                m.getAddressStreet(), m.getAddressSuburb(), m.getAddressState(),
                m.getAddressPostcode(), m.getAddressCountry(),
                m.getCreatedAt(), m.getUpdatedAt());
    }
}
