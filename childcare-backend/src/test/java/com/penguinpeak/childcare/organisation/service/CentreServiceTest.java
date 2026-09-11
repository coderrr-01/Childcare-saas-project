package com.penguinpeak.childcare.organisation.service;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.when;

import com.penguinpeak.childcare.common.exception.BusinessException;
import com.penguinpeak.childcare.common.exception.ResourceNotFoundException;
import com.penguinpeak.childcare.organisation.dto.CreateCentreRequest;
import com.penguinpeak.childcare.organisation.entity.Organisation;
import com.penguinpeak.childcare.organisation.mapper.CentreMapper;
import com.penguinpeak.childcare.organisation.repository.CentreRepository;
import com.penguinpeak.childcare.organisation.repository.OrganisationRepository;
import java.time.LocalTime;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;

class CentreServiceTest {
    private final CentreRepository centres = Mockito.mock(CentreRepository.class);
    private final OrganisationRepository organisations = Mockito.mock(OrganisationRepository.class);
    private final CentreService service = new CentreService(centres, organisations, new CentreMapper());
    @Test void rejectsMissingOrganisation() {
        when(organisations.findByIdAndDeletedAtIsNull(1L)).thenReturn(Optional.empty());
        assertThatThrownBy(() -> service.create(1L, request(LocalTime.of(8, 0), LocalTime.of(17, 0)))).isInstanceOf(ResourceNotFoundException.class);
    }
    @Test void rejectsInvalidOpeningHours() {
        assertThatThrownBy(() -> service.create(1L, request(LocalTime.of(17, 0), LocalTime.of(8, 0)))).isInstanceOf(BusinessException.class);
    }
    private CreateCentreRequest request(LocalTime open, LocalTime close) { return new CreateCentreRequest("CBD", null, null, null, null, null, null, null, 30, null, null, open, close, null); }
}
