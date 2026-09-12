package com.penguinpeak.childcare.authentication.repository;
import com.penguinpeak.childcare.authentication.entity.UserCentreMembership; import java.util.*; import org.springframework.data.jpa.repository.JpaRepository;
public interface UserCentreMembershipRepository extends JpaRepository<UserCentreMembership, Long> { List<UserCentreMembership> findByUserIdOrderByDefaultMembershipDesc(Long userId); List<UserCentreMembership> findByCentreId(Long centreId); }
