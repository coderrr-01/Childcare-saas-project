package com.penguinpeak.childcare.child.service;

import com.penguinpeak.childcare.authentication.service.AuditService;
import com.penguinpeak.childcare.child.dto.ChildResponse;
import com.penguinpeak.childcare.child.dto.CreateChildRequest;
import com.penguinpeak.childcare.child.dto.UpdateChildRequest;
import com.penguinpeak.childcare.child.entity.Child;
import com.penguinpeak.childcare.child.entity.ChildFamilyRelationship;
import com.penguinpeak.childcare.child.entity.Family;
import com.penguinpeak.childcare.child.mapper.ChildMapper;
import com.penguinpeak.childcare.child.repository.ChildFamilyRelationshipRepository;
import com.penguinpeak.childcare.child.repository.ChildRepository;
import com.penguinpeak.childcare.child.repository.FamilyRepository;
import com.penguinpeak.childcare.common.exception.BusinessException;
import com.penguinpeak.childcare.common.exception.ResourceNotFoundException;
import com.penguinpeak.childcare.common.security.CurrentUser;
import com.penguinpeak.childcare.organisation.entity.Centre;
import com.penguinpeak.childcare.organisation.repository.CentreRepository;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ChildService {

    private final ChildRepository childRepository;
    private final FamilyRepository familyRepository;
    private final ChildFamilyRelationshipRepository relationshipRepository;
    private final CentreRepository centreRepository;
    private final ChildMapper mapper;
    private final AuditService auditService;

    @Transactional
    public ChildResponse create(CurrentUser currentUser, CreateChildRequest request) {
        Centre centre = findCentre(request.centreId());
        validateOrganisationAccess(currentUser, centre);
        Long orgId = currentUser.organisationId() != null ? currentUser.organisationId() : centre.getOrganisation().getId();
        Child child = mapper.toEntity(request, orgId);
        Child saved = childRepository.save(child);
        auditService.log(currentUser.userId(), currentUser.organisationId(), currentUser.centreId(),
                "CREATE", "CHILD", saved.getId(),
                "Created child " + saved.getFirstName() + " " + saved.getLastName(),
                null, null);
        return mapper.toResponse(saved);
    }

    @Transactional(readOnly = true)
    public ChildResponse get(CurrentUser currentUser, Long id) {
        Child child = findActive(id);
        validateOrganisationAccess(currentUser, child.getOrganisationId(), child.getCentreId());
        List<ChildFamilyRelationship> relationships = relationshipRepository.findByChildIdOrderByPrimaryGuardianDesc(id);
        List<Family> families = familyRepository.findAllById(relationships.stream()
                .map(ChildFamilyRelationship::getFamilyId).toList());
        return mapper.toResponse(child, relationships, families);
    }

    @Transactional(readOnly = true)
    public Page<ChildResponse> list(CurrentUser currentUser, Long centreId, String search,
                                     String enrolmentStatus, String gender, Pageable pageable) {
        Specification<Child> spec = (root, query, cb) -> cb.conjunction();
        spec = spec.and((root, query, cb) -> cb.isNull(root.get("deletedAt")));
        if (currentUser.organisationId() != null) {
            spec = spec.and((root, query, cb) -> cb.equal(root.get("organisationId"), currentUser.organisationId()));
        }
        if (centreId != null) {
            validateCentreAccess(currentUser, centreId);
            spec = spec.and((root, query, cb) -> cb.equal(root.get("centreId"), centreId));
        } else if (currentUser.centreId() != null) {
            spec = spec.and((root, query, cb) -> cb.equal(root.get("centreId"), currentUser.centreId()));
        }
        if (search != null && !search.isBlank()) {
            String pattern = "%" + search.toLowerCase() + "%";
            spec = spec.and((root, query, cb) -> cb.or(
                    cb.like(cb.lower(root.get("firstName")), pattern),
                    cb.like(cb.lower(root.get("lastName")), pattern)));
        }
        if (enrolmentStatus != null && !enrolmentStatus.isBlank()) {
            spec = spec.and((root, query, cb) -> cb.equal(root.get("enrolmentStatus"), enrolmentStatus));
        }
        if (gender != null && !gender.isBlank()) {
            spec = spec.and((root, query, cb) -> cb.equal(root.get("gender"), gender));
        }
        return childRepository.findAll(spec, pageable).map(mapper::toResponse);
    }

    @Transactional
    public ChildResponse update(CurrentUser currentUser, Long id, UpdateChildRequest request) {
        Child child = findActive(id);
        validateOrganisationAccess(currentUser, child.getOrganisationId(), child.getCentreId());
        mapper.update(child, request);
        Child saved = childRepository.save(child);
        auditService.log(currentUser.userId(), currentUser.organisationId(), currentUser.centreId(),
                "UPDATE", "CHILD", saved.getId(),
                "Updated child " + saved.getFirstName() + " " + saved.getLastName(),
                null, null);
        return mapper.toResponse(saved);
    }

    @Transactional
    public void delete(CurrentUser currentUser, Long id) {
        Child child = findActive(id);
        validateOrganisationAccess(currentUser, child.getOrganisationId(), child.getCentreId());
        child.setDeletedAt(java.time.Instant.now());
        childRepository.save(child);
        auditService.log(currentUser.userId(), currentUser.organisationId(), currentUser.centreId(),
                "DELETE", "CHILD", child.getId(),
                "Deleted child " + child.getFirstName() + " " + child.getLastName(),
                null, null);
    }

    @Transactional
    public ChildResponse assignFamily(CurrentUser currentUser, Long childId, Long familyId,
                                       String relationshipType, boolean primaryGuardian) {
        Child child = findActive(childId);
        Family family = findFamily(familyId);
        validateOrganisationAccess(currentUser, child.getOrganisationId(), child.getCentreId());
        if (!child.getOrganisationId().equals(family.getOrganisationId())) {
            throw new BusinessException("Family does not belong to the same organisation as the child.");
        }
        if (relationshipRepository.existsByChildIdAndFamilyId(childId, familyId)) {
            throw new BusinessException("This child is already linked to this family.");
        }
        ChildFamilyRelationship rel = new ChildFamilyRelationship();
        rel.setChildId(childId);
        rel.setFamilyId(familyId);
        rel.setRelationshipType(relationshipType != null ? relationshipType : "parent");
        rel.setPrimaryGuardian(primaryGuardian);
        relationshipRepository.save(rel);
        auditService.log(currentUser.userId(), currentUser.organisationId(), currentUser.centreId(),
                "CREATE", "CHILD_FAMILY_RELATIONSHIP", rel.getId(),
                "Linked child " + childId + " to family " + familyId,
                null, null);
        return get(currentUser, childId);
    }

    private Child findActive(Long id) {
        return childRepository.findByIdAndDeletedAtIsNull(id)
                .orElseThrow(() -> new ResourceNotFoundException("Child", id));
    }

    private Family findFamily(Long id) {
        return familyRepository.findByIdAndDeletedAtIsNull(id)
                .orElseThrow(() -> new ResourceNotFoundException("Family", id));
    }

    private Centre findCentre(Long id) {
        return centreRepository.findByIdAndDeletedAtIsNull(id)
                .orElseThrow(() -> new ResourceNotFoundException("Centre", id));
    }

    private boolean isPlatformAdmin(CurrentUser currentUser) {
        return currentUser.organisationId() == null && currentUser.centreId() == null;
    }

    private void validateOrganisationAccess(CurrentUser currentUser, Centre centre) {
        if (isPlatformAdmin(currentUser)) return;
        if (!centre.getOrganisation().getId().equals(currentUser.organisationId())) {
            throw new BusinessException("Access denied: centre does not belong to your organisation.");
        }
    }

    private void validateOrganisationAccess(CurrentUser currentUser, Long organisationId, Long centreId) {
        if (isPlatformAdmin(currentUser)) return;
        if (!organisationId.equals(currentUser.organisationId())) {
            throw new BusinessException("Access denied: resource does not belong to your organisation.");
        }
        if (currentUser.centreId() != null && centreId != null && !centreId.equals(currentUser.centreId())) {
            throw new BusinessException("Access denied: resource does not belong to your centre.");
        }
    }

    private void validateCentreAccess(CurrentUser currentUser, Long centreId) {
        if (isPlatformAdmin(currentUser)) return;
        if (currentUser.centreId() != null && !centreId.equals(currentUser.centreId())) {
            throw new BusinessException("Access denied: you can only access your own centre's data.");
        }
    }
}
