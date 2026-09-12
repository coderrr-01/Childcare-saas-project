package com.penguinpeak.childcare.child.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.penguinpeak.childcare.authentication.service.AuditService;
import com.penguinpeak.childcare.child.dto.ChildResponse;
import com.penguinpeak.childcare.child.dto.CreateChildRequest;
import com.penguinpeak.childcare.child.dto.UpdateChildRequest;
import com.penguinpeak.childcare.child.entity.Child;
import com.penguinpeak.childcare.child.entity.ChildFamilyRelationship;
import com.penguinpeak.childcare.child.entity.Family;
import com.penguinpeak.childcare.child.mapper.ChildMapper;
import com.penguinpeak.childcare.child.repository.ChildFamilyRelationshipRepository;
import com.penguinpeak.childcare.child.repository.ChildRepository;
import com.penguinpeak.childcare.child.repository.FamilyRepository;
import com.penguinpeak.childcare.common.exception.BusinessException;
import com.penguinpeak.childcare.common.exception.ResourceNotFoundException;
import com.penguinpeak.childcare.common.security.CurrentUser;
import com.penguinpeak.childcare.organisation.entity.Centre;
import com.penguinpeak.childcare.organisation.entity.Organisation;
import com.penguinpeak.childcare.organisation.repository.CentreRepository;
import java.time.LocalDate;
import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.mockito.Mockito;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;

class ChildServiceTest {

    private final ChildRepository childRepository = Mockito.mock(ChildRepository.class);
    private final FamilyRepository familyRepository = Mockito.mock(FamilyRepository.class);
    private final ChildFamilyRelationshipRepository relationshipRepository = Mockito.mock(ChildFamilyRelationshipRepository.class);
    private final CentreRepository centreRepository = Mockito.mock(CentreRepository.class);
    private final ChildMapper mapper = new ChildMapper();
    private final AuditService auditService = Mockito.mock(AuditService.class);

    private final ChildService service = new ChildService(
            childRepository, familyRepository, relationshipRepository,
            centreRepository, mapper, auditService);

    private static final Long ORG_ID = 1L;
    private static final Long CENTRE_ID = 10L;
    private static final Long USER_ID = 100L;
    private static final Long CHILD_ID = 200L;
    private static final Long FAMILY_ID = 300L;

    private final CurrentUser orgUser = new CurrentUser(USER_ID, ORG_ID, CENTRE_ID, Set.of("ROLE_ORG_ADMIN"));
    private final CurrentUser platformAdmin = new CurrentUser(USER_ID, null, null, Set.of("ROLE_PLATFORM_ADMIN"));

    // ── create ──────────────────────────────────────────────────────────

    @Test
    void create_success() {
        Centre centre = buildCentre(CENTRE_ID, ORG_ID);
        CreateChildRequest req = new CreateChildRequest(CENTRE_ID, null, "Alice", "Smith",
                LocalDate.of(2020, 3, 15), "female", "ENROLLED",
                null, null, null, null);

        when(centreRepository.findByIdAndDeletedAtIsNull(CENTRE_ID)).thenReturn(Optional.of(centre));
        when(childRepository.save(any(Child.class))).thenAnswer(inv -> {
            Child c = inv.getArgument(0);
            c.setId(CHILD_ID);
            return c;
        });

        ChildResponse response = service.create(orgUser, req);

        assertThat(response).isNotNull();
        assertThat(response.firstName()).isEqualTo("Alice");
        assertThat(response.lastName()).isEqualTo("Smith");
        verify(childRepository).save(any(Child.class));
        verify(auditService).log(eq(USER_ID), eq(ORG_ID), eq(CENTRE_ID),
                eq("CREATE"), eq("CHILD"), anyLong(), anyString(), Mockito.isNull(), Mockito.isNull());
    }

    @Test
    void create_centreNotFound() {
        when(centreRepository.findByIdAndDeletedAtIsNull(CENTRE_ID)).thenReturn(Optional.empty());

        CreateChildRequest req = new CreateChildRequest(CENTRE_ID, null, "Alice", "Smith",
                LocalDate.of(2020, 3, 15), "female", "ENROLLED",
                null, null, null, null);

        assertThatThrownBy(() -> service.create(orgUser, req))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("Centre");
    }

    // ── get ─────────────────────────────────────────────────────────────

    @Test
    void get_success() {
        Child child = buildChild(CHILD_ID, ORG_ID, CENTRE_ID);
        when(childRepository.findByIdAndDeletedAtIsNull(CHILD_ID)).thenReturn(Optional.of(child));
        when(relationshipRepository.findByChildIdOrderByPrimaryGuardianDesc(CHILD_ID)).thenReturn(List.of());
        when(familyRepository.findAllById(List.of())).thenReturn(List.of());

        ChildResponse response = service.get(orgUser, CHILD_ID);

        assertThat(response).isNotNull();
        assertThat(response.id()).isEqualTo(CHILD_ID);
    }

    @Test
    void get_notFound() {
        when(childRepository.findByIdAndDeletedAtIsNull(CHILD_ID)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.get(orgUser, CHILD_ID))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("Child");
    }

    // ── list ────────────────────────────────────────────────────────────

    @Test
    void list_withSearchFilter() {
        Child child = buildChild(CHILD_ID, ORG_ID, CENTRE_ID);
        when(childRepository.findAll(Mockito.<Specification<Child>>any(), Mockito.<Pageable>any()))
                .thenReturn(new PageImpl<>(List.of(child), PageRequest.of(0, 10), 1));

        var result = service.list(orgUser, null, "alice", null, null, PageRequest.of(0, 10));

        assertThat(result.getContent()).hasSize(1);
        verify(childRepository).findAll(Mockito.<Specification<Child>>any(), Mockito.<Pageable>any());
    }

    @Test
    void list_withCentreFilter() {
        when(childRepository.findAll(Mockito.<Specification<Child>>any(), Mockito.<Pageable>any()))
                .thenReturn(new PageImpl<>(List.of(), PageRequest.of(0, 10), 0));

        service.list(orgUser, CENTRE_ID, null, null, null, PageRequest.of(0, 10));

        verify(childRepository).findAll(Mockito.<Specification<Child>>any(), Mockito.<Pageable>any());
    }

    @Test
    void list_withEnrolmentStatusFilter() {
        when(childRepository.findAll(Mockito.<Specification<Child>>any(), Mockito.<Pageable>any()))
                .thenReturn(new PageImpl<>(List.of(), PageRequest.of(0, 10), 0));

        service.list(orgUser, null, null, "ENROLLED", null, PageRequest.of(0, 10));

        verify(childRepository).findAll(Mockito.<Specification<Child>>any(), Mockito.<Pageable>any());
    }

    // ── update ──────────────────────────────────────────────────────────

    @Test
    void update_success() {
        Child child = buildChild(CHILD_ID, ORG_ID, CENTRE_ID);
        when(childRepository.findByIdAndDeletedAtIsNull(CHILD_ID)).thenReturn(Optional.of(child));
        when(childRepository.save(any(Child.class))).thenAnswer(inv -> inv.getArgument(0));

        UpdateChildRequest req = new UpdateChildRequest(null, "Bob", null, null,
                null, "ENROLLED", null, null, null, null, null);

        ChildResponse response = service.update(orgUser, CHILD_ID, req);

        assertThat(response.firstName()).isEqualTo("Bob");
        verify(childRepository).save(child);
        verify(auditService).log(eq(USER_ID), eq(ORG_ID), eq(CENTRE_ID),
                eq("UPDATE"), eq("CHILD"), anyLong(), anyString(), Mockito.isNull(), Mockito.isNull());
    }

    @Test
    void update_notFound() {
        when(childRepository.findByIdAndDeletedAtIsNull(CHILD_ID)).thenReturn(Optional.empty());

        UpdateChildRequest req = new UpdateChildRequest(null, "Bob", null, null,
                null, null, null, null, null, null, null);

        assertThatThrownBy(() -> service.update(orgUser, CHILD_ID, req))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("Child");
    }

    // ── delete ──────────────────────────────────────────────────────────

    @Test
    void delete_success() {
        Child child = buildChild(CHILD_ID, ORG_ID, CENTRE_ID);
        when(childRepository.findByIdAndDeletedAtIsNull(CHILD_ID)).thenReturn(Optional.of(child));
        when(childRepository.save(any(Child.class))).thenAnswer(inv -> inv.getArgument(0));

        service.delete(orgUser, CHILD_ID);

        assertThat(child.getDeletedAt()).isNotNull();
        verify(childRepository).save(child);
        verify(auditService).log(eq(USER_ID), eq(ORG_ID), eq(CENTRE_ID),
                eq("DELETE"), eq("CHILD"), anyLong(), anyString(), Mockito.isNull(), Mockito.isNull());
    }

    // ── assignFamily ────────────────────────────────────────────────────

    @Test
    void assignFamily_success() {
        Child child = buildChild(CHILD_ID, ORG_ID, CENTRE_ID);
        Family family = buildFamily(FAMILY_ID, ORG_ID);

        when(childRepository.findByIdAndDeletedAtIsNull(CHILD_ID)).thenReturn(Optional.of(child));
        when(familyRepository.findByIdAndDeletedAtIsNull(FAMILY_ID)).thenReturn(Optional.of(family));
        when(relationshipRepository.existsByChildIdAndFamilyId(CHILD_ID, FAMILY_ID)).thenReturn(false);
        when(relationshipRepository.save(any(ChildFamilyRelationship.class))).thenAnswer(inv -> {
            ChildFamilyRelationship rel = inv.getArgument(0);
            rel.setId(500L);
            return rel;
        });
        when(relationshipRepository.findByChildIdOrderByPrimaryGuardianDesc(CHILD_ID)).thenReturn(List.of());
        when(familyRepository.findAllById(any())).thenReturn(List.of());

        ChildResponse response = service.assignFamily(orgUser, CHILD_ID, FAMILY_ID, "parent", true);

        assertThat(response).isNotNull();
        ArgumentCaptor<ChildFamilyRelationship> captor = ArgumentCaptor.forClass(ChildFamilyRelationship.class);
        verify(relationshipRepository).save(captor.capture());
        ChildFamilyRelationship saved = captor.getValue();
        assertThat(saved.getChildId()).isEqualTo(CHILD_ID);
        assertThat(saved.getFamilyId()).isEqualTo(FAMILY_ID);
        assertThat(saved.isPrimaryGuardian()).isTrue();
        verify(auditService).log(eq(USER_ID), eq(ORG_ID), eq(CENTRE_ID),
                eq("CREATE"), eq("CHILD_FAMILY_RELATIONSHIP"), eq(500L), anyString(), Mockito.isNull(), Mockito.isNull());
    }

    @Test
    void assignFamily_familyNotFound() {
        Child child = buildChild(CHILD_ID, ORG_ID, CENTRE_ID);
        when(childRepository.findByIdAndDeletedAtIsNull(CHILD_ID)).thenReturn(Optional.of(child));
        when(familyRepository.findByIdAndDeletedAtIsNull(FAMILY_ID)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.assignFamily(orgUser, CHILD_ID, FAMILY_ID, "parent", false))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("Family");
    }

    @Test
    void assignFamily_duplicateRelationship() {
        Child child = buildChild(CHILD_ID, ORG_ID, CENTRE_ID);
        Family family = buildFamily(FAMILY_ID, ORG_ID);
        when(childRepository.findByIdAndDeletedAtIsNull(CHILD_ID)).thenReturn(Optional.of(child));
        when(familyRepository.findByIdAndDeletedAtIsNull(FAMILY_ID)).thenReturn(Optional.of(family));
        when(relationshipRepository.existsByChildIdAndFamilyId(CHILD_ID, FAMILY_ID)).thenReturn(true);

        assertThatThrownBy(() -> service.assignFamily(orgUser, CHILD_ID, FAMILY_ID, "parent", false))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("already linked");
    }

    @Test
    void assignFamily_crossOrgFamilyRejected() {
        Child child = buildChild(CHILD_ID, ORG_ID, CENTRE_ID);
        Family family = buildFamily(FAMILY_ID, 99L);
        when(childRepository.findByIdAndDeletedAtIsNull(CHILD_ID)).thenReturn(Optional.of(child));
        when(familyRepository.findByIdAndDeletedAtIsNull(FAMILY_ID)).thenReturn(Optional.of(family));

        assertThatThrownBy(() -> service.assignFamily(orgUser, CHILD_ID, FAMILY_ID, "parent", false))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("same organisation");
    }

    // ── helpers ─────────────────────────────────────────────────────────

    private Child buildChild(Long id, Long orgId, Long centreId) {
        Child c = new Child();
        c.setId(id);
        c.setOrganisationId(orgId);
        c.setCentreId(centreId);
        c.setFirstName("Alice");
        c.setLastName("Smith");
        c.setDateOfBirth(LocalDate.of(2020, 3, 15));
        c.setGender("female");
        c.setEnrolmentStatus("ENROLLED");
        c.setActive(true);
        return c;
    }

    private Family buildFamily(Long id, Long orgId) {
        Family f = new Family();
        f.setId(id);
        f.setOrganisationId(orgId);
        f.setCentreId(CENTRE_ID);
        f.setFamilyNumber("FAM-001");
        f.setActive(true);
        return f;
    }

    private Centre buildCentre(Long id, Long orgId) {
        Organisation org = new Organisation();
        org.setId(orgId);
        Centre c = new Centre();
        c.setId(id);
        c.setOrganisation(org);
        c.setName("Sunshine Centre");
        c.setCapacity(30);
        return c;
    }

    private static <T> T eq(T value) {
        return Mockito.eq(value);
    }
}
