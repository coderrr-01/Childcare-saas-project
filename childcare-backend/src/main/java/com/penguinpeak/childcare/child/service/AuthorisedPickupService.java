package com.penguinpeak.childcare.child.service;

import com.penguinpeak.childcare.authentication.service.AuditService;
import com.penguinpeak.childcare.child.dto.AuthorisedPickupResponse;
import com.penguinpeak.childcare.child.dto.CreateAuthorisedPickupRequest;
import com.penguinpeak.childcare.child.dto.UpdateAuthorisedPickupRequest;
import com.penguinpeak.childcare.child.entity.AuthorisedPickup;
import com.penguinpeak.childcare.child.entity.Child;
import com.penguinpeak.childcare.child.mapper.AuthorisedPickupMapper;
import com.penguinpeak.childcare.child.repository.AuthorisedPickupRepository;
import com.penguinpeak.childcare.child.repository.ChildRepository;
import com.penguinpeak.childcare.common.exception.ResourceNotFoundException;
import com.penguinpeak.childcare.common.security.CurrentUser;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthorisedPickupService {

    private final AuthorisedPickupRepository repository;
    private final ChildRepository childRepository;
    private final AuthorisedPickupMapper mapper;
    private final AuditService auditService;

    @Transactional(readOnly = true)
    public List<AuthorisedPickupResponse> list(CurrentUser currentUser, Long childId) {
        Child child = findChild(childId);
        validateAccess(currentUser, child);
        return repository.findByChildIdOrderByNameAsc(childId).stream()
                .map(mapper::toResponse).toList();
    }

    @Transactional
    public AuthorisedPickupResponse create(CurrentUser currentUser, Long childId, CreateAuthorisedPickupRequest request) {
        Child child = findChild(childId);
        validateAccess(currentUser, child);
        AuthorisedPickup pickup = mapper.toEntity(request, childId);
        AuthorisedPickup saved = repository.save(pickup);
        auditService.log(currentUser.userId(), currentUser.organisationId(), currentUser.centreId(),
                "CREATE", "AUTHORISED_PICKUP", saved.getId(),
                "Added authorised pickup " + saved.getName() + " for child " + childId,
                null, null);
        return mapper.toResponse(saved);
    }

    @Transactional
    public AuthorisedPickupResponse update(CurrentUser currentUser, Long pickupId, UpdateAuthorisedPickupRequest request) {
        AuthorisedPickup pickup = repository.findById(pickupId)
                .orElseThrow(() -> new ResourceNotFoundException("Authorised pickup", pickupId));
        Child child = findChild(pickup.getChildId());
        validateAccess(currentUser, child);
        mapper.update(pickup, request);
        AuthorisedPickup saved = repository.save(pickup);
        auditService.log(currentUser.userId(), currentUser.organisationId(), currentUser.centreId(),
                "UPDATE", "AUTHORISED_PICKUP", saved.getId(),
                "Updated authorised pickup " + saved.getName(),
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
