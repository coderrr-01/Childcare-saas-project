package com.penguinpeak.childcare.child.mapper;

import com.penguinpeak.childcare.child.dto.ChildFamilyRelationshipResponse;
import com.penguinpeak.childcare.child.entity.ChildFamilyRelationship;
import org.springframework.stereotype.Component;

@Component
public class ChildFamilyRelationshipMapper {

    public ChildFamilyRelationshipResponse toResponse(ChildFamilyRelationship e, String familyNumber) {
        return new ChildFamilyRelationshipResponse(
                e.getId(), e.getChildId(), e.getFamilyId(), e.getFamilyMemberId(),
                familyNumber, e.getRelationshipType(), e.isPrimaryGuardian(), e.getCreatedAt());
    }
}
