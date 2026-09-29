package com.sms.backend.dto.request;

import com.sms.backend.entity.Timetable;
import jakarta.validation.constraints.*;
import lombok.*;
import java.time.LocalTime;

@Data @NoArgsConstructor @AllArgsConstructor
public class TimetableRequest {
    @NotNull private Long subjectId;
    @NotNull private Long facultyId;
    @NotBlank private String className;
    @NotBlank private String room;
    @NotNull private Timetable.DayOfWeek dayOfWeek;
    @NotNull private LocalTime startTime;
    @NotNull private LocalTime endTime;
}
