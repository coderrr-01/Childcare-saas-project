package com.penguinpeak.childcare.child.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

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
import com.penguinpeak.childcare.organisation.entity.Organisation;
import com.penguinpeak.childcare.organisation.entity.Centre;
import com.penguinpeak.childcare.organisation.repository.CentreRepository;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

class FamilyServiceTest {

    private final FamilyRepository familyRepository = Mockito.mock(FamilyRepository.class);
    private final FamilyMemberRepository familyMemberRepository = Mockito.mock(FamilyMemberRepository.class);
    private final CentreRepository centreRepository = Mockito.mock(CentreRepository.class);
    private final AuditService auditService = Mockito.mock(AuditService.class);

    private final FamilyService service = new FamilyService(
            familyRepository, familyMemberRepository, centreRepository,
            new FamilyMapper(), new FamilyMemberMapper(), auditService);

    private final CurrentUser user = new CurrentUser(1L, 10L, 20L, Set.of("ROLE_USER"));

    private Centre buildCentre(Long orgId) {
        Organisation org = new Organisation();
        org.setId(orgId);
        Centre centre = new Centre();
        centre.setId(1L);
        centre.setOrganisation(org);
        return centre;
    }

    private Family buildFamily(Long id, Long orgId, Long centreId, String familyNumber) {
        Family family = new Family();
        family.setId(id);
        family.setOrganisationId(orgId);
        family.setCentreId(centreId);
        family.setFamilyNumber(familyNumber);
        family.setActive(true);
        return family;
    }

    private FamilyMember buildMember(Long id, Long familyId, String firstName, String lastName) {
        FamilyMember member = new FamilyMember();
        member.setId(id);
        member.setFamilyId(familyId);
        member.setFirstName(firstName);
        member.setLastName(lastName);
        member.setRelationship("Parent");
        return member;
    }

    @Test void create_success() {
        Centre centre = buildCentre(10L);
        when(centreRepository.findByIdAndDeletedAtIsNull(1L)).thenReturn(Optional.of(centre));
        when(familyRepository.existsByOrganisationIdAndFamilyNumberAndDeletedAtIsNull(10L, "FAM-001"))
                .thenReturn(false);
        when(familyRepository.save(any())).thenAnswer(inv -> {
            Family f = inv.getArgument(0);
            f.setId(1L);
            return f;
        });

        FamilyResponse response = service.create(user, new CreateFamilyRequest(1L, "FAM-001", null));

        assertThat(response.familyNumber()).isEqualTo("FAM-001");
        verify(familyRepository).save(any(Family.class));
        verify(auditService).log(anyLong(), anyLong(), anyLong(), Mockito.eq("CREATE"), Mockito.eq("FAMILY"), anyLong(), any(), any(), any());
    }

    @Test void create_centreNotFound() {
        when(centreRepository.findByIdAndDeletedAtIsNull(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.create(user, new CreateFamilyRequest(99L, "FAM-001", null)))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test void create_duplicateFamilyNumber() {
        Centre centre = buildCentre(10L);
        when(centreRepository.findByIdAndDeletedAtIsNull(1L)).thenReturn(Optional.of(centre));
        when(familyRepository.existsByOrganisationIdAndFamilyNumberAndDeletedAtIsNull(10L, "FAM-001"))
                .thenReturn(true);

        assertThatThrownBy(() -> service.create(user, new CreateFamilyRequest(1L, "FAM-001", null)))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("already exists");
    }

    @Test void get_successWithMembers() {
        Family family = buildFamily(1L, 10L, 20L, "FAM-001");
        FamilyMember member = buildMember(1L, 1L, "John", "Doe");
        when(familyRepository.findByIdAndDeletedAtIsNull(1L)).thenReturn(Optional.of(family));
        when(familyMemberRepository.findByFamilyIdOrderByPrimaryDescLastNameAscFirstNameAsc(1L))
                .thenReturn(List.of(member));

        FamilyResponse response = service.get(user, 1L);

        assertThat(response.familyNumber()).isEqualTo("FAM-001");
        assertThat(response.members()).hasSize(1);
        assertThat(response.members().get(0).firstName()).isEqualTo("John");
    }

    @Test void get_familyNotFound() {
        when(familyRepository.findByIdAndDeletedAtIsNull(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.get(user, 99L))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test void list_returnsFamilies() {
        Centre centre = buildCentre(10L);
        centre.setId(20L);
        Family family = buildFamily(1L, 10L, 20L, "FAM-001");
        Pageable pageable = PageRequest.of(0, 10);
        Page<Family> page = new PageImpl<>(List.of(family), pageable, 1);
        when(centreRepository.findByIdAndDeletedAtIsNull(20L)).thenReturn(Optional.of(centre));
        when(familyRepository.findByOrganisationIdAndCentreIdAndDeletedAtIsNull(10L, 20L, pageable))
                .thenReturn(page);

        Page<FamilyResponse> result = service.list(user, 20L, pageable);

        assertThat(result.getContent()).hasSize(1);
        assertThat(result.getContent().get(0).familyNumber()).isEqualTo("FAM-001");
    }

    @Test void update_success() {
        Family family = buildFamily(1L, 10L, 20L, "FAM-001");
        when(familyRepository.findByIdAndDeletedAtIsNull(1L)).thenReturn(Optional.of(family));
        when(familyRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
        when(familyMemberRepository.findByFamilyIdOrderByPrimaryDescLastNameAscFirstNameAsc(1L))
                .thenReturn(List.of());

        FamilyResponse response = service.update(user, 1L,
                new UpdateFamilyRequest("FAM-002", "Updated notes", null));

        assertThat(response.familyNumber()).isEqualTo("FAM-002");
        assertThat(response.notes()).isEqualTo("Updated notes");
        verify(familyRepository).save(any(Family.class));
        verify(auditService).log(anyLong(), anyLong(), anyLong(), Mockito.eq("UPDATE"), Mockito.eq("FAMILY"), anyLong(), any(), any(), any());
    }

    @Test void addMember_success() {
        Family family = buildFamily(1L, 10L, 20L, "FAM-001");
        when(familyRepository.findByIdAndDeletedAtIsNull(1L)).thenReturn(Optional.of(family));
        when(familyMemberRepository.save(any())).thenAnswer(inv -> {
            FamilyMember m = inv.getArgument(0);
            m.setId(1L);
            return m;
        });

        FamilyMemberResponse response = service.addMember(user, 1L,
                new CreateFamilyMemberRequest(null, "Jane", "Doe", "Parent",
                        null, null, null, null, null, null,
                        null, null, null, null, null));

        assertThat(response.firstName()).isEqualTo("Jane");
        assertThat(response.lastName()).isEqualTo("Doe");
        verify(familyMemberRepository).save(any(FamilyMember.class));
        verify(auditService).log(anyLong(), anyLong(), anyLong(), Mockito.eq("CREATE"), Mockito.eq("FAMILY_MEMBER"), anyLong(), any(), any(), any());
    }

    @Test void addMember_familyNotFound() {
        when(familyRepository.findByIdAndDeletedAtIsNull(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.addMember(user, 99L,
                new CreateFamilyMemberRequest(null, "Jane", "Doe", "Parent",
                        null, null, null, null, null, null,
                        null, null, null, null, null)))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test void updateMember_success() {
        Family family = buildFamily(1L, 10L, 20L, "FAM-001");
        FamilyMember member = buildMember(1L, 1L, "John", "Doe");
        when(familyRepository.findByIdAndDeletedAtIsNull(1L)).thenReturn(Optional.of(family));
        when(familyMemberRepository.findByIdAndFamilyId(1L, 1L)).thenReturn(Optional.of(member));
        when(familyMemberRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        FamilyMemberResponse response = service.updateMember(user, 1L, 1L,
                new UpdateFamilyMemberRequest("John", "Smith", null,
                        null, null, null, null, null, null,
                        null, null, null, null, null));

        assertThat(response.lastName()).isEqualTo("Smith");
        verify(familyMemberRepository).save(any(FamilyMember.class));
        verify(auditService).log(anyLong(), anyLong(), anyLong(), Mockito.eq("UPDATE"), Mockito.eq("FAMILY_MEMBER"), anyLong(), any(), any(), any());
    }
}
