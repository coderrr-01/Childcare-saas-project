package com.penguinpeak.childcare.child.service;

import com.penguinpeak.childcare.authentication.service.AuditService;
import com.penguinpeak.childcare.child.dto.CreateEmergencyContactRequest;
import com.penguinpeak.childcare.child.dto.EmergencyContactResponse;
import com.penguinpeak.childcare.child.dto.UpdateEmergencyContactRequest;
import com.penguinpeak.childcare.child.entity.Child;
import com.penguinpeak.childcare.child.entity.EmergencyContact;
import com.penguinpeak.childcare.child.mapper.EmergencyContactMapper;
import com.penguinpeak.childcare.child.repository.ChildRepository;
import com.penguinpeak.childcare.child.repository.EmergencyContactRepository;
import com.penguinpeak.childcare.common.exception.ResourceNotFoundException;
import com.penguinpeak.childcare.common.security.CurrentUser;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class EmergencyContactService {

    private final EmergencyContactRepository repository;
    private final ChildRepository childRepository;
    private final EmergencyContactMapper mapper;
    private final AuditService auditService;

    @Transactional(readOnly = true)
    public List<EmergencyContactResponse> list(CurrentUser currentUser, Long childId) {
        Child child = findChild(childId);
        validateAccess(currentUser, child);
        return repository.findByChildIdOrderByPriorityAsc(childId).stream()
                .map(mapper::toResponse).toList();
    }

    @Transactional
    public EmergencyContactResponse create(CurrentUser currentUser, Long childId, CreateEmergencyContactRequest request) {
        Child child = findChild(childId);
        validateAccess(currentUser, child);
        EmergencyContact contact = mapper.toEntity(request, childId);
        EmergencyContact saved = repository.save(contact);
        auditService.log(currentUser.userId(), currentUser.organisationId(), currentUser.centreId(),
                "CREATE", "EMERGENCY_CONTACT", saved.getId(),
                "Added emergency contact " + saved.getName() + " for child " + childId,
                null, null);
        return mapper.toResponse(saved);
    }

    @Transactional
    public EmergencyContactResponse update(CurrentUser currentUser, Long contactId, UpdateEmergencyContactRequest request) {
        EmergencyContact contact = repository.findById(contactId)
                .orElseThrow(() -> new ResourceNotFoundException("Emergency contact", contactId));
        Child child = findChild(contact.getChildId());
        validateAccess(currentUser, child);
        mapper.update(contact, request);
        EmergencyContact saved = repository.save(contact);
        auditService.log(currentUser.userId(), currentUser.organisationId(), currentUser.centreId(),
                "UPDATE", "EMERGENCY_CONTACT", saved.getId(),
                "Updated emergency contact " + saved.getName(),
                null, null);
        return mapper.toResponse(saved);
    }

    private Child findChild(Long id) {
        return childRepository.findByIdAndDeletedAtIsNull(id)
                .orElseThrow(() -> new ResourceNotFoundException("Child", id));
    }

    private void validateAccess(CurrentUser currentUser, Child child) {
        if (currentUser.organisationId() == null && currentUser.centreId() == null) return;
        if (!child.getOrganisationId().equals(currentUser.organisationId())) {
            throw new ResourceNotFoundException("Child", child.getId());
        }
        if (currentUser.centreId() != null && child.getCentreId() != null
                && !child.getCentreId().equals(currentUser.centreId())) {
            throw new ResourceNotFoundException("Child", child.getId());
        }
    }
}
