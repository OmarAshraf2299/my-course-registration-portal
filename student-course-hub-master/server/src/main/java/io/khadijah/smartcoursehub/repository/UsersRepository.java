package io.khadijah.smartcoursehub.repository;

import io.khadijah.smartcoursehub.entity.Users;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.List;
import java.util.Optional;

public interface UsersRepository extends JpaRepository<Users, Long>, JpaSpecificationExecutor<Users> {

    Optional<Users> findByEmail(String email);

    boolean existsByEmail(String email);

    List<Users> findByRole(String role);

    List<Users> findByEnabled(Boolean enabled);

    List<Users> findByRoleAndEnabled(String role, Boolean enabled);
}
