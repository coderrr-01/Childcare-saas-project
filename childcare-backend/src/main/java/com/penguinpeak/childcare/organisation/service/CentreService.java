package com.penguinpeak.childcare.organisation.service;

import com.penguinpeak.childcare.common.exception.BusinessException;
import com.penguinpeak.childcare.common.exception.ResourceNotFoundException;
import com.penguinpeak.childcare.organisation.dto.CentreResponse;
import com.penguinpeak.childcare.organisation.dto.CreateCentreRequest;
import com.penguinpeak.childcare.organisation.dto.UpdateCentreRequest;
import com.penguinpeak.childcare.organisation.entity.Centre;
import com.penguinpeak.childcare.organisation.entity.Organisation;
import com.penguinpeak.childcare.organisation.mapper.CentreMapper;
import com.penguinpeak.childcare.organisation.repository.CentreRepository;
import com.penguinpeak.childcare.organisation.repository.OrganisationRepository;
import java.time.LocalTime;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service @RequiredArgsConstructor
public class CentreService {
    private final CentreRepository centreRepository; private final OrganisationRepository organisationRepository; private final CentreMapper mapper;
    @Transactional public CentreResponse create(Long organisationId, CreateCentreRequest request) {
        validateHours(request.openingTime(), request.closingTime());
        Organisation organisation = findOrganisation(organisationId); return mapper.toResponse(centreRepository.save(mapper.toEntity(request, organisation)));
    }
    @Transactional(readOnly = true) public CentreResponse get(Long id) { return mapper.toResponse(find(id)); }
    @Transactional(readOnly = true) public Page<CentreResponse> list(Long organisationId, Pageable pageable) {
        findOrganisation(organisationId); return centreRepository.findByOrganisationIdAndDeletedAtIsNull(organisationId, pageable).map(mapper::toResponse);
    }
    @Transactional public CentreResponse update(Long id, UpdateCentreRequest request) {
        Centre centre = find(id); mapper.update(centre, request); validateHours(centre.getOpeningTime(), centre.getClosingTime());
        return mapper.toResponse(centreRepository.save(centre));
    }
    private Centre find(Long id) { return centreRepository.findByIdAndDeletedAtIsNull(id).orElseThrow(() -> new ResourceNotFoundException("Centre", id)); }
    private Organisation findOrganisation(Long id) { return organisationRepository.findByIdAndDeletedAtIsNull(id).orElseThrow(() -> new ResourceNotFoundException("Organisation", id)); }
    private void validateHours(LocalTime opening, LocalTime closing) {
        if (opening != null && closing != null && !opening.isBefore(closing)) throw new BusinessException("Opening time must be before closing time.");
    }
}
