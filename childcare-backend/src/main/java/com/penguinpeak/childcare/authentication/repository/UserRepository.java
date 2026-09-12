package com.penguinpeak.childcare.authentication.repository;
import com.penguinpeak.childcare.authentication.entity.User;
import java.util.Optional; import org.springframework.data.domain.*; import org.springframework.data.jpa.repository.*;
public interface UserRepository extends JpaRepository<User, Long> {
    @EntityGraph(attributePaths = {"roles", "roles.permissions"}) Optional<User> findByEmailAndDeletedAtIsNull(String email);
    @EntityGraph(attributePaths = "roles") Optional<User> findByIdAndDeletedAtIsNull(Long id);
    boolean existsByEmail(String email);
    @EntityGraph(attributePaths = "roles") Page<User> findDistinctByIdInAndDeletedAtIsNull(java.util.Collection<Long> ids, Pageable pageable);
    @Override
    @EntityGraph(attributePaths = "roles") Page<User> findAll(Pageable pageable);
}
