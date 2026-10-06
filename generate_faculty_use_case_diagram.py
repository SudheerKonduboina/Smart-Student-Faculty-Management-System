import matplotlib.pyplot as plt
import matplotlib.patches as patches
import numpy as np
import os
import shutil

def render_faculty_use_case_diagram():
    # Canvas dimensions: 12 x 17 inches at 300 DPI (3600 x 5100 px)
    fig_w, fig_h = 12, 17
    fig = plt.figure(figsize=(fig_w, fig_h), dpi=300)
    ax = fig.add_axes([0, 0, 1, 1])
    
    xlim = 1200
    ylim = 1700
    ax.set_xlim(0, xlim)
    ax.set_ylim(0, ylim)
    ax.set_aspect('equal')
    ax.axis('off')
    
    fig.patch.set_facecolor('white')
    ax.set_facecolor('white')
    
    # ─────────────────────────────────────────────────────────────────
    # 1. OUTER FRAME
    # ─────────────────────────────────────────────────────────────────
    frame_x, frame_y = 45, 55
    frame_w, frame_h = 1110, 1590
    outer_box = patches.Rectangle(
        (frame_x, frame_y), frame_w, frame_h,
        linewidth=1.8, edgecolor='black', facecolor='white', zorder=1
    )
    ax.add_patch(outer_box)
    
    # Bottom Caption
    ax.text(xlim / 2, 28, "Figure 6.0.3. Faculty Use Case Diagram", fontsize=15, fontfamily='serif', ha='center', va='center', color='black')
    
    # ─────────────────────────────────────────────────────────────────
    # 2. SYSTEM BOUNDARY (RECTANGULAR BOX ENCLOSING ALL USE CASES)
    # ─────────────────────────────────────────────────────────────────
    sb_x = 350
    sb_y = 75
    sb_w = 780
    sb_h = 1550
    
    system_box = patches.Rectangle(
        (sb_x, sb_y), sb_w, sb_h,
        linewidth=1.6, edgecolor='black', facecolor='white', zorder=2
    )
    ax.add_patch(system_box)
    
    # System Title at Top Inside System Boundary
    ax.text(sb_x + sb_w / 2, sb_y + sb_h - 40, "<<Smart Student & Faculty Management System>>", fontsize=14, fontfamily='sans-serif', ha='center', va='center', color='black', zorder=3)
    
    # ─────────────────────────────────────────────────────────────────
    # 3. 12 IDENTICAL FACULTY USE CASE OVALS (SMART-SMS PROJECT SPECIFIC)
    # ─────────────────────────────────────────────────────────────────
    use_cases = [
        "Login",
        "Mark Manual Attendance",
        "Start Dynamic QR Session",
        "View Attendance Reports",
        "View Timetable",
        "Create Assignment",
        "Evaluate Submissions",
        "Publish Grades",
        "Review Leave Applications",
        "View Notifications",
        "Profile",
        "Reset Password"
    ]
    
    n_uc = len(use_cases)
    top_y = sb_y + sb_h - 115
    bot_y = sb_y + 70
    y_step = (top_y - bot_y) / (n_uc - 1)
    
    ellipse_x = 740
    ew = 240
    eh = 72
    oval_lw = 1.5
    
    # ─────────────────────────────────────────────────────────────────
    # 4. FACULTY ACTOR (STICK FIGURE OUTSIDE BOUNDARY)
    # ─────────────────────────────────────────────────────────────────
    uc_mid_y = (top_y + bot_y) / 2  # 840
    actor_x = 175
    actor_mid_y = uc_mid_y
    head_cy = actor_mid_y + 55
    head_rx = 28
    head_ry = 20
    
    # Head
    head = patches.Ellipse((actor_x, head_cy), head_rx * 2, head_ry * 2, linewidth=1.6, edgecolor='black', facecolor='white', zorder=4)
    ax.add_patch(head)
    
    # Torso
    torso_top_y = head_cy - head_ry
    torso_bot_y = actor_mid_y - 45
    ax.plot([actor_x, actor_x], [torso_top_y, torso_bot_y], color='black', linewidth=1.6, zorder=4)
    
    # Arms
    arm_y = actor_mid_y + 8
    arm_span = 45
    ax.plot([actor_x - arm_span, actor_x + arm_span], [arm_y, arm_y], color='black', linewidth=1.6, zorder=4)
    
    # Legs
    leg_bot_y = torso_bot_y - 65
    leg_span = 40
    ax.plot([actor_x, actor_x - leg_span], [torso_bot_y, leg_bot_y], color='black', linewidth=1.6, zorder=4)
    ax.plot([actor_x, actor_x + leg_span], [torso_bot_y, leg_bot_y], color='black', linewidth=1.6, zorder=4)
    
    # Actor Label
    ax.text(actor_x, leg_bot_y - 25, "Faculty", fontsize=16, fontweight='bold', fontfamily='sans-serif', ha='center', va='center', color='black', zorder=4)
    
    # Unified origin for all association arrows (Right hand of the stick figure)
    origin_x = actor_x + arm_span
    origin_y = arm_y
    
    # ─────────────────────────────────────────────────────────────────
    # 5. DRAW IDENTICAL OVALS & LEFT-SIDE EDGE ARROWS
    # ─────────────────────────────────────────────────────────────────
    for idx, name in enumerate(use_cases):
        cy = top_y - idx * y_step
        
        # 1. Identical Use Case Ellipse
        el = patches.Ellipse(
            (ellipse_x, cy), ew, eh,
            linewidth=oval_lw, edgecolor='black', facecolor='white', zorder=4
        )
        ax.add_patch(el)
        
        # 2. Text Centered Horizontally & Vertically
        ax.text(
            ellipse_x, cy, name,
            fontsize=12.5, fontfamily='sans-serif', ha='center', va='center', color='black', zorder=5
        )
        
        # 3. Arrow Connection Target: Strictly at the Left-Side Edge (9 o'clock)
        target_x = ellipse_x - (ew / 2)
        target_y = cy
        
        # 4. Straight Association Arrow terminating at the oval's left boundary
        ax.annotate(
            '',
            xy=(target_x, target_y),
            xytext=(origin_x, origin_y),
            arrowprops=dict(
                arrowstyle='-|>',
                shrinkA=0,
                shrinkB=0,
                lw=1.3,
                edgecolor='black',
                facecolor='black',
                mutation_scale=14
            ),
            zorder=3
        )

    # Save image
    output_filename = "faculty_use_case_diagram.png"
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
    render_faculty_use_case_diagram()
