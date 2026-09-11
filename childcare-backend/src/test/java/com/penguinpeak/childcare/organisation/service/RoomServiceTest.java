package com.penguinpeak.childcare.organisation.service;

import static org.assertj.core.api.Assertions.assertThatThrownBy;

import com.penguinpeak.childcare.common.exception.BusinessException;
import com.penguinpeak.childcare.organisation.dto.CreateRoomRequest;
import com.penguinpeak.childcare.organisation.mapper.RoomMapper;
import com.penguinpeak.childcare.organisation.repository.CentreRepository;
import com.penguinpeak.childcare.organisation.repository.RoomRepository;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;

class RoomServiceTest {
    private final RoomService service = new RoomService(Mockito.mock(RoomRepository.class), Mockito.mock(CentreRepository.class), new RoomMapper());
    @Test void rejectsInvertedAgeRange() {
        assertThatThrownBy(() -> service.create(1L, new CreateRoomRequest("Toddlers", 12, 36, 24))).isInstanceOf(BusinessException.class);
    }
}
