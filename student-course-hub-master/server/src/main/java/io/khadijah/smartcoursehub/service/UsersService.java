package io.khadijah.smartcoursehub.service;

import io.khadijah.smartcoursehub.dto.UsersDTO;
import io.khadijah.smartcoursehub.entity.Users;
import io.khadijah.smartcoursehub.repository.UsersRepository;
import io.khadijah.smartcoursehub.vo.UsersUpdateVO;
import io.khadijah.smartcoursehub.vo.UsersVO;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.NoSuchElementException;
import java.util.stream.Collectors;

@Service
public class UsersService {

    @Autowired
    private UsersRepository usersRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Transactional
    public Long save(UsersVO vO) {
        // Check if email already exists
        if (usersRepository.existsByEmail(vO.getEmail())) {
            throw new IllegalStateException("Email already registered");
        }

        // Validate role
        String role = vO.getRole().toUpperCase();
        if (!role.equals("ADMIN") && !role.equals("INSTRUCTOR") && !role.equals("STUDENT")) {
            throw new IllegalStateException("Invalid role. Must be ADMIN, INSTRUCTOR, or STUDENT");
        }

        Users user = Users.builder()
                .name(vO.getName())
                .email(vO.getEmail())
                .password(passwordEncoder.encode(vO.getPassword()))
                .role(role)
                .enabled(true)
                .build();

        user = usersRepository.save(user);
        return user.getId();
    }

    @Transactional
    public void delete(Long id) {
        Users user = requireOne(id);
        usersRepository.delete(user);
    }

    @Transactional
    public void update(Long id, UsersUpdateVO vO) {
        Users user = requireOne(id);

        if (vO.getName() != null && !vO.getName().isEmpty()) {
            user.setName(vO.getName());
        }

        if (vO.getEmail() != null && !vO.getEmail().isEmpty()) {
            // Check if new email is different and already exists
            if (!user.getEmail().equals(vO.getEmail()) && usersRepository.existsByEmail(vO.getEmail())) {
                throw new IllegalStateException("Email already registered");
            }
            user.setEmail(vO.getEmail());
        }

        if (vO.getPassword() != null && !vO.getPassword().isEmpty()) {
            user.setPassword(passwordEncoder.encode(vO.getPassword()));
        }

        if (vO.getRole() != null && !vO.getRole().isEmpty()) {
            String role = vO.getRole().toUpperCase();
            if (!role.equals("ADMIN") && !role.equals("INSTRUCTOR") && !role.equals("STUDENT")) {
                throw new IllegalStateException("Invalid role. Must be ADMIN, INSTRUCTOR, or STUDENT");
            }
            user.setRole(role);
        }

        usersRepository.save(user);
    }

    @Transactional
    public void deactivate(Long id) {
        Users user = requireOne(id);
        user.setEnabled(false);
        usersRepository.save(user);
    }

    @Transactional
    public void activate(Long id) {
        Users user = requireOne(id);
        user.setEnabled(true);
        usersRepository.save(user);
    }

    public UsersDTO getById(Long id) {
        Users original = requireOne(id);
        return toDTO(original);
    }

    public List<UsersDTO> getAll() {
        return usersRepository.findAll().stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public List<UsersDTO> getByRole(String role) {
        return usersRepository.findByRole(role.toUpperCase()).stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public List<UsersDTO> getInstructors() {
        return usersRepository.findByRoleAndEnabled("INSTRUCTOR", true).stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public List<UsersDTO> getStudents() {
        return usersRepository.findByRoleAndEnabled("STUDENT", true).stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    private UsersDTO toDTO(Users original) {
        UsersDTO dto = new UsersDTO();
        BeanUtils.copyProperties(original, dto);
        dto.setPassword(null); // Never expose password
        return dto;
    }

    private Users requireOne(Long id) {
        return usersRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("User not found: " + id));
    }
}
