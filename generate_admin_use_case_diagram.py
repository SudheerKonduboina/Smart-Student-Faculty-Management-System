import matplotlib.pyplot as plt
import matplotlib.patches as patches
import numpy as np
import os
import shutil

def render_admin_use_case_diagram():
    # Canvas size: 11 x 9 inches at 300 DPI (3300 x 2700 px)
    fig_w, fig_h = 11, 9
    fig = plt.figure(figsize=(fig_w, fig_h), dpi=300)
    ax = fig.add_axes([0, 0, 1, 1])
    
    xlim = 1100
    ylim = 900
    ax.set_xlim(0, xlim)
    ax.set_ylim(0, ylim)
    ax.set_aspect('equal')
    ax.axis('off')
    
    fig.patch.set_facecolor('white')
    ax.set_facecolor('white')
    
    # ─────────────────────────────────────────────────────────────────
    # 1. OUTER FRAME
    # ─────────────────────────────────────────────────────────────────
    frame_x, frame_y = 35, 55
    frame_w, frame_h = 1030, 800
    outer_box = patches.Rectangle(
        (frame_x, frame_y), frame_w, frame_h,
        linewidth=1.8, edgecolor='black', facecolor='white', zorder=1
    )
    ax.add_patch(outer_box)
    
    # Caption below diagram
    ax.text(xlim / 2, 28, "Figure 6.0.1. Admin Use Case Diagram", fontsize=15, fontfamily='serif', ha='center', va='center', color='black')
    
    # ─────────────────────────────────────────────────────────────────
    # 2. SYSTEM BOUNDARY (RIGHT RECTANGLE)
    # ─────────────────────────────────────────────────────────────────
    sb_x = 360
    sb_y = 75
    sb_w = 685
    sb_h = 760
    
    system_box = patches.Rectangle(
        (sb_x, sb_y), sb_w, sb_h,
        linewidth=1.5, edgecolor='black', facecolor='white', zorder=2
    )
    ax.add_patch(system_box)
    
    # System Stereotype / Title
    ax.text(sb_x + 20, sb_y + sb_h - 32, "<<Smart Student & Faculty Management System>>", fontsize=13, fontfamily='sans-serif', ha='left', va='center', color='black', zorder=3)
    
    # ─────────────────────────────────────────────────────────────────
    # 3. ADMIN ACTOR (LEFT STICK FIGURE)
    # ─────────────────────────────────────────────────────────────────
    actor_x = 170
    head_cy = 475
    head_rx = 26
    head_ry = 18
    
    # Head (ellipse)
    head = patches.Ellipse((actor_x, head_cy), head_rx * 2, head_ry * 2, linewidth=1.5, edgecolor='black', facecolor='white', zorder=4)
    ax.add_patch(head)
    
    # Neck to Torso
    torso_top_y = head_cy - head_ry
    torso_bot_y = 380
    ax.plot([actor_x, actor_x], [torso_top_y, torso_bot_y], color='black', linewidth=1.5, zorder=4)
    
    # Arms
    arm_y = 430
    arm_span = 42
    ax.plot([actor_x - arm_span, actor_x + arm_span], [arm_y, arm_y], color='black', linewidth=1.5, zorder=4)
    
    # Legs
    leg_bot_y = 325
    leg_span = 38
    ax.plot([actor_x, actor_x - leg_span], [torso_bot_y, leg_bot_y], color='black', linewidth=1.5, zorder=4)
    ax.plot([actor_x, actor_x + leg_span], [torso_bot_y, leg_bot_y], color='black', linewidth=1.5, zorder=4)
    
    # Actor Label
    ax.text(actor_x, leg_bot_y - 25, "Admin", fontsize=16, fontweight='bold', fontfamily='sans-serif', ha='center', va='center', color='black', zorder=4)
    
    # Connection Origin for Use Case Arrows
    origin_x = actor_x + arm_span
    origin_y = arm_y
    
    # ─────────────────────────────────────────────────────────────────
    # 4. USE CASE DEFINITIONS & ELLIPSES
    # ─────────────────────────────────────────────────────────────────
    use_cases = [
        {"name": ["Login"], "y": 660},
        {"name": ["Manage", "Students"], "y": 500},
        {"name": ["Manage", "Faculty"], "y": 340},
        {"name": ["View Statistics"], "y": 180}
    ]
    
    ellipse_x = 680
    ew = 180
    eh = 85
    
    for uc in use_cases:
        cy = uc["y"]
        
        # Draw Use Case Ellipse
        el = patches.Ellipse((ellipse_x, cy), ew, eh, linewidth=1.5, edgecolor='black', facecolor='white', zorder=4)
        ax.add_patch(el)
        
        # Text inside ellipse
        lines = uc["name"]
        if len(lines) == 1:
            ax.text(ellipse_x, cy, lines[0], fontsize=14, fontfamily='sans-serif', ha='center', va='center', color='black', zorder=5)
        elif len(lines) == 2:
            ax.text(ellipse_x, cy + 11, lines[0], fontsize=13.5, fontfamily='sans-serif', ha='center', va='center', color='black', zorder=5)
            ax.text(ellipse_x, cy - 11, lines[1], fontsize=13.5, fontfamily='sans-serif', ha='center', va='center', color='black', zorder=5)
            
        # Compute exact intersection with ellipse perimeter
        # Ellipse: ((x - cx)/a)^2 + ((y - cy)/b)^2 = 1
        a = ew / 2
        b = eh / 2
        dx = origin_x - ellipse_x
        dy = origin_y - cy
        
        # Ray from ellipse center to origin: r(t) = (cx + t*dx, cy + t*dy)
        # (t*dx/a)^2 + (t*dy/b)^2 = 1 => t = 1 / sqrt((dx/a)^2 + (dy/b)^2)
        t = 1.0 / np.sqrt((dx / a)**2 + (dy / b)**2)
        target_x = ellipse_x + t * dx
        target_y = cy + t * dy
        
        # Draw Arrow from Actor to Ellipse perimeter
        ax.annotate('', xy=(target_x, target_y), xytext=(origin_x, origin_y),
                    arrowprops=dict(arrowstyle='->', lw=1.3, color='black', mutation_scale=13), zorder=3)

    # Save image
    output_filename = "admin_use_case_diagram.png"
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
    render_admin_use_case_diagram()
