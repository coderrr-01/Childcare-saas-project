package com.penguinpeak.childcare.organisation.service;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.when;

import com.penguinpeak.childcare.common.exception.ResourceNotFoundException;
import com.penguinpeak.childcare.organisation.dto.CreateOrganisationRequest;
import com.penguinpeak.childcare.organisation.entity.Organisation;
import com.penguinpeak.childcare.organisation.mapper.OrganisationMapper;
import com.penguinpeak.childcare.organisation.repository.OrganisationRepository;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;

class OrganisationServiceTest {
    private final OrganisationRepository repository = Mockito.mock(OrganisationRepository.class);
    private final OrganisationService service = new OrganisationService(repository, new OrganisationMapper());
    @Test void createsOrganisation() {
        when(repository.save(Mockito.any())).thenAnswer(invocation -> { Organisation e = invocation.getArgument(0); e.setId(1L); return e; });
        service.create(new CreateOrganisationRequest("Penguin Peak", null, null, null, null, null, null, null, null, null, null, null));
        Mockito.verify(repository).save(Mockito.any(Organisation.class));
    }
    @Test void missingOrganisationIsNotFound() {
        when(repository.findByIdAndDeletedAtIsNull(99L)).thenReturn(Optional.empty());
        assertThatThrownBy(() -> service.get(99L)).isInstanceOf(ResourceNotFoundException.class);
    }
}
