package com.sms.backend.dto.request;

import com.sms.backend.entity.Attendance;
import lombok.*;
import java.util.List;

@Data @NoArgsConstructor @AllArgsConstructor
public class MarkAttendanceRequest {
    private Long sessionId;
    private List<StudentAttendance> attendances;

    @Data @NoArgsConstructor @AllArgsConstructor
    public static class StudentAttendance {
        private Long studentId;
        private Attendance.AttendanceStatus status;
    }
}
