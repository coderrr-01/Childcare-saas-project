package com.penguinpeak.childcare.child.mapper;

import com.penguinpeak.childcare.child.dto.CreateFamilyMemberRequest;
import com.penguinpeak.childcare.child.dto.FamilyMemberResponse;
import com.penguinpeak.childcare.child.dto.UpdateFamilyMemberRequest;
import com.penguinpeak.childcare.child.entity.FamilyMember;
import org.springframework.stereotype.Component;

@Component
public class FamilyMemberMapper {

    public FamilyMember toEntity(CreateFamilyMemberRequest r, Long familyId) {
        FamilyMember e = new FamilyMember();
        e.setFamilyId(familyId);
        e.setUserId(r.userId());
        e.setFirstName(r.firstName());
        e.setLastName(r.lastName());
        e.setRelationship(r.relationship());
        e.setEmail(r.email());
        e.setPhone(r.phone());
        e.setMobile(r.mobile());
        e.setOccupation(r.occupation());
        if (r.primary() != null) e.setPrimary(r.primary());
        if (r.emergencyContact() != null) e.setEmergencyContact(r.emergencyContact());
        e.setAddressStreet(r.addressStreet());
        e.setAddressSuburb(r.addressSuburb());
        e.setAddressState(r.addressState());
        e.setAddressPostcode(r.addressPostcode());
        if (r.addressCountry() != null) e.setAddressCountry(r.addressCountry());
        return e;
    }

    public void update(FamilyMember e, UpdateFamilyMemberRequest r) {
        if (r.firstName() != null) e.setFirstName(r.firstName());
        if (r.lastName() != null) e.setLastName(r.lastName());
        if (r.relationship() != null) e.setRelationship(r.relationship());
        if (r.email() != null) e.setEmail(r.email());
        if (r.phone() != null) e.setPhone(r.phone());
        if (r.mobile() != null) e.setMobile(r.mobile());
        if (r.occupation() != null) e.setOccupation(r.occupation());
        if (r.primary() != null) e.setPrimary(r.primary());
        if (r.emergencyContact() != null) e.setEmergencyContact(r.emergencyContact());
        if (r.addressStreet() != null) e.setAddressStreet(r.addressStreet());
        if (r.addressSuburb() != null) e.setAddressSuburb(r.addressSuburb());
        if (r.addressState() != null) e.setAddressState(r.addressState());
        if (r.addressPostcode() != null) e.setAddressPostcode(r.addressPostcode());
        if (r.addressCountry() != null) e.setAddressCountry(r.addressCountry());
    }

    public FamilyMemberResponse toResponse(FamilyMember e) {
        return new FamilyMemberResponse(
                e.getId(), e.getFamilyId(), e.getUserId(),
                e.getFirstName(), e.getLastName(), e.getRelationship(),
                e.getEmail(), e.getPhone(), e.getMobile(), e.getOccupation(),
                e.isPrimary(), e.isEmergencyContact(),
                e.getAddressStreet(), e.getAddressSuburb(), e.getAddressState(),
                e.getAddressPostcode(), e.getAddressCountry(),
                e.getCreatedAt(), e.getUpdatedAt());
    }
}
