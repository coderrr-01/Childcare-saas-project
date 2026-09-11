package com.penguinpeak.childcare.organisation.service;

import com.penguinpeak.childcare.common.exception.ResourceNotFoundException;
import com.penguinpeak.childcare.organisation.dto.CreateOrganisationRequest;
import com.penguinpeak.childcare.organisation.dto.OrganisationResponse;
import com.penguinpeak.childcare.organisation.dto.UpdateOrganisationRequest;
import com.penguinpeak.childcare.organisation.entity.Organisation;
import com.penguinpeak.childcare.organisation.mapper.OrganisationMapper;
import com.penguinpeak.childcare.organisation.repository.OrganisationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service @RequiredArgsConstructor
public class OrganisationService {
    private final OrganisationRepository repository;
    private final OrganisationMapper mapper;
    @Transactional public OrganisationResponse create(CreateOrganisationRequest request) { return mapper.toResponse(repository.save(mapper.toEntity(request))); }
    @Transactional(readOnly = true) public OrganisationResponse get(Long id) { return mapper.toResponse(find(id)); }
    @Transactional(readOnly = true) public Page<OrganisationResponse> list(Pageable pageable) { return repository.findByDeletedAtIsNull(pageable).map(mapper::toResponse); }
    @Transactional public OrganisationResponse update(Long id, UpdateOrganisationRequest request) {
        Organisation entity = find(id); mapper.update(entity, request); return mapper.toResponse(repository.save(entity));
    }
    private Organisation find(Long id) { return repository.findByIdAndDeletedAtIsNull(id).orElseThrow(() -> new ResourceNotFoundException("Organisation", id)); }
}
