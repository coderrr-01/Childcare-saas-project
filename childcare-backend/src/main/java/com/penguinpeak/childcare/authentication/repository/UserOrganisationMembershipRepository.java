package com.penguinpeak.childcare.authentication.repository;
import com.penguinpeak.childcare.authentication.entity.UserOrganisationMembership; import java.util.*; import org.springframework.data.jpa.repository.JpaRepository;
public interface UserOrganisationMembershipRepository extends JpaRepository<UserOrganisationMembership, Long> { List<UserOrganisationMembership> findByUserIdOrderByDefaultMembershipDesc(Long userId); List<UserOrganisationMembership> findByOrganisationId(Long organisationId); }
