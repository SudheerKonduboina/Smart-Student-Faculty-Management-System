package com.sms.backend.service;

import com.sms.backend.dto.response.StudentDto;
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
public class StudentService {

    private final StudentRepository studentRepository;
    private final UserRepository userRepository;
    private final DepartmentRepository departmentRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional(readOnly = true)
    public Page<StudentDto> getAllStudents(String search, Long departmentId, Integer semester, Pageable pageable) {
        return studentRepository.findAllWithFilters(search, departmentId, semester, pageable)
            .map(this::mapToDto);
    }

    @Transactional(readOnly = true)
    public StudentDto getStudentById(Long id) {
        return studentRepository.findById(id)
            .map(this::mapToDto)
            .orElseThrow(() -> new ResourceNotFoundException("Student", id));
    }

    @Transactional(readOnly = true)
    public StudentDto getStudentByUserId(Long userId) {
        return studentRepository.findByUserId(userId)
            .map(this::mapToDto)
            .orElseThrow(() -> new ResourceNotFoundException("Student profile not found for user: " + userId));
    }

    @Transactional(readOnly = true)
    public StudentDto getStudentByEmail(String email) {
        return studentRepository.findAll().stream()
            .filter(s -> s.getUser().getEmail().equals(email))
            .findFirst()
            .map(this::mapToDto)
            .orElseThrow(() -> new ResourceNotFoundException("Student not found with email: " + email));
    }


    @Transactional
    public StudentDto createStudent(String email, String password, String firstName, String lastName,
                                    String phone, Long departmentId, Integer semester, LocalDate enrollmentDate) {
        if (userRepository.existsByEmail(email)) {
            throw new ConflictException("Email already in use: " + email);
        }
        Department dept = departmentRepository.findById(departmentId)
            .orElseThrow(() -> new ResourceNotFoundException("Department", departmentId));

        User user = User.builder()
            .email(email).passwordHash(passwordEncoder.encode(password))
            .firstName(firstName).lastName(lastName).phone(phone)
            .role(User.Role.STUDENT).active(true).build();
        user = userRepository.save(user);

        // Generate student code
        String code = "STU" + String.format("%04d", studentRepository.count() + 1);
        Student student = Student.builder()
            .user(user).studentCode(code).department(dept)
            .semester(semester != null ? semester : 1)
            .enrollmentDate(enrollmentDate != null ? enrollmentDate : LocalDate.now())
            .active(true).build();
        return mapToDto(studentRepository.save(student));
    }

    @Transactional
    public StudentDto updateStudent(Long id, String firstName, String lastName, String phone,
                                     Long departmentId, Integer semester) {
        Student student = studentRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Student", id));

        student.getUser().setFirstName(firstName);
        student.getUser().setLastName(lastName);
        student.getUser().setPhone(phone);
        if (departmentId != null) {
            Department dept = departmentRepository.findById(departmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Department", departmentId));
            student.setDepartment(dept);
        }
        if (semester != null) student.setSemester(semester);
        userRepository.save(student.getUser());
        return mapToDto(studentRepository.save(student));
    }

    @Transactional
    public StudentDto toggleActive(Long id) {
        Student student = studentRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Student", id));
        student.setActive(!student.getActive());
        student.getUser().setActive(student.getActive());
        userRepository.save(student.getUser());
        return mapToDto(studentRepository.save(student));
    }

    public StudentDto mapToDto(Student s) {
        return StudentDto.builder()
            .id(s.getId())
            .studentCode(s.getStudentCode())
            .semester(s.getSemester())
            .enrollmentDate(s.getEnrollmentDate())
            .active(s.getActive())
            .createdAt(s.getCreatedAt())
            .userId(s.getUser().getId())
            .email(s.getUser().getEmail())
            .firstName(s.getUser().getFirstName())
            .lastName(s.getUser().getLastName())
            .phone(s.getUser().getPhone())
            .departmentId(s.getDepartment().getId())
            .departmentName(s.getDepartment().getName())
            .departmentCode(s.getDepartment().getCode())
            .build();
    }
}
