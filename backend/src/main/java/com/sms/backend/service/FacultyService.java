package com.sms.backend.service;

import com.sms.backend.dto.response.FacultyDto;
import com.sms.backend.entity.*;
import com.sms.backend.exception.ConflictException;
import com.sms.backend.exception.ResourceNotFoundException;
import com.sms.backend.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;

@Service
@RequiredArgsConstructor
public class FacultyService {

    private final FacultyRepository facultyRepository;
    private final UserRepository userRepository;
    private final DepartmentRepository departmentRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional(readOnly = true)
    public Page<FacultyDto> getAllFaculty(String search, Long departmentId, Pageable pageable) {
        return facultyRepository.findAllWithFilters(search, departmentId, pageable)
            .map(this::mapToDto);
    }

    @Transactional(readOnly = true)
    public FacultyDto getFacultyById(Long id) {
        return facultyRepository.findById(id)
            .map(this::mapToDto)
            .orElseThrow(() -> new ResourceNotFoundException("Faculty", id));
    }

    @Transactional(readOnly = true)
    public FacultyDto getFacultyByUserId(Long userId) {
        return facultyRepository.findByUserId(userId)
            .map(this::mapToDto)
            .orElseThrow(() -> new ResourceNotFoundException("Faculty profile not found for user: " + userId));
    }

    @Transactional(readOnly = true)
    public FacultyDto getFacultyByEmail(String email) {
        return facultyRepository.findAll().stream()
            .filter(f -> f.getUser().getEmail().equals(email))
            .findFirst()
            .map(this::mapToDto)
            .orElseThrow(() -> new ResourceNotFoundException("Faculty not found with email: " + email));
    }


    @Transactional
    public FacultyDto createFaculty(String email, String password, String firstName, String lastName,
                                     String phone, Long departmentId, LocalDate joinedDate) {
        if (userRepository.existsByEmail(email)) {
            throw new ConflictException("Email already in use: " + email);
        }
        Department dept = departmentRepository.findById(departmentId)
            .orElseThrow(() -> new ResourceNotFoundException("Department", departmentId));

        User user = User.builder()
            .email(email).passwordHash(passwordEncoder.encode(password))
            .firstName(firstName).lastName(lastName).phone(phone)
            .role(User.Role.FACULTY).active(true).build();
        user = userRepository.save(user);

        String code = "FAC" + String.format("%04d", facultyRepository.count() + 1);
        Faculty faculty = Faculty.builder()
            .user(user).facultyCode(code).department(dept)
            .joinedDate(joinedDate != null ? joinedDate : LocalDate.now())
            .active(true).build();
        return mapToDto(facultyRepository.save(faculty));
    }

    @Transactional
    public FacultyDto updateFaculty(Long id, String firstName, String lastName, String phone, Long departmentId) {
        Faculty faculty = facultyRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Faculty", id));
        faculty.getUser().setFirstName(firstName);
        faculty.getUser().setLastName(lastName);
        faculty.getUser().setPhone(phone);
        if (departmentId != null) {
            Department dept = departmentRepository.findById(departmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Department", departmentId));
            faculty.setDepartment(dept);
        }
        userRepository.save(faculty.getUser());
        return mapToDto(facultyRepository.save(faculty));
    }

    @Transactional
    public FacultyDto toggleActive(Long id) {
        Faculty faculty = facultyRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Faculty", id));
        faculty.setActive(!faculty.getActive());
        faculty.getUser().setActive(faculty.getActive());
        userRepository.save(faculty.getUser());
        return mapToDto(facultyRepository.save(faculty));
    }

    public FacultyDto mapToDto(Faculty f) {
        return FacultyDto.builder()
            .id(f.getId())
            .facultyCode(f.getFacultyCode())
            .joinedDate(f.getJoinedDate())
            .active(f.getActive())
            .createdAt(f.getCreatedAt())
            .userId(f.getUser().getId())
            .email(f.getUser().getEmail())
            .firstName(f.getUser().getFirstName())
            .lastName(f.getUser().getLastName())
            .phone(f.getUser().getPhone())
            .departmentId(f.getDepartment().getId())
            .departmentName(f.getDepartment().getName())
            .departmentCode(f.getDepartment().getCode())
            .build();
    }
}
