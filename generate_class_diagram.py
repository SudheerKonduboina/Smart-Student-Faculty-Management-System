import matplotlib.pyplot as plt
import matplotlib.patches as patches
import numpy as np
import os
import shutil

def draw_uml_class(ax, x, y, w, h, class_name, attributes, methods, header_h=34):
    """
    Draws a standard 3-compartment UML Class Box:
    - Compartment 1: Class Name (bold, centered)
    - Compartment 2: Attributes (+attr : type)
    - Compartment 3: Methods (+method() : type)
    """
    # Outer box
    box = patches.Rectangle((x, y), w, h, linewidth=1.6, edgecolor='black', facecolor='white', zorder=2)
    ax.add_patch(box)
    
    # Header compartment
    h_y = y + h - header_h
    ax.plot([x, x + w], [h_y, h_y], color='black', linewidth=1.3, zorder=3)
    ax.text(x + w / 2, y + h - header_h / 2, class_name, fontsize=11, fontweight='bold', fontfamily='sans-serif', ha='center', va='center', color='black', zorder=4)
    
    # Calculate split based on number of attributes
    line_h = 17
    attr_box_h = len(attributes) * line_h + 10
    split_y = h_y - attr_box_h
    
    # Draw line between attributes and methods
    ax.plot([x, x + w], [split_y, split_y], color='black', linewidth=1.3, zorder=3)
    
    # Render Attributes
    for i, attr in enumerate(attributes):
        cur_y = h_y - 12 - i * line_h
        ax.text(x + 12, cur_y, attr, fontsize=9.2, fontfamily='monospace', ha='left', va='center', color='black', zorder=4)
        
    # Render Methods
    for i, meth in enumerate(methods):
        cur_y = split_y - 12 - i * line_h
        ax.text(x + 12, cur_y, meth, fontsize=9.2, fontfamily='monospace', ha='left', va='center', color='black', zorder=4)

def draw_generalization(ax, start_pt, end_pt, label="Extends", label_offset=(0, 0)):
    """
    Draws a UML generalization line with a hollow closed triangle pointing to end_pt.
    """
    x1, y1 = start_pt
    x2, y2 = end_pt
    
    dx = x2 - x1
    dy = y2 - y1
    L = np.hypot(dx, dy)
    if L == 0:
        return
    
    ux = dx / L
    uy = dy / L
    
    # Triangle dimensions
    head_len = 16
    head_w = 12
    
    # Base of triangle
    bx = x2 - head_len * ux
    by = y2 - head_len * uy
    
    # Orthogonal unit vector
    px = -uy
    py = ux
    
    # Two corners of triangle base
    c1_x = bx + (head_w / 2) * px
    c1_y = by + (head_w / 2) * py
    c2_x = bx - (head_w / 2) * px
    c2_y = by - (head_w / 2) * py
    
    # Line from start to base
    ax.plot([x1, bx], [y1, by], color='black', linewidth=1.3, zorder=3)
    
    # Hollow triangle patch
    triangle = patches.Polygon([[x2, y2], [c1_x, c1_y], [c2_x, c2_y]], closed=True,
                               linewidth=1.3, edgecolor='black', facecolor='white', zorder=5)
    ax.add_patch(triangle)
    
    # Label near line midpoint
    if label:
        mx = (x1 + bx) / 2 + label_offset[0]
        my = (y1 + by) / 2 + label_offset[1]
        
        # Add small white background to prevent text overlap with line
        ax.text(mx, my, label, fontsize=10, fontfamily='sans-serif', ha='center', va='center', color='black',
                bbox=dict(boxstyle='square,pad=0.25', facecolor='white', edgecolor='none'), zorder=6)

def draw_association(ax, start_pt, end_pt, mult_start="1", mult_end="1", label=None, mult_start_offset=(0, 0), mult_end_offset=(0, 0)):
    """
    Draws a simple UML association line with multiplicity notations.
    """
    x1, y1 = start_pt
    x2, y2 = end_pt
    ax.plot([x1, x2], [y1, y2], color='black', linewidth=1.3, zorder=3)
    
    dx = x2 - x1
    dy = y2 - y1
    L = np.hypot(dx, dy)
    if L > 0:
        ux = dx / L
        uy = dy / L
        px = -uy
        py = ux
        
        if mult_start:
            ms_x = x1 + 25 * ux + 14 * px + mult_start_offset[0]
            ms_y = y1 + 25 * uy + 14 * py + mult_start_offset[1]
            ax.text(ms_x, ms_y, mult_start, fontsize=10.5, fontfamily='sans-serif', ha='center', va='center', color='black',
                    bbox=dict(boxstyle='square,pad=0.2', facecolor='white', edgecolor='none'), zorder=6)
            
        if mult_end:
            me_x = x2 - 28 * ux + 14 * px + mult_end_offset[0]
            me_y = y2 - 28 * uy + 14 * py + mult_end_offset[1]
            ax.text(me_x, me_y, mult_end, fontsize=10.5, fontfamily='sans-serif', ha='center', va='center', color='black',
                    bbox=dict(boxstyle='square,pad=0.2', facecolor='white', edgecolor='none'), zorder=6)
            
        if label:
            lx = (x1 + x2) / 2 + 14 * px
            ly = (y1 + y2) / 2 + 14 * py
            ax.text(lx, ly, label, fontsize=9.5, fontfamily='sans-serif', ha='center', va='center', color='black', zorder=6)

def render_class_diagram():
    # Canvas size: 14 x 16 inches at 300 DPI (4200 x 4800 px)
    fig_w, fig_h = 14, 16
    fig = plt.figure(figsize=(fig_w, fig_h), dpi=300)
    ax = fig.add_axes([0, 0, 1, 1])
    
    xlim = 1400
    ylim = 1600
    ax.set_xlim(0, xlim)
    ax.set_ylim(0, ylim)
    ax.set_aspect('equal')
    ax.axis('off')
    
    fig.patch.set_facecolor('white')
    ax.set_facecolor('white')
    
    # ─────────────────────────────────────────────────────────────────
    # 1. TOP HEADER & OUTER FRAME
    # ─────────────────────────────────────────────────────────────────
    ax.text(xlim / 2, 1550, "3.  Class Diagram", fontsize=22, fontweight='bold', fontfamily='serif', ha='center', va='center', color='black')
    
    frame_x, frame_y = 50, 65
    frame_w, frame_h = 1300, 1440
    outer_box = patches.Rectangle(
        (frame_x, frame_y), frame_w, frame_h,
        linewidth=2.4, edgecolor='black', facecolor='white', zorder=1
    )
    ax.add_patch(outer_box)
    
    # Caption below diagram
    ax.text(xlim / 2, 32, "Figure 7.0.1. Class Diagram", fontsize=15, fontfamily='serif', ha='center', va='center', color='black')
    
    # ─────────────────────────────────────────────────────────────────
    # 2. DEFINE CLASSES & COORDINATES (Smart-SMS Project Classes)
    # ─────────────────────────────────────────────────────────────────
    
    # 1. Authentication & User (Top Center)
    c_user_x, c_user_y, c_user_w, c_user_h = 560, 1260, 280, 215
    draw_uml_class(
        ax, c_user_x, c_user_y, c_user_w, c_user_h,
        "Authentication & User",
        [
            "+userId: Long",
            "+email: String",
            "+passwordHash: String",
            "+role: Role",
            "+active: boolean"
        ],
        [
            "+login()",
            "+changePassword()",
            "+generateToken()",
            "+validateCredentials()"
        ]
    )
    
    # 2. Manage Classroom & Courses (Top Left)
    c_class_x, c_class_y, c_class_w, c_class_h = 80, 1070, 320, 265
    draw_uml_class(
        ax, c_class_x, c_class_y, c_class_w, c_class_h,
        "Manage Classroom",
        [
            "+subjectCode: String",
            "+subjectName: String",
            "+departmentId: Long",
            "+credits: int",
            "+facultyId: Long",
            "+className: String"
        ],
        [
            "+manageClass()",
            "+assignFaculty()",
            "+postAssignment()",
            "+viewSubmissions()",
            "+publishGrades()"
        ]
    )
    
    # 3. Student Entity (Center)
    c_stud_x, c_stud_y, c_stud_w, c_stud_h = 550, 770, 290, 345
    draw_uml_class(
        ax, c_stud_x, c_stud_y, c_stud_w, c_stud_h,
        "Student",
        [
            "+studentId: Long",
            "+studentCode: String",
            "+studentName: String",
            "+email: String",
            "+departmentId: Long",
            "+semester: int",
            "+enrollmentDate: LocalDate"
        ],
        [
            "+login()",
            "+scanQRAttendance()",
            "+viewAttendance()",
            "+viewTimeTable()",
            "+submitAssignment()",
            "+viewGrades()",
            "+applyLeave()",
            "+viewNotifications()"
        ]
    )
    
    # 4. Faculty Entity (Bottom Left)
    c_fac_x, c_fac_y, c_fac_w, c_fac_h = 80, 300, 320, 325
    draw_uml_class(
        ax, c_fac_x, c_fac_y, c_fac_w, c_fac_h,
        "Faculty",
        [
            "+facultyId: Long",
            "+facultyCode: String",
            "+facultyName: String",
            "+email: String",
            "+departmentId: Long",
            "+joinedDate: LocalDate",
            "+active: boolean"
        ],
        [
            "+login()",
            "+markAttendance()",
            "+startQRSession()",
            "+createAssignment()",
            "+evaluateSubmissions()",
            "+publishGrades()",
            "+reviewLeave()"
        ]
    )
    
    # 5. Manage Attendance (Top Right)
    c_att_x, c_att_y, c_att_w, c_att_h = 960, 1090, 300, 230
    draw_uml_class(
        ax, c_att_x, c_att_y, c_att_w, c_att_h,
        "Manage Attendance",
        [
            "+sessionId: Long",
            "+studentCode: String",
            "+sessionDate: LocalDate",
            "+sessionType: SessionType",
            "+status: AttendanceStatus"
        ],
        [
            "+addAttendance()",
            "+markBatchManual()",
            "+viewAttendanceSummary()",
            "+getDefaultersList()"
        ]
    )
    
    # 6. Dynamic QR Generator Microservice (Middle Right)
    c_qr_x, c_qr_y, c_qr_w, c_qr_h = 980, 740, 290, 190
    draw_uml_class(
        ax, c_qr_x, c_qr_y, c_qr_w, c_qr_h,
        "Dynamic QR Generator",
        [
            "+qrToken: String",
            "+sessionId: Long",
            "+expirySeconds: int",
            "+cryptoSignature: String"
        ],
        [
            "+generateQRToken()",
            "+renderBase64PNG()",
            "+validateTokenSignature()"
        ]
    )
    
    # 7. Manage Timetable (Bottom Center) - Positioned with clear vertical clearance
    c_tt_x, c_tt_y, c_tt_w, c_tt_h = 530, 85, 300, 255
    draw_uml_class(
        ax, c_tt_x, c_tt_y, c_tt_w, c_tt_h,
        "Manage Time Table",
        [
            "+timetableId: Long",
            "+subjectCode: String",
            "+className: String",
            "+roomNumber: String",
            "+dayOfWeek: DayOfWeek",
            "+startTime: LocalTime",
            "+endTime: LocalTime"
        ],
        [
            "+addScheduleSlot()",
            "+updateSchedule()",
            "+deleteSlot()",
            "+getMySchedule()"
        ]
    )
    
    # 8. Leave & Submission System (Bottom Right)
    c_leave_x, c_leave_y, c_leave_w, c_leave_h = 940, 290, 320, 245
    draw_uml_class(
        ax, c_leave_x, c_leave_y, c_leave_w, c_leave_h,
        "Leave & Submission System",
        [
            "+applicationId: Long",
            "+studentId: Long",
            "+startDate: LocalDate",
            "+endDate: LocalDate",
            "+status: LeaveStatus",
            "+submissionFile: String"
        ],
        [
            "+applyLeave()",
            "+reviewLeave()",
            "+submitAssignment()",
            "+downloadFile()"
        ]
    )
    
    # ─────────────────────────────────────────────────────────────────
    # 3. RELATIONSHIPS & CONNECTIONS (Matching Reference Topology)
    # ─────────────────────────────────────────────────────────────────
    
    # (A) Student -> Authentication (Extends)
    draw_generalization(ax, (c_stud_x + c_stud_w / 2, c_stud_y + c_stud_h), (c_user_x + c_user_w / 2, c_user_y), label="Extends", label_offset=(0, 0))
    
    # (B) Manage Classroom -> Authentication (Extends)
    draw_generalization(ax, (c_class_x + c_class_w, c_class_y + c_class_h - 30), (c_user_x, c_user_y + 40), label="Extends", label_offset=(-20, 15))
    
    # (C) Faculty -> Manage Classroom (Extends)
    draw_generalization(ax, (c_fac_x + c_fac_w / 2, c_fac_y + c_fac_h), (c_class_x + c_class_w / 2, c_class_y), label="Extends", label_offset=(-25, 0))
    
    # (D) Student -> Manage Classroom (Extends)
    draw_generalization(ax, (c_stud_x, c_stud_y + c_stud_h * 0.75), (c_class_x + c_class_w, c_class_y + c_class_h * 0.35), label="Extends", label_offset=(-15, -15))
    
    # (E) Student -> Manage Attendance (Extends)
    draw_generalization(ax, (c_stud_x + c_stud_w, c_stud_y + c_stud_h * 0.8), (c_att_x, c_att_y + 40), label="Extends", label_offset=(15, -15))
    
    # (F) Faculty -> Dynamic QR Generator (Extends)
    draw_generalization(ax, (c_fac_x + c_fac_w, c_fac_y + c_fac_h * 0.7), (c_qr_x, c_qr_y + 40), label="Extends", label_offset=(0, 15))
    
    # (G) Faculty -> Manage Time Table (Extends)
    draw_generalization(ax, (c_fac_x + c_fac_w * 0.8, c_fac_y), (c_tt_x, c_tt_y + c_tt_h * 0.6), label="Extends", label_offset=(-15, -15))
    
    # (H) Student -> Leave & Submission System (Association 1 to 1)
    draw_association(ax, (c_stud_x + c_stud_w * 0.8, c_stud_y), (c_leave_x, c_leave_y + c_leave_h * 0.85),
                     mult_start="1", mult_end="1",
                     mult_start_offset=(5, -5), mult_end_offset=(-15, 5))
    
    # (I) Faculty -> Leave & Submission System (Association 1 to 1) - Clear horizontal corridor at y = 385
    draw_association(ax, (c_fac_x + c_fac_w, 385), (c_leave_x, 385),
                     mult_start="1", mult_end="1",
                     mult_start_offset=(0, 0), mult_end_offset=(-5, 0))

    # Save diagram
    output_filename = "class_diagram.png"
    base_dir = os.path.dirname(os.path.abspath(__file__))
    root_path = os.path.join(base_dir, output_filename)
    docs_path = os.path.join(base_dir, "docs", output_filename)
    
    os.makedirs(os.path.join(base_dir, "docs"), exist_ok=True)
    plt.savefig(root_path, dpi=300, facecolor='white', bbox_inches=None)
    plt.close()
    
    shutil.copy(root_path, docs_path)
    
    # Also save to conversation artifacts directory
    artifact_dir = r"C:\Users\kondu\.gemini\antigravity-ide\brain\afb2dde3-47a7-4b66-945e-1eda209ded7b"
    if os.path.exists(artifact_dir):
        shutil.copy(root_path, os.path.join(artifact_dir, output_filename))
        
    print(f"Successfully rendered: {docs_path} and {root_path}")

if __name__ == "__main__":
    render_class_diagram()
