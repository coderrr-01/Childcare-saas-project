package com.penguinpeak.childcare.child.mapper;

import com.penguinpeak.childcare.child.dto.CreateEmergencyContactRequest;
import com.penguinpeak.childcare.child.dto.EmergencyContactResponse;
import com.penguinpeak.childcare.child.dto.UpdateEmergencyContactRequest;
import com.penguinpeak.childcare.child.entity.EmergencyContact;
import org.springframework.stereotype.Component;

@Component
public class EmergencyContactMapper {

    public EmergencyContact toEntity(CreateEmergencyContactRequest r, Long childId) {
        EmergencyContact e = new EmergencyContact();
        e.setChildId(childId);
        e.setName(r.name());
        e.setRelationship(r.relationship());
        e.setPhone(r.phone());
        e.setMobile(r.mobile());
        e.setEmail(r.email());
        e.setPriority(r.priority() != null ? r.priority() : 1);
        return e;
    }

    public void update(EmergencyContact e, UpdateEmergencyContactRequest r) {
        if (r.name() != null) e.setName(r.name());
        if (r.relationship() != null) e.setRelationship(r.relationship());
        if (r.phone() != null) e.setPhone(r.phone());
        if (r.mobile() != null) e.setMobile(r.mobile());
        if (r.email() != null) e.setEmail(r.email());
        if (r.priority() != null) e.setPriority(r.priority());
    }

    public EmergencyContactResponse toResponse(EmergencyContact e) {
        return new EmergencyContactResponse(
                e.getId(), e.getChildId(), e.getName(), e.getRelationship(),
                e.getPhone(), e.getMobile(), e.getEmail(), e.getPriority(),
                e.getCreatedAt(), e.getUpdatedAt());
    }
}
