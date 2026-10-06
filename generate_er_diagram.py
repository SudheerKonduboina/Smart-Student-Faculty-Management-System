import matplotlib.pyplot as plt
import matplotlib.patches as patches
import numpy as np
import os
import shutil

def draw_entity(ax, x, y, w, h, text, is_weak=False):
    """
    Draws an Entity rectangle centered at (x, y).
    """
    rx = x - w / 2
    ry = y - h / 2
    rect = patches.Rectangle((rx, ry), w, h, linewidth=1.4, edgecolor='black', facecolor='white', zorder=5)
    ax.add_patch(rect)
    if is_weak:
        rect_inner = patches.Rectangle((rx + 3.5, ry + 3.5), w - 7, h - 7, linewidth=1.0, edgecolor='black', facecolor='none', zorder=6)
        ax.add_patch(rect_inner)
    ax.text(x, y, text, fontsize=9.0, fontweight='normal', fontfamily='sans-serif', ha='center', va='center', color='black', zorder=7)
    return (x, y, w, h)

def draw_relationship(ax, x, y, w, h, text, is_identifying=False):
    """
    Draws a Relationship diamond centered at (x, y).
    """
    diamond_pts = np.array([
        [x, y + h / 2],
        [x + w / 2, y],
        [x, y - h / 2],
        [x - w / 2, y]
    ])
    poly = patches.Polygon(diamond_pts, closed=True, linewidth=1.3, edgecolor='black', facecolor='white', zorder=5)
    ax.add_patch(poly)
    if is_identifying:
        diamond_pts_inner = np.array([
            [x, y + (h - 6) / 2],
            [x + (w - 8) / 2, y],
            [x, y - (h - 6) / 2],
            [x - (w - 8) / 2, y]
        ])
        poly_inner = patches.Polygon(diamond_pts_inner, closed=True, linewidth=1.0, edgecolor='black', facecolor='none', zorder=6)
        ax.add_patch(poly_inner)
    ax.text(x, y, text, fontsize=8.0, fontweight='normal', fontfamily='sans-serif', ha='center', va='center', color='black', zorder=7)
    return (x, y, w, h)

def draw_attribute(ax, x, y, w, h, text, is_pk=False, is_multivalued=False, is_derived=False, font_size=7.6):
    """
    Draws an Attribute ellipse centered at (x, y).
    """
    linestyle = '--' if is_derived else '-'
    ellipse = patches.Ellipse((x, y), w, h, linewidth=1.1, linestyle=linestyle, edgecolor='black', facecolor='white', zorder=5)
    ax.add_patch(ellipse)
    if is_multivalued:
        ellipse_inner = patches.Ellipse((x, y), w - 6, h - 4, linewidth=0.9, edgecolor='black', facecolor='none', zorder=6)
        ax.add_patch(ellipse_inner)
    
    # Clean, non-bold text
    ax.text(x, y, text, fontsize=font_size, fontweight='normal', fontfamily='sans-serif', ha='center', va='center', color='black', zorder=7)
    if is_pk:
        text_len = len(text) * 4.2
        ax.plot([x - text_len / 2, x + text_len / 2], [y - 4.5, y - 4.5], color='black', linewidth=1.0, zorder=7)
    return (x, y, w, h)

def connect(ax, pt1, pt2, zorder=3, style='-'):
    """
    Draws a straight line connecting two points.
    """
    ax.plot([pt1[0], pt2[0]], [pt1[1], pt2[1]], color='black', linewidth=1.0, linestyle=style, zorder=zorder)

def render_er_diagram():
    # Canvas: 16 x 14.5 inches at 300 DPI (4800 x 4350 px)
    fig_w, fig_h = 16, 14.5
    fig = plt.figure(figsize=(fig_w, fig_h), dpi=300)
    ax = fig.add_axes([0, 0, 1, 1])
    
    xlim = 1600
    ylim = 1450
    ax.set_xlim(0, xlim)
    ax.set_ylim(0, ylim)
    ax.set_aspect('equal')
    ax.axis('off')
    
    fig.patch.set_facecolor('white')
    ax.set_facecolor('white')
    
    # ─────────────────────────────────────────────────────────────────
    # 1. TOP HEADER & OUTER ACADEMIC FRAME
    # ─────────────────────────────────────────────────────────────────
    ax.text(xlim / 2, 1410, "4.  ER Diagram", fontsize=22, fontweight='bold', fontfamily='serif', ha='center', va='center', color='black')
    
    frame_x, frame_y = 40, 55
    frame_w, frame_h = 1520, 1315
    outer_box = patches.Rectangle(
        (frame_x, frame_y), frame_w, frame_h,
        linewidth=2.4, edgecolor='black', facecolor='white', zorder=1
    )
    ax.add_patch(outer_box)
    
    # Caption below diagram
    ax.text(xlim / 2, 28, "Figure 8.0.1. ER Diagram", fontsize=15, fontfamily='serif', ha='center', va='center', color='black')
    
    # ─────────────────────────────────────────────────────────────────
    # 2. TOP CENTRAL ROOT CIRCLE / DOMAIN
    # ─────────────────────────────────────────────────────────────────
    root_x, root_y = 800, 1310
    root_circle = patches.Ellipse((root_x, root_y), 250, 75, linewidth=1.5, edgecolor='black', facecolor='white', zorder=5)
    ax.add_patch(root_circle)
    ax.text(root_x, root_y, "Smart Student &\nFaculty Management System", fontsize=9.5, fontweight='bold', fontfamily='sans-serif', ha='center', va='center', color='black', zorder=7)
    
    # ─────────────────────────────────────────────────────────────────
    # 3. UPPER TIER ENTITIES (admin, teachers, students, timetable)
    # ─────────────────────────────────────────────────────────────────
    
    admin_pos = (230, 1070)
    teachers_pos = (580, 1070)
    students_pos = (980, 1070)
    timetable_pos = (1370, 1070)
    
    draw_entity(ax, admin_pos[0], admin_pos[1], 95, 42, "admin")
    draw_entity(ax, teachers_pos[0], teachers_pos[1], 100, 42, "teachers")
    draw_entity(ax, students_pos[0], students_pos[1], 100, 42, "students")
    draw_entity(ax, timetable_pos[0], timetable_pos[1], 105, 42, "timetable")
    
    # Horizontal bus from root down to upper entities
    connect(ax, (admin_pos[0], 1235), (timetable_pos[0], 1235))
    connect(ax, (root_x, root_y - 37.5), (root_x, 1235))
    
    # Belongs 1 (Root -> Admin)
    rel_b1 = (admin_pos[0], 1180)
    draw_relationship(ax, rel_b1[0], rel_b1[1], 70, 40, "Belongs")
    connect(ax, (admin_pos[0], 1235), (rel_b1[0], rel_b1[1] + 20))
    connect(ax, (rel_b1[0], rel_b1[1] - 20), (admin_pos[0], admin_pos[1] + 21))
    
    # Belongs 2 (Root -> Teachers)
    rel_b2 = (teachers_pos[0], 1180)
    draw_relationship(ax, rel_b2[0], rel_b2[1], 70, 40, "Belongs")
    connect(ax, (teachers_pos[0], 1235), (rel_b2[0], rel_b2[1] + 20))
    connect(ax, (rel_b2[0], rel_b2[1] - 20), (teachers_pos[0], teachers_pos[1] + 21))
    
    # Belongs 3 (Root -> Students)
    rel_b3 = (students_pos[0], 1180)
    draw_relationship(ax, rel_b3[0], rel_b3[1], 70, 40, "Belongs")
    connect(ax, (students_pos[0], 1235), (rel_b3[0], rel_b3[1] + 20))
    connect(ax, (rel_b3[0], rel_b3[1] - 20), (students_pos[0], students_pos[1] + 21))
    
    # Manage 1 (Root -> Timetable)
    rel_m1 = (timetable_pos[0], 1180)
    draw_relationship(ax, rel_m1[0], rel_m1[1], 70, 40, "Manage")
    connect(ax, (timetable_pos[0], 1235), (rel_m1[0], rel_m1[1] + 20))
    connect(ax, (rel_m1[0], rel_m1[1] - 20), (timetable_pos[0], timetable_pos[1] + 21))
    
    # Direct horizontal connections between upper entities
    connect(ax, (teachers_pos[0] + 50, teachers_pos[1]), (students_pos[0] - 50, students_pos[1]))
    connect(ax, (students_pos[0] + 50, students_pos[1]), (timetable_pos[0] - 52.5, timetable_pos[1]))

    # ─────────────────────────────────────────────────────────────────
    # 4. ATTRIBUTES FOR UPPER TIER ENTITIES
    # ─────────────────────────────────────────────────────────────────
    
    # (A) Admin Attributes
    adm_attrs = [
        ("id", 100, 970, 44, 22, True, False, False, 7.6),
        ("name", 95, 1020, 50, 22, False, False, False, 7.6),
        ("reset password", 100, 1070, 80, 26, False, True, False, 7.2),
        ("uname", 100, 1120, 52, 22, False, False, False, 7.6),
        ("password", 100, 1165, 62, 22, False, False, False, 7.6),
        ("email", 175, 1165, 52, 22, False, False, False, 7.6)
    ]
    for name, ax_x, ax_y, aw, ah, pk, mv, der, fs in adm_attrs:
        connect(ax, (admin_pos[0], admin_pos[1]), (ax_x, ax_y))
        draw_attribute(ax, ax_x, ax_y, aw, ah, name, pk, mv, der, font_size=fs)

    # (B) Teachers Attributes
    t_attrs = [
        ("teacherid", 440, 1140, 62, 22, True, False, False, 7.6),
        ("address", 510, 1140, 56, 22, False, False, False, 7.6),
        ("password", 410, 1090, 62, 22, False, False, False, 7.6),
        ("name", 410, 1045, 50, 22, False, False, False, 7.6),
        ("reset password", 405, 1000, 80, 26, False, True, False, 7.2),
        ("email", 440, 955, 52, 22, False, False, False, 7.6),
        ("qualification", 510, 955, 72, 22, False, False, False, 7.6),
        ("phone", 580, 955, 56, 24, False, True, False, 7.6),
        ("teacherid", 650, 1140, 62, 22, False, False, False, 7.6)
    ]
    for name, ax_x, ax_y, aw, ah, pk, mv, der, fs in t_attrs:
        connect(ax, (teachers_pos[0], teachers_pos[1]), (ax_x, ax_y))
        draw_attribute(ax, ax_x, ax_y, aw, ah, name, pk, mv, der, font_size=fs)

    # (C) Students Attributes
    s_attrs = [
        ("sem", 890, 1140, 46, 22, False, False, False, 7.6),
        ("student_id", 965, 1140, 64, 22, True, False, False, 7.6),
        ("password", 1045, 1140, 62, 22, False, False, False, 7.6),
        ("name", 1120, 1115, 50, 22, False, False, False, 7.6),
        ("div", 1140, 1070, 44, 22, False, False, False, 7.6),
        ("reset password", 1130, 1020, 80, 26, False, True, False, 7.2),
        ("email", 1100, 970, 52, 22, False, False, False, 7.6),
        ("enrollment", 1025, 955, 66, 22, False, False, False, 7.6),
        ("phone", 940, 955, 56, 24, False, True, False, 7.6)
    ]
    for name, ax_x, ax_y, aw, ah, pk, mv, der, fs in s_attrs:
        connect(ax, (students_pos[0], students_pos[1]), (ax_x, ax_y))
        draw_attribute(ax, ax_x, ax_y, aw, ah, name, pk, mv, der, font_size=fs)

    # (D) Timetable Attributes
    tt_attrs = [
        ("id", 1495, 1135, 44, 22, True, False, False, 7.6),
        ("time", 1505, 1090, 50, 22, False, False, False, 7.6),
        ("Subject code", 1515, 1045, 76, 22, False, False, False, 7.6),
        ("subject", 1505, 1000, 54, 22, False, False, False, 7.6),
        ("Teacher", 1370, 975, 58, 22, False, False, False, 7.6)
    ]
    for name, ax_x, ax_y, aw, ah, pk, mv, der, fs in tt_attrs:
        connect(ax, (timetable_pos[0], timetable_pos[1]), (ax_x, ax_y))
        draw_attribute(ax, ax_x, ax_y, aw, ah, name, pk, mv, der, font_size=fs)

    # ─────────────────────────────────────────────────────────────────
    # 5. MIDDLE TIER ENTITIES (attendance_left, notes, assignment, test, attendance_right)
    # ─────────────────────────────────────────────────────────────────
    
    att_left_pos = (260, 750)
    notes_pos = (500, 750)
    assignment_pos = (680, 730)
    test_pos = (1050, 730)
    att_right_pos = (1340, 780)
    
    draw_entity(ax, att_left_pos[0], att_left_pos[1], 85, 38, "attendance")
    draw_entity(ax, notes_pos[0], notes_pos[1], 80, 38, "notes")
    draw_entity(ax, assignment_pos[0], assignment_pos[1], 90, 38, "assignment")
    draw_entity(ax, test_pos[0], test_pos[1], 95, 40, "test / quiz")
    draw_entity(ax, att_right_pos[0], att_right_pos[1], 85, 38, "attendance")
    
    # Manage 2 (Admin -> Attendance Left)
    rel_m2 = (245, 900)
    draw_relationship(ax, rel_m2[0], rel_m2[1], 62, 36, "manage")
    connect(ax, (admin_pos[0], admin_pos[1] - 21), (rel_m2[0], rel_m2[1] + 18))
    connect(ax, (rel_m2[0], rel_m2[1] - 18), (att_left_pos[0], att_left_pos[1] + 19))
    
    # Teachers -> Attendance Left
    connect(ax, (teachers_pos[0] - 30, teachers_pos[1] - 21), (att_left_pos[0] + 30, att_left_pos[1] + 19))
    
    # Has 1 (Teachers -> Notes)
    rel_has1 = (500, 890)
    draw_relationship(ax, rel_has1[0], rel_has1[1], 58, 34, "has")
    connect(ax, (teachers_pos[0] - 20, teachers_pos[1] - 21), (rel_has1[0], rel_has1[1] + 17))
    connect(ax, (rel_has1[0], rel_has1[1] - 17), (notes_pos[0], notes_pos[1] + 19))
    
    # Access (Students -> Notes)
    rel_access = (710, 855)
    draw_relationship(ax, rel_access[0], rel_access[1], 58, 34, "access")
    connect(ax, (students_pos[0] - 40, students_pos[1] - 21), (rel_access[0] + 15, rel_access[1] + 17))
    connect(ax, (rel_access[0] - 15, rel_access[1] - 17), (notes_pos[0] + 40, notes_pos[1] + 10))
    
    # Has 2 (Teachers -> Assignment)
    rel_has2 = (600, 890)
    draw_relationship(ax, rel_has2[0], rel_has2[1], 58, 34, "has")
    connect(ax, (teachers_pos[0] + 15, teachers_pos[1] - 21), (rel_has2[0], rel_has2[1] + 17))
    connect(ax, (rel_has2[0], rel_has2[1] - 17), (assignment_pos[0] - 20, assignment_pos[1] + 19))
    
    # Uploads (Students -> Assignment)
    rel_uploads = (790, 890)
    draw_relationship(ax, rel_uploads[0], rel_uploads[1], 62, 36, "uploads")
    connect(ax, (students_pos[0] - 20, students_pos[1] - 21), (rel_uploads[0], rel_uploads[1] + 18))
    connect(ax, (rel_uploads[0], rel_uploads[1] - 18), (assignment_pos[0] + 20, assignment_pos[1] + 19))
    
    # Give (Students -> Test)
    rel_give = (980, 875)
    draw_relationship(ax, rel_give[0], rel_give[1], 58, 34, "give")
    connect(ax, (students_pos[0] + 15, students_pos[1] - 21), (rel_give[0], rel_give[1] + 17))
    connect(ax, (rel_give[0], rel_give[1] - 17), (test_pos[0] - 20, test_pos[1] + 20))
    
    # Students & Timetable -> Attendance Right
    connect(ax, (students_pos[0] + 40, students_pos[1] - 21), (att_right_pos[0] - 20, att_right_pos[1] + 19))
    connect(ax, (timetable_pos[0] - 10, timetable_pos[1] - 21), (att_right_pos[0] + 20, att_right_pos[1] + 19))

    # ─────────────────────────────────────────────────────────────────
    # 6. ATTRIBUTES FOR MIDDLE TIER ENTITIES
    # ─────────────────────────────────────────────────────────────────
    
    # (E) Left Attendance Attributes
    att_l_attrs = [
        ("id", 145, 785, 44, 22, True, False, False, 7.6),
        ("enrollment", 140, 745, 66, 22, False, False, False, 7.6),
        ("Recorded_at", 140, 705, 70, 22, False, False, False, 7.6),
        ("Recorded_Time_\nDate", 140, 655, 86, 30, False, False, True, 7.2),
        ("teacher", 165, 605, 54, 22, False, False, False, 7.6)
    ]
    for name, ax_x, ax_y, aw, ah, pk, mv, der, fs in att_l_attrs:
        connect(ax, (att_left_pos[0], att_left_pos[1]), (ax_x, ax_y))
        draw_attribute(ax, ax_x, ax_y, aw, ah, name, pk, mv, der, font_size=fs)

    # (F) Notes Attributes
    notes_attrs = [
        ("id", 390, 760, 44, 22, True, False, False, 7.6),
        ("sub_code", 390, 715, 60, 22, False, False, False, 7.6),
        ("sub_name", 390, 670, 62, 22, False, False, False, 7.6),
        ("Teacher_name", 415, 625, 78, 22, False, False, False, 7.6),
        ("notes_file", 495, 625, 62, 22, False, False, False, 7.6)
    ]
    for name, ax_x, ax_y, aw, ah, pk, mv, der, fs in notes_attrs:
        connect(ax, (notes_pos[0], notes_pos[1]), (ax_x, ax_y))
        draw_attribute(ax, ax_x, ax_y, aw, ah, name, pk, mv, der, font_size=fs)

    # (G) Assignment Attributes
    assign_attrs = [
        ("assignment_id", 800, 745, 76, 22, True, False, False, 7.6),
        ("sub_code", 805, 700, 60, 22, False, False, False, 7.6),
        ("sub_name", 805, 655, 62, 22, False, False, False, 7.6),
        ("Teacher_id", 775, 610, 68, 22, False, False, False, 7.6),
        ("question_file", 695, 615, 74, 22, False, False, False, 7.6)
    ]
    for name, ax_x, ax_y, aw, ah, pk, mv, der, fs in assign_attrs:
        connect(ax, (assignment_pos[0], assignment_pos[1]), (ax_x, ax_y))
        draw_attribute(ax, ax_x, ax_y, aw, ah, name, pk, mv, der, font_size=fs)

    # (H) Test Attributes
    test_attrs = [
        ("id", 940, 740, 44, 22, True, False, False, 7.6),
        ("sub_code", 940, 695, 60, 22, False, False, False, 7.6),
        ("sub_name", 950, 650, 62, 22, False, False, False, 7.6),
        ("questions", 1150, 805, 60, 22, False, False, False, 7.6),
        ("answers", 1195, 765, 54, 22, False, False, False, 7.6),
        ("score", 1190, 720, 50, 22, False, False, False, 7.6),
        ("Teacher_name", 1165, 675, 78, 22, False, False, False, 7.6)
    ]
    for name, ax_x, ax_y, aw, ah, pk, mv, der, fs in test_attrs:
        connect(ax, (test_pos[0], test_pos[1]), (ax_x, ax_y))
        draw_attribute(ax, ax_x, ax_y, aw, ah, name, pk, mv, der, font_size=fs)

    # (I) Right Attendance Attributes
    att_r_attrs = [
        ("student_id", 1475, 830, 64, 22, True, False, False, 7.6),
        ("enrollment", 1485, 785, 66, 22, False, False, False, 7.6),
        ("Recorded_at", 1485, 740, 70, 22, False, False, False, 7.6),
        ("Recorded_Time_\nDate", 1470, 690, 86, 30, False, False, True, 7.2),
        ("teacher_id", 1415, 645, 64, 22, False, False, False, 7.6)
    ]
    for name, ax_x, ax_y, aw, ah, pk, mv, der, fs in att_r_attrs:
        connect(ax, (att_right_pos[0], att_right_pos[1]), (ax_x, ax_y))
        draw_attribute(ax, ax_x, ax_y, aw, ah, name, pk, mv, der, font_size=fs)

    # ─────────────────────────────────────────────────────────────────
    # 7. LOWER TIER ENTITIES (Random_Password, class, assignment_sub, todo, test_sub)
    # ─────────────────────────────────────────────────────────────────
    
    rnd_pass_pos = (250, 380)
    class_pos = (510, 380)
    assign_sub_pos = (780, 275)
    todo_pos = (1050, 420)
    test_sub_pos = (1330, 395)
    
    draw_entity(ax, rnd_pass_pos[0], rnd_pass_pos[1], 110, 36, "Random_Password")
    draw_entity(ax, class_pos[0], class_pos[1], 130, 38, "class / department")
    draw_entity(ax, assign_sub_pos[0], assign_sub_pos[1], 120, 40, "assignment_sub\nmission", is_weak=True)
    draw_entity(ax, todo_pos[0], todo_pos[1], 120, 42, "todo /\nnotifications")
    draw_entity(ax, test_sub_pos[0], test_sub_pos[1], 95, 40, "test_sub\nmission", is_weak=True)
    
    # Teachers -> Random_Password (routed along clean left channel with clear clearance)
    connect(ax, (teachers_pos[0] - 45, teachers_pos[1] - 21), (300, 540))
    connect(ax, (300, 540), (rnd_pass_pos[0] + 30, rnd_pass_pos[1] + 18))
    
    # Generate (Random_Password -> generate)
    rel_gen = (rnd_pass_pos[0], 285)
    draw_relationship(ax, rel_gen[0], rel_gen[1], 62, 34, "generate")
    connect(ax, (rnd_pass_pos[0], rnd_pass_pos[1] - 18), (rel_gen[0], rel_gen[1] + 17))
    
    # Teachers -> Class (via Notes bottom)
    connect(ax, (notes_pos[0], notes_pos[1] - 19), (class_pos[0], class_pos[1] + 19))
    
    # Class -> Assignment_Sub (via Identifying Has)
    rel_has_sub = (670, 380)
    draw_relationship(ax, rel_has_sub[0], rel_has_sub[1], 58, 34, "has", is_identifying=True)
    connect(ax, (class_pos[0] + 65, class_pos[1]), (rel_has_sub[0] - 29, rel_has_sub[1]))
    connect(ax, (rel_has_sub[0] + 29, rel_has_sub[1]), (assign_sub_pos[0] - 30, assign_sub_pos[1] + 20))
    
    # Assignment -> Assignment_Sub
    connect(ax, (assignment_pos[0], assignment_pos[1] - 19), (assign_sub_pos[0], assign_sub_pos[1] + 20))
    
    # Students -> Todo (routed cleanly between assignment and test)
    connect(ax, (students_pos[0] + 10, students_pos[1] - 21), (880, 560))
    connect(ax, (880, 560), (todo_pos[0] - 30, todo_pos[1] + 21))
    
    # Test -> Test_Sub (via Identifying Has)
    rel_has_test = (1330, 560)
    draw_relationship(ax, rel_has_test[0], rel_has_test[1], 58, 34, "has", is_identifying=True)
    connect(ax, (test_pos[0] + 47.5, test_pos[1]), (1330, test_pos[1]))
    connect(ax, (1330, test_pos[1]), (rel_has_test[0], rel_has_test[1] + 17))
    connect(ax, (rel_has_test[0], rel_has_test[1] - 17), (test_sub_pos[0], test_sub_pos[1] + 20))

    # ─────────────────────────────────────────────────────────────────
    # 8. ATTRIBUTES FOR LOWER TIER ENTITIES
    # ─────────────────────────────────────────────────────────────────
    
    # (J) Random_Password Attributes
    rnd_attrs = [
        ("id", 160, 455, 44, 22, True, False, False, 7.6),
        ("password", 250, 455, 62, 22, False, False, False, 7.6),
        ("teacherid", 340, 455, 62, 22, False, False, False, 7.6)
    ]
    for name, ax_x, ax_y, aw, ah, pk, mv, der, fs in rnd_attrs:
        connect(ax, (rnd_pass_pos[0], rnd_pass_pos[1]), (ax_x, ax_y))
        draw_attribute(ax, ax_x, ax_y, aw, ah, name, pk, mv, der, font_size=fs)

    # (K) Class Attributes
    class_attrs = [
        ("class_id", 400, 295, 60, 22, True, False, False, 7.6),
        ("sub_name", 495, 295, 62, 22, False, False, False, 7.6),
        ("sub_code", 590, 295, 60, 22, False, False, False, 7.6)
    ]
    for name, ax_x, ax_y, aw, ah, pk, mv, der, fs in class_attrs:
        connect(ax, (class_pos[0], class_pos[1]), (ax_x, ax_y))
        draw_attribute(ax, ax_x, ax_y, aw, ah, name, pk, mv, der, font_size=fs)

    # (L) Assignment_Submission Attributes
    asub_attrs = [
        ("assignment_id", 900, 315, 76, 22, False, False, False, 7.6),
        ("sub_code", 925, 270, 60, 22, False, False, False, 7.6),
        ("sub_name", 925, 225, 62, 22, False, False, False, 7.6),
        ("Teacher_id", 890, 180, 68, 22, False, False, False, 7.6),
        ("answer_file", 820, 135, 70, 22, False, False, False, 7.6),
        ("score", 730, 95, 48, 22, False, False, False, 7.6)
    ]
    for name, ax_x, ax_y, aw, ah, pk, mv, der, fs in asub_attrs:
        connect(ax, (assign_sub_pos[0], assign_sub_pos[1]), (ax_x, ax_y))
        draw_attribute(ax, ax_x, ax_y, aw, ah, name, pk, mv, der, font_size=fs)

    # (M) Todo Attributes
    todo_attrs = [
        ("id", 965, 345, 44, 22, True, False, False, 7.6),
        ("todo", 1040, 345, 48, 22, False, False, False, 7.6),
        ("uname", 1115, 345, 52, 22, False, False, False, 7.6),
        ("created_at", 1205, 420, 66, 22, False, False, True, 7.6)
    ]
    for name, ax_x, ax_y, aw, ah, pk, mv, der, fs in todo_attrs:
        connect(ax, (todo_pos[0], todo_pos[1]), (ax_x, ax_y))
        draw_attribute(ax, ax_x, ax_y, aw, ah, name, pk, mv, der, font_size=fs)

    # (N) Test_Submission Attributes
    tsub_attrs = [
        ("assignment_id", 1460, 455, 76, 22, False, False, False, 7.6),
        ("sub_code", 1475, 405, 60, 22, False, False, False, 7.6),
        ("sub_name", 1475, 355, 62, 22, False, False, False, 7.6),
        ("Teacher_id", 1425, 305, 68, 22, False, False, False, 7.6),
        ("answer_file", 1340, 235, 70, 22, False, False, False, 7.6),
        ("score", 1250, 190, 48, 22, False, False, False, 7.6)
    ]
    for name, ax_x, ax_y, aw, ah, pk, mv, der, fs in tsub_attrs:
        connect(ax, (test_sub_pos[0], test_sub_pos[1]), (ax_x, ax_y))
        draw_attribute(ax, ax_x, ax_y, aw, ah, name, pk, mv, der, font_size=fs)

    # Save diagram
    output_filename = "er_diagram.png"
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
    render_er_diagram()
