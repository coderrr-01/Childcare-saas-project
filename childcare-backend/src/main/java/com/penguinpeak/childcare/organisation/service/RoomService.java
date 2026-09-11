package com.penguinpeak.childcare.organisation.service;

import com.penguinpeak.childcare.common.exception.BusinessException;
import com.penguinpeak.childcare.common.exception.ResourceNotFoundException;
import com.penguinpeak.childcare.organisation.dto.CreateRoomRequest;
import com.penguinpeak.childcare.organisation.dto.RoomResponse;
import com.penguinpeak.childcare.organisation.dto.UpdateRoomRequest;
import com.penguinpeak.childcare.organisation.entity.Centre;
import com.penguinpeak.childcare.organisation.entity.Room;
import com.penguinpeak.childcare.organisation.mapper.RoomMapper;
import com.penguinpeak.childcare.organisation.repository.CentreRepository;
import com.penguinpeak.childcare.organisation.repository.RoomRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service @RequiredArgsConstructor
public class RoomService {
    private final RoomRepository roomRepository; private final CentreRepository centreRepository; private final RoomMapper mapper;
    @Transactional public RoomResponse create(Long centreId, CreateRoomRequest request) {
        validateAgeRange(request.minAgeMonths(), request.maxAgeMonths()); Centre centre = findCentre(centreId);
        return mapper.toResponse(roomRepository.save(mapper.toEntity(request, centre)));
    }
    @Transactional(readOnly = true) public RoomResponse get(Long id) { return mapper.toResponse(find(id)); }
    @Transactional(readOnly = true) public Page<RoomResponse> list(Long centreId, Pageable pageable) {
        findCentre(centreId); return roomRepository.findByCentreId(centreId, pageable).map(mapper::toResponse);
    }
    @Transactional public RoomResponse update(Long id, UpdateRoomRequest request) {
        Room room = find(id); mapper.update(room, request); validateAgeRange(room.getMinAgeMonths(), room.getMaxAgeMonths());
        return mapper.toResponse(roomRepository.save(room));
    }
    private Room find(Long id) { return roomRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Room", id)); }
    private Centre findCentre(Long id) { return centreRepository.findByIdAndDeletedAtIsNull(id).orElseThrow(() -> new ResourceNotFoundException("Centre", id)); }
    private void validateAgeRange(Integer min, Integer max) {
        if (min != null && max != null && min > max) throw new BusinessException("Minimum age must not exceed maximum age.");
    }
}
