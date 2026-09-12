package com.penguinpeak.childcare.authentication.repository;
import com.penguinpeak.childcare.authentication.entity.UserSession; import java.time.Instant; import java.util.*; import org.springframework.data.jpa.repository.JpaRepository;
public interface UserSessionRepository extends JpaRepository<UserSession, Long> {
    Optional<UserSession> findByTokenHashAndRevokedAtIsNull(String tokenHash);
    List<UserSession> findByUserIdAndRevokedAtIsNull(Long userId);
}
