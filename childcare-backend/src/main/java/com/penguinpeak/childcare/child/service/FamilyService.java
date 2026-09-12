package com.penguinpeak.childcare.child.service;

import com.penguinpeak.childcare.authentication.service.AuditService;
import com.penguinpeak.childcare.child.dto.CreateFamilyMemberRequest;
import com.penguinpeak.childcare.child.dto.CreateFamilyRequest;
import com.penguinpeak.childcare.child.dto.FamilyMemberResponse;
import com.penguinpeak.childcare.child.dto.FamilyResponse;
import com.penguinpeak.childcare.child.dto.UpdateFamilyMemberRequest;
import com.penguinpeak.childcare.child.dto.UpdateFamilyRequest;
import com.penguinpeak.childcare.child.entity.Family;
import com.penguinpeak.childcare.child.entity.FamilyMember;
import com.penguinpeak.childcare.child.mapper.FamilyMapper;
import com.penguinpeak.childcare.child.mapper.FamilyMemberMapper;
import com.penguinpeak.childcare.child.repository.FamilyMemberRepository;
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
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class FamilyService {

    private final FamilyRepository familyRepository;
    private final FamilyMemberRepository familyMemberRepository;
    private final CentreRepository centreRepository;
    private final FamilyMapper familyMapper;
    private final FamilyMemberMapper memberMapper;
    private final AuditService auditService;

    @Transactional
    public FamilyResponse create(CurrentUser currentUser, CreateFamilyRequest request) {
        Centre centre = findCentre(request.centreId());
        validateOrganisationAccess(currentUser, centre);
        Long orgId = currentUser.organisationId() != null ? currentUser.organisationId() : centre.getOrganisation().getId();
        if (familyRepository.existsByOrganisationIdAndFamilyNumberAndDeletedAtIsNull(
                orgId, request.familyNumber())) {
            throw new BusinessException("Family number '" + request.familyNumber() + "' already exists in this organisation.");
        }
        Family family = familyMapper.toEntity(request, orgId);
        Family saved = familyRepository.save(family);
        auditService.log(currentUser.userId(), currentUser.organisationId(), currentUser.centreId(),
                "CREATE", "FAMILY", saved.getId(),
                "Created family " + saved.getFamilyNumber(),
                null, null);
        return familyMapper.toResponse(saved, List.of());
    }

    @Transactional(readOnly = true)
    public FamilyResponse get(CurrentUser currentUser, Long id) {
        Family family = findActive(id);
        validateOrganisationAccess(currentUser, family);
        List<FamilyMember> members = familyMemberRepository.findByFamilyIdOrderByPrimaryDescLastNameAscFirstNameAsc(id);
        return familyMapper.toResponse(family, members);
    }

    @Transactional(readOnly = true)
    public Page<FamilyResponse> list(CurrentUser currentUser, Long centreId, Pageable pageable) {
        if (centreId != null) {
            validateCentreAccess(currentUser, centreId);
            Centre centre = findCentre(centreId);
            Long orgId = currentUser.organisationId() != null ? currentUser.organisationId() : centre.getOrganisation().getId();
            return familyRepository.findByOrganisationIdAndCentreIdAndDeletedAtIsNull(
                    orgId, centreId, pageable).map(f -> familyMapper.toResponse(f));
        }
        if (currentUser.centreId() != null) {
            return familyRepository.findByOrganisationIdAndCentreIdAndDeletedAtIsNull(
                    currentUser.organisationId(), currentUser.centreId(), pageable).map(f -> familyMapper.toResponse(f));
        }
        if (currentUser.organisationId() != null) {
            return familyRepository.findByOrganisationIdAndDeletedAtIsNull(
                    currentUser.organisationId(), pageable).map(f -> familyMapper.toResponse(f));
        }
        return familyRepository.findAll(pageable).map(f -> familyMapper.toResponse(f));
    }

    @Transactional
    public FamilyResponse update(CurrentUser currentUser, Long id, UpdateFamilyRequest request) {
        Family family = findActive(id);
        validateOrganisationAccess(currentUser, family);
        if (request.familyNumber() != null && !request.familyNumber().equals(family.getFamilyNumber())) {
            if (familyRepository.existsByOrganisationIdAndFamilyNumberAndDeletedAtIsNull(
                    currentUser.organisationId(), request.familyNumber())) {
                throw new BusinessException("Family number '" + request.familyNumber() + "' already exists in this organisation.");
            }
        }
        familyMapper.update(family, request);
        Family saved = familyRepository.save(family);
        auditService.log(currentUser.userId(), currentUser.organisationId(), currentUser.centreId(),
                "UPDATE", "FAMILY", saved.getId(),
                "Updated family " + saved.getFamilyNumber(),
                null, null);
        List<FamilyMember> members = familyMemberRepository.findByFamilyIdOrderByPrimaryDescLastNameAscFirstNameAsc(id);
        return familyMapper.toResponse(saved, members);
    }

    @Transactional
    public FamilyMemberResponse addMember(CurrentUser currentUser, Long familyId, CreateFamilyMemberRequest request) {
        Family family = findActive(familyId);
        validateOrganisationAccess(currentUser, family);
        FamilyMember member = memberMapper.toEntity(request, familyId);
        FamilyMember saved = familyMemberRepository.save(member);
        auditService.log(currentUser.userId(), currentUser.organisationId(), currentUser.centreId(),
                "CREATE", "FAMILY_MEMBER", saved.getId(),
                "Added member " + saved.getFirstName() + " " + saved.getLastName() + " to family " + family.getFamilyNumber(),
                null, null);
        return memberMapper.toResponse(saved);
    }

    @Transactional
    public FamilyMemberResponse updateMember(CurrentUser currentUser, Long familyId, Long memberId,
                                              UpdateFamilyMemberRequest request) {
        Family family = findActive(familyId);
        validateOrganisationAccess(currentUser, family);
        FamilyMember member = findFamilyMember(memberId, familyId);
        memberMapper.update(member, request);
        FamilyMember saved = familyMemberRepository.save(member);
        auditService.log(currentUser.userId(), currentUser.organisationId(), currentUser.centreId(),
                "UPDATE", "FAMILY_MEMBER", saved.getId(),
                "Updated member " + saved.getFirstName() + " " + saved.getLastName(),
                null, null);
        return memberMapper.toResponse(saved);
    }

    private Family findActive(Long id) {
        return familyRepository.findByIdAndDeletedAtIsNull(id)
                .orElseThrow(() -> new ResourceNotFoundException("Family", id));
    }

    private FamilyMember findFamilyMember(Long id, Long familyId) {
        return familyMemberRepository.findByIdAndFamilyId(id, familyId)
                .orElseThrow(() -> new ResourceNotFoundException("Family member", id));
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

    private void validateOrganisationAccess(CurrentUser currentUser, Family family) {
        if (isPlatformAdmin(currentUser)) return;
        if (!family.getOrganisationId().equals(currentUser.organisationId())) {
            throw new BusinessException("Access denied: family does not belong to your organisation.");
        }
        if (currentUser.centreId() != null && family.getCentreId() != null
                && !family.getCentreId().equals(currentUser.centreId())) {
            throw new BusinessException("Access denied: family does not belong to your centre.");
        }
    }

    private void validateCentreAccess(CurrentUser currentUser, Long centreId) {
        if (isPlatformAdmin(currentUser)) return;
        if (currentUser.centreId() != null && !centreId.equals(currentUser.centreId())) {
            throw new BusinessException("Access denied: you can only access your own centre's data.");
        }
    }
}
