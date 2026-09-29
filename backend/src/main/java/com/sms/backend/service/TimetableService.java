package com.sms.backend.service;

import com.sms.backend.dto.request.TimetableRequest;
import com.sms.backend.entity.*;
import com.sms.backend.exception.*;
import com.sms.backend.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class TimetableService {

    private final TimetableRepository timetableRepository;
    private final SubjectRepository subjectRepository;
    private final FacultyRepository facultyRepository;

    @Transactional(readOnly = true)
    public List<Timetable> getAll() {
        return timetableRepository.findByActiveTrue();
    }

    @Transactional(readOnly = true)
    public List<Timetable> getByFaculty(Long facultyId) {
        return timetableRepository.findByFacultyIdAndActiveTrue(facultyId);
    }

    @Transactional(readOnly = true)
    public List<Timetable> getByClassName(String className) {
        return timetableRepository.findByClassNameAndActiveTrue(className);
    }

    @Transactional
    public Timetable create(TimetableRequest request) {
        validateNoConflicts(request, null);
        Subject subject = subjectRepository.findById(request.getSubjectId())
            .orElseThrow(() -> new ResourceNotFoundException("Subject", request.getSubjectId()));
        Faculty faculty = facultyRepository.findById(request.getFacultyId())
            .orElseThrow(() -> new ResourceNotFoundException("Faculty", request.getFacultyId()));

        if (request.getStartTime().isAfter(request.getEndTime()) ||
            request.getStartTime().equals(request.getEndTime())) {
            throw new BadRequestException("Start time must be before end time");
        }

        Timetable tt = Timetable.builder()
            .subject(subject).faculty(faculty)
            .className(request.getClassName()).room(request.getRoom())
            .dayOfWeek(request.getDayOfWeek())
            .startTime(request.getStartTime()).endTime(request.getEndTime())
            .active(true).build();
        return timetableRepository.save(tt);
    }

    @Transactional
    public Timetable update(Long id, TimetableRequest request) {
        validateNoConflicts(request, id);
        Timetable tt = timetableRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Timetable", id));
        Subject subject = subjectRepository.findById(request.getSubjectId())
            .orElseThrow(() -> new ResourceNotFoundException("Subject", request.getSubjectId()));
        Faculty faculty = facultyRepository.findById(request.getFacultyId())
            .orElseThrow(() -> new ResourceNotFoundException("Faculty", request.getFacultyId()));

        tt.setSubject(subject); tt.setFaculty(faculty);
        tt.setClassName(request.getClassName()); tt.setRoom(request.getRoom());
        tt.setDayOfWeek(request.getDayOfWeek());
        tt.setStartTime(request.getStartTime()); tt.setEndTime(request.getEndTime());
        return timetableRepository.save(tt);
    }

    @Transactional
    public void delete(Long id) {
        Timetable tt = timetableRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Timetable", id));
        timetableRepository.delete(tt);
    }

    private void validateNoConflicts(TimetableRequest req, Long excludeId) {
        long selfId = excludeId != null ? excludeId : -1L;

        if (timetableRepository.countFacultyConflicts(req.getFacultyId(), req.getDayOfWeek(),
            req.getStartTime(), req.getEndTime(), selfId) > 0) {
            throw new ConflictException("Faculty already has a class scheduled at this time on " + req.getDayOfWeek());
        }
        if (timetableRepository.countRoomConflicts(req.getRoom(), req.getDayOfWeek(),
            req.getStartTime(), req.getEndTime(), selfId) > 0) {
            throw new ConflictException("Room " + req.getRoom() + " is already occupied at this time on " + req.getDayOfWeek());
        }
        if (timetableRepository.countClassConflicts(req.getClassName(), req.getDayOfWeek(),
            req.getStartTime(), req.getEndTime(), selfId) > 0) {
            throw new ConflictException("Class " + req.getClassName() + " already has a subject scheduled at this time on " + req.getDayOfWeek());
        }
    }
}
