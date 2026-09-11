package com.penguinpeak.childcare.organisation.mapper;

import com.penguinpeak.childcare.organisation.dto.CentreResponse;
import com.penguinpeak.childcare.organisation.dto.CreateCentreRequest;
import com.penguinpeak.childcare.organisation.dto.UpdateCentreRequest;
import com.penguinpeak.childcare.organisation.entity.Centre;
import com.penguinpeak.childcare.organisation.entity.Organisation;
import java.util.Arrays;
import java.util.List;
import org.springframework.stereotype.Component;

@Component
public class CentreMapper {
    public Centre toEntity(CreateCentreRequest r, Organisation organisation) {
        Centre e = new Centre(); e.setOrganisation(organisation); e.setName(r.name()); e.setEmail(r.email()); e.setPhone(r.phone());
        e.setAddressStreet(r.addressStreet()); e.setAddressSuburb(r.addressSuburb()); e.setAddressState(r.addressState()); e.setAddressPostcode(r.addressPostcode());
        if (r.addressCountry() != null) e.setAddressCountry(r.addressCountry()); e.setCapacity(r.capacity());
        if (r.timezone() != null) e.setTimezone(r.timezone()); e.setLicenseNumber(r.licenseNumber()); e.setOpeningTime(r.openingTime()); e.setClosingTime(r.closingTime());
        if (r.operatingDays() != null) e.setOperatingDays(r.operatingDays().toArray(Integer[]::new)); return e;
    }
    public void update(Centre e, UpdateCentreRequest r) {
        if (r.name() != null) e.setName(r.name()); if (r.email() != null) e.setEmail(r.email()); if (r.phone() != null) e.setPhone(r.phone());
        if (r.addressStreet() != null) e.setAddressStreet(r.addressStreet()); if (r.addressSuburb() != null) e.setAddressSuburb(r.addressSuburb());
        if (r.addressState() != null) e.setAddressState(r.addressState()); if (r.addressPostcode() != null) e.setAddressPostcode(r.addressPostcode());
        if (r.addressCountry() != null) e.setAddressCountry(r.addressCountry()); if (r.capacity() != null) e.setCapacity(r.capacity());
        if (r.timezone() != null) e.setTimezone(r.timezone()); if (r.status() != null) e.setStatus(r.status());
        if (r.licenseNumber() != null) e.setLicenseNumber(r.licenseNumber()); if (r.openingTime() != null) e.setOpeningTime(r.openingTime());
        if (r.closingTime() != null) e.setClosingTime(r.closingTime()); if (r.operatingDays() != null) e.setOperatingDays(r.operatingDays().toArray(Integer[]::new));
    }
    public CentreResponse toResponse(Centre e) {
        List<Integer> days = e.getOperatingDays() == null ? null : Arrays.asList(e.getOperatingDays());
        return new CentreResponse(e.getId(), e.getOrganisation().getId(), e.getName(), e.getEmail(), e.getPhone(), e.getAddressStreet(),
                e.getAddressSuburb(), e.getAddressState(), e.getAddressPostcode(), e.getAddressCountry(), e.getCapacity(), e.getTimezone(),
                e.getStatus(), e.getLicenseNumber(), e.getOpeningTime(), e.getClosingTime(), days, e.getCreatedAt(), e.getUpdatedAt());
    }
}
