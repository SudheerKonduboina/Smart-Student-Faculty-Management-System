import matplotlib.pyplot as plt
import matplotlib.patches as patches
import os
import shutil

def render_student_login_2nd_level_dfd():
    # Canvas size: 14 x 9.5 inches at 300 DPI (4200 x 2850 px)
    fig_w, fig_h = 14, 9.5
    fig = plt.figure(figsize=(fig_w, fig_h), dpi=300)
    ax = fig.add_axes([0, 0, 1, 1])
    
    xlim = 1400
    ylim = 950
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
    frame_w, frame_h = 1310, 840
    outer_box = patches.Rectangle(
        (frame_x, frame_y), frame_w, frame_h,
        linewidth=1.8, edgecolor='black', facecolor='white', zorder=1
    )
    ax.add_patch(outer_box)
    
    # ─────────────────────────────────────────────────────────────────
    # 2. TITLE & CAPTION
    # ─────────────────────────────────────────────────────────────────
    ax.text(xlim / 2, frame_y + frame_h - 45, "Student side DFD :- Login 2nd Level", fontsize=22, fontweight='bold', fontfamily='sans-serif', ha='center', va='center', color='black')
    ax.text(xlim / 2, 32, "Figure 5.3.5. Student Side DFD: Login 2nd Level", fontsize=14, fontfamily='serif', ha='center', va='center', color='black')
    
    # ─────────────────────────────────────────────────────────────────
    # 3. PROCESS DEFINITIONS (1.0, 1.2, 1.3)
    # ─────────────────────────────────────────────────────────────────
    processes = [
        {
            "num": "1.0",
            "name": ["Login/", "Registration"],
            "req_left": ["Requesting for Login/", "Registration"],
            "ack_left": ["Login/Registered", "successfully"],
            "req_right": ["Requesting for Login/", "Registration"],
            "ack_right": ["Login/Registered", "successfully"]
        },
        {
            "num": "1.2",
            "name": ["Change", "Password"],
            "req_left": ["Request for Change Password"],
            "ack_left": ["Password reset successfully"],
            "req_right": ["Request for Change Password"],
            "ack_right": ["Password reset successfully"]
        },
        {
            "num": "1.3",
            "name": ["Forgot", "Password"],
            "req_left": ["Request for forgot Password"],
            "ack_left": ["Password reset successfully"],
            "req_right": ["Request for forgot Password"],
            "ack_right": ["Password reset successfully"]
        }
    ]
    
    circle_x = 680
    circle_r = 68
    
    ys = [660, 420, 180]
    
    # ─────────────────────────────────────────────────────────────────
    # 4. STUDENT ENTITY BOX (TOP LEFT)
    # ─────────────────────────────────────────────────────────────────
    ent_w = 190
    ent_h = 80
    ent_x = 75
    ent_y = ys[0] - ent_h / 2
    
    ent_box = patches.Rectangle(
        (ent_x, ent_y), ent_w, ent_h,
        linewidth=1.5, edgecolor='black', facecolor='white', zorder=4
    )
    ax.add_patch(ent_box)
    ax.text(ent_x + ent_w / 2, ys[0], "Student", fontsize=18, fontweight='bold', fontfamily='sans-serif', ha='center', va='center', color='black', zorder=5)
    
    # ─────────────────────────────────────────────────────────────────
    # 5. DATA STORE (TOP RIGHT)
    # ─────────────────────────────────────────────────────────────────
    ds_x_start = 1085
    ds_x_end = 1320
    ds_half_h = 32
    ds_y_top = ys[0] + ds_half_h
    ds_y_bot = ys[0] - ds_half_h
    
    ax.plot([ds_x_start, ds_x_end], [ds_y_top, ds_y_top], color='black', linewidth=1.5, zorder=4)
    ax.plot([ds_x_start, ds_x_end], [ds_y_bot, ds_y_bot], color='black', linewidth=1.5, zorder=4)
    ax.text((ds_x_start + ds_x_end) / 2, ys[0], "students", fontsize=18, fontweight='bold', fontfamily='sans-serif', ha='center', va='center', color='black', zorder=5)
    
    # ─────────────────────────────────────────────────────────────────
    # 6. RENDER PROCESS CIRCLES
    # ─────────────────────────────────────────────────────────────────
    for idx, p in enumerate(processes):
        cy = ys[idx]
        
        # Circle
        circ = patches.Circle((circle_x, cy), circle_r, linewidth=1.5, edgecolor='black', facecolor='white', zorder=4)
        ax.add_patch(circ)
        
        # Chord line (divider)
        chord_offset = 15
        chord_y = cy + chord_offset
        dx = (circle_r**2 - chord_offset**2)**0.5
        ax.plot([circle_x - dx, circle_x + dx], [chord_y, chord_y], color='black', linewidth=1.3, zorder=5)
        
        # Process number (above chord)
        ax.text(circle_x, cy + 37, p["num"], fontsize=15, fontweight='bold', fontfamily='sans-serif', ha='center', va='center', color='black', zorder=6)
        
        # Process name (below chord)
        name_lines = p["name"]
        if len(name_lines) == 1:
            ax.text(circle_x, cy - 18, name_lines[0], fontsize=12, fontweight='bold', fontfamily='sans-serif', ha='center', va='center', color='black', zorder=6)
        elif len(name_lines) == 2:
            ax.text(circle_x, cy - 8, name_lines[0], fontsize=11.5, fontweight='bold', fontfamily='sans-serif', ha='center', va='center', color='black', zorder=6)
            ax.text(circle_x, cy - 28, name_lines[1], fontsize=11.5, fontweight='bold', fontfamily='sans-serif', ha='center', va='center', color='black', zorder=6)
            
    # ─────────────────────────────────────────────────────────────────
    # 7. CONNECTORS & FLOW LABELS
    # ─────────────────────────────────────────────────────────────────
    # Process 1.0 (Direct horizontal)
    y_req_0 = ys[0] + 20
    y_ack_0 = ys[0] - 20
    
    # Left flows for 1.0
    ax.annotate('', xy=(circle_x - circle_r, y_req_0), xytext=(ent_x + ent_w, y_req_0),
                arrowprops=dict(arrowstyle='->', lw=1.2, color='black', mutation_scale=11), zorder=3)
    ax.annotate('', xy=(ent_x + ent_w, y_ack_0), xytext=(circle_x - circle_r, y_ack_0),
                arrowprops=dict(arrowstyle='->', lw=1.2, color='black', mutation_scale=11), zorder=3)
    
    ax.text((ent_x + ent_w + circle_x - circle_r) / 2, y_req_0 + 22, "Requesting for Login/\nRegistration",
            fontsize=9.5, fontfamily='sans-serif', ha='center', va='center', color='black')
    ax.text((ent_x + ent_w + circle_x - circle_r) / 2, y_ack_0 - 20, "Login/Registered\nsuccessfully",
            fontsize=9.5, fontfamily='sans-serif', ha='center', va='center', color='black')
    
    # Right flows for 1.0
    ax.annotate('', xy=(ds_x_start, y_req_0), xytext=(circle_x + circle_r, y_req_0),
                arrowprops=dict(arrowstyle='->', lw=1.2, color='black', mutation_scale=11), zorder=3)
    ax.annotate('', xy=(circle_x + circle_r, y_ack_0), xytext=(ds_x_start, y_ack_0),
                arrowprops=dict(arrowstyle='->', lw=1.2, color='black', mutation_scale=11), zorder=3)
    
    ax.text((circle_x + circle_r + ds_x_start) / 2, y_req_0 + 22, "Requesting for Login/\nRegistration",
            fontsize=9.5, fontfamily='sans-serif', ha='center', va='center', color='black')
    ax.text((circle_x + circle_r + ds_x_start) / 2, y_ack_0 - 20, "Login/Registered\nsuccessfully",
            fontsize=9.5, fontfamily='sans-serif', ha='center', va='center', color='black')
    
    # L-Tracks for Process 1.2 and 1.3
    sub_configs = [
        {
            "idx": 1, # 1.2 Change Password
            "x_req_left": 120, "y_req_left": ys[1] + 16,
            "x_ack_left": 155, "y_ack_left": ys[1] - 16,
            "x_req_right": 1275, "y_req_right": ys[1] + 16,
            "x_ack_right": 1235, "y_ack_right": ys[1] - 16,
        },
        {
            "idx": 2, # 1.3 Forgot Password
            "x_req_left": 95, "y_req_left": ys[2] + 16,
            "x_ack_left": 180, "y_ack_left": ys[2] - 16,
            "x_req_right": 1300, "y_req_right": ys[2] + 16,
            "x_ack_right": 1210, "y_ack_right": ys[2] - 16,
        }
    ]
    
    for cfg in sub_configs:
        idx = cfg["idx"]
        p = processes[idx]
        
        # 1. Left Request Flow: Entity bottom -> down -> right to circle
        ax.plot([cfg["x_req_left"], cfg["x_req_left"]], [ent_y, cfg["y_req_left"]], color='black', linewidth=1.2, zorder=2)
        ax.annotate('', xy=(circle_x - circle_r, cfg["y_req_left"]), xytext=(cfg["x_req_left"], cfg["y_req_left"]),
                    arrowprops=dict(arrowstyle='->', lw=1.2, color='black', mutation_scale=11), zorder=3)
        
        # 2. Left Acknowledgment Flow: Circle -> left -> up to entity bottom
        ax.plot([circle_x - circle_r, cfg["x_ack_left"]], [cfg["y_ack_left"], cfg["y_ack_left"]], color='black', linewidth=1.2, zorder=2)
        ax.annotate('', xy=(cfg["x_ack_left"], ent_y), xytext=(cfg["x_ack_left"], cfg["y_ack_left"]),
                    arrowprops=dict(arrowstyle='->', lw=1.2, color='black', mutation_scale=11), zorder=3)
        
        # Left flow labels
        mid_left_x = (cfg["x_ack_left"] + circle_x - circle_r) / 2 + 35
        ax.text(mid_left_x, cfg["y_req_left"] + 14, "\n".join(p["req_left"]),
                fontsize=9.5, fontfamily='sans-serif', ha='center', va='center', color='black')
        ax.text(mid_left_x, cfg["y_ack_left"] - 14, "\n".join(p["ack_left"]),
                fontsize=9.5, fontfamily='sans-serif', ha='center', va='center', color='black')
        
        # 3. Right Request Flow: Circle -> right -> up to data store bottom
        ax.plot([circle_x + circle_r, cfg["x_req_right"]], [cfg["y_req_right"], cfg["y_req_right"]], color='black', linewidth=1.2, zorder=2)
        ax.annotate('', xy=(cfg["x_req_right"], ds_y_bot), xytext=(cfg["x_req_right"], cfg["y_req_right"]),
                    arrowprops=dict(arrowstyle='->', lw=1.2, color='black', mutation_scale=11), zorder=3)
        
        # 4. Right Acknowledgment Flow: Data store bottom -> down -> left to circle
        ax.plot([cfg["x_ack_right"], cfg["x_ack_right"]], [ds_y_bot, cfg["y_ack_right"]], color='black', linewidth=1.2, zorder=2)
        ax.annotate('', xy=(circle_x + circle_r, cfg["y_ack_right"]), xytext=(cfg["x_ack_right"], cfg["y_ack_right"]),
                    arrowprops=dict(arrowstyle='->', lw=1.2, color='black', mutation_scale=11), zorder=3)
        
        # Right flow labels
        mid_right_x = (circle_x + circle_r + cfg["x_ack_right"]) / 2 - 35
        ax.text(mid_right_x, cfg["y_req_right"] + 14, "\n".join(p["req_right"]),
                fontsize=9.5, fontfamily='sans-serif', ha='center', va='center', color='black')
        ax.text(mid_right_x, cfg["y_ack_right"] - 14, "\n".join(p["ack_right"]),
                fontsize=9.5, fontfamily='sans-serif', ha='center', va='center', color='black')

    # Save image
    output_filename = "student_side_dfd_login_2nd_level.png"
    docs_path = os.path.join("docs", output_filename)
    root_path = output_filename
    
    plt.savefig(docs_path, dpi=300, facecolor='white', bbox_inches=None)
    plt.savefig(root_path, dpi=300, facecolor='white', bbox_inches=None)
    
    # Also save to conversation artifacts directory
    artifact_dir = r"C:\Users\kondu\.gemini\antigravity-ide\brain\afb2dde3-47a7-4b66-945e-1eda209ded7b"
    if os.path.exists(artifact_dir):
        shutil.copy(root_path, os.path.join(artifact_dir, output_filename))
        
    print(f"Successfully rendered: {docs_path} and {root_path}")

if __name__ == "__main__":
    render_student_login_2nd_level_dfd()
