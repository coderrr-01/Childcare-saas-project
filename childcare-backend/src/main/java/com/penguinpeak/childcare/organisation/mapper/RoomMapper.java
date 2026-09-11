package com.penguinpeak.childcare.organisation.mapper;

import com.penguinpeak.childcare.organisation.dto.CreateRoomRequest;
import com.penguinpeak.childcare.organisation.dto.RoomResponse;
import com.penguinpeak.childcare.organisation.dto.UpdateRoomRequest;
import com.penguinpeak.childcare.organisation.entity.Centre;
import com.penguinpeak.childcare.organisation.entity.Room;
import org.springframework.stereotype.Component;

@Component
public class RoomMapper {
    public Room toEntity(CreateRoomRequest r, Centre centre) {
        Room e = new Room(); e.setOrganisation(centre.getOrganisation()); e.setCentre(centre); e.setName(r.name()); e.setCapacity(r.capacity());
        e.setMinAgeMonths(r.minAgeMonths()); e.setMaxAgeMonths(r.maxAgeMonths()); return e;
    }
    public void update(Room e, UpdateRoomRequest r) {
        if (r.name() != null) e.setName(r.name()); if (r.capacity() != null) e.setCapacity(r.capacity());
        if (r.minAgeMonths() != null) e.setMinAgeMonths(r.minAgeMonths()); if (r.maxAgeMonths() != null) e.setMaxAgeMonths(r.maxAgeMonths());
        if (r.active() != null) e.setActive(r.active());
    }
    public RoomResponse toResponse(Room e) {
        return new RoomResponse(e.getId(), e.getOrganisation().getId(), e.getCentre().getId(), e.getName(), e.getCapacity(),
                e.getMinAgeMonths(), e.getMaxAgeMonths(), e.isActive(), e.getCreatedAt(), e.getUpdatedAt());
    }
}
