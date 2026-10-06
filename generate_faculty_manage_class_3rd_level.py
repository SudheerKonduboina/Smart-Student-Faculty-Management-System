import matplotlib.pyplot as plt
import matplotlib.patches as patches
import os
import shutil

def render_faculty_manage_class_3rd_level_dfd():
    # Canvas size: 15 x 21 inches at 300 DPI (4500 x 6300 px)
    fig_w, fig_h = 15, 21
    fig = plt.figure(figsize=(fig_w, fig_h), dpi=300)
    ax = fig.add_axes([0, 0, 1, 1])
    
    xlim = 1500
    ylim = 2100
    ax.set_xlim(0, xlim)
    ax.set_ylim(0, ylim)
    ax.set_aspect('equal')
    ax.axis('off')
    
    fig.patch.set_facecolor('white')
    ax.set_facecolor('white')
    
    # ─────────────────────────────────────────────────────────────────
    # 1. OUTER FRAME (Clean borders with safety margin)
    # ─────────────────────────────────────────────────────────────────
    frame_x, frame_y = 45, 60
    frame_w, frame_h = 1410, 1980
    outer_box = patches.Rectangle(
        (frame_x, frame_y), frame_w, frame_h,
        linewidth=1.8, edgecolor='black', facecolor='white', zorder=1
    )
    ax.add_patch(outer_box)
    
    # ─────────────────────────────────────────────────────────────────
    # 2. TITLE & CAPTION
    # ─────────────────────────────────────────────────────────────────
    ax.text(xlim / 2, frame_y + frame_h - 48, "Faculty side DFD :- Manage Class 3rd Level", fontsize=22, fontweight='bold', fontfamily='sans-serif', ha='center', va='center', color='black')
    ax.text(xlim / 2, 32, "Figure 5.4.1. Faculty Side DFD: Manage Class 3rd Level", fontsize=14, fontfamily='serif', ha='center', va='center', color='black')
    
    # ─────────────────────────────────────────────────────────────────
    # 3. PROCESS DEFINITIONS (7 Processes)
    # ─────────────────────────────────────────────────────────────────
    processes = [
        {
            "num": "6.3.0",
            "name": ["View", "Class"],
            "req_left": ["Requesting for", "viewing class"],
            "ack_left": ["Display list of class"],
            "req_right": ["Requesting for", "viewing class"],
            "ack_right": ["Display list of class"],
        },
        {
            "num": "6.3.1",
            "name": ["Generate", "Password"],
            "req_left": ["Requesting for generating", "random password"],
            "ack_left": ["Password Generated", "Successfully"],
            "req_right": ["Requesting for generating", "random password"],
            "ack_right": ["Password Generated", "Successfully"],
        },
        {
            "num": "6.3.2",
            "name": ["Delete", "Password"],
            "req_left": ["Requesting for", "delete Password"],
            "ack_left": ["Password deleted", "successfully"],
            "req_right": ["Requesting for", "delete Password"],
            "ack_right": ["Password deleted", "successfully"],
        },
        {
            "num": "6.3.3",
            "name": ["Assignment", "upload"],
            "req_left": ["Requesting for", "assignment upload"],
            "ack_left": ["Assignment", "uploaded successfully"],
            "req_right": ["Requesting for", "assignment upload"],
            "ack_right": ["Assignment", "uploaded successfully"],
        },
        {
            "num": "6.3.4",
            "name": ["Notes", "Upload"],
            "req_left": ["Requesting for", "notes upload"],
            "ack_left": ["Notes", "uploaded successfully"],
            "req_right": ["Requesting for", "notes upload"],
            "ack_right": ["Notes", "uploaded successfully"],
        },
        {
            "num": "6.3.5",
            "name": ["Upload quiz"],
            "req_left": ["Requesting for", "quiz upload"],
            "ack_left": ["quiz", "uploaded successfully"],
            "req_right": ["Requesting for", "quiz upload"],
            "ack_right": ["quiz", "uploaded successfully"],
        },
        {
            "num": "6.3.6",
            "name": ["View quiz", "result"],
            "req_left": ["Request to view quiz result"],
            "ack_left": ["Display quiz result"],
            "req_right": ["Request to view quiz result"],
            "ack_right": ["Display quiz result"],
        }
    ]
    
    n = len(processes)
    circle_x = 750
    circle_r = 65
    
    top_y = frame_y + frame_h - 160
    bottom_y = frame_y + 110
    y_step = (top_y - bottom_y) / (n - 1)
    ys = [top_y - i * y_step for i in range(n)]
    
    # ─────────────────────────────────────────────────────────────────
    # 4. FACULTY ENTITY BOX (TOP LEFT)
    # ─────────────────────────────────────────────────────────────────
    ent_w = 210
    ent_h = 80
    ent_x = 90
    ent_y = ys[0] - ent_h / 2
    
    ent_box = patches.Rectangle(
        (ent_x, ent_y), ent_w, ent_h,
        linewidth=1.5, edgecolor='black', facecolor='white', zorder=4
    )
    ax.add_patch(ent_box)
    ax.text(ent_x + ent_w / 2, ys[0], "Faculty", fontsize=18, fontweight='bold', fontfamily='sans-serif', ha='center', va='center', color='black', zorder=5)
    
    # ─────────────────────────────────────────────────────────────────
    # 5. DATA STORES (ON THE RIGHT)
    # ─────────────────────────────────────────────────────────────────
    data_stores = [
        {"y": ys[0], "name": "random_password", "w": 230},
        {"y": ys[3], "name": "assignment", "w": 200},
        {"y": ys[4], "name": "notes", "w": 200},
        {"y": ys[5], "name": "test", "w": 200}
    ]
    
    ds_x_start = 1180
    for ds in data_stores:
        ds_x_end = ds_x_start + ds["w"]
        ds_half_h = 28
        y_t = ds["y"] + ds_half_h
        y_b = ds["y"] - ds_half_h
        
        ax.plot([ds_x_start, ds_x_end], [y_t, y_t], color='black', linewidth=1.5, zorder=4)
        ax.plot([ds_x_start, ds_x_end], [y_b, y_b], color='black', linewidth=1.5, zorder=4)
        ax.text((ds_x_start + ds_x_end) / 2, ds["y"], ds["name"], fontsize=16, fontweight='bold', fontfamily='sans-serif', ha='center', va='center', color='black', zorder=5)
    
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
        ax.text(circle_x, cy + 36, p["num"], fontsize=14, fontweight='bold', fontfamily='sans-serif', ha='center', va='center', color='black', zorder=6)
        
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
    # Midpoints for labels
    mid_left_x = (ent_x + ent_w + circle_x - circle_r) / 2 + 35
    mid_right_x = (circle_x + circle_r + ds_x_start) / 2
    
    # 7.1 Direct Horizontal Connectors for 6.3.0
    y_req_0 = ys[0] + 18
    y_ack_0 = ys[0] - 18
    
    # Left flows for 6.3.0
    ax.annotate('', xy=(circle_x - circle_r, y_req_0), xytext=(ent_x + ent_w, y_req_0),
                arrowprops=dict(arrowstyle='->', lw=1.2, color='black', mutation_scale=11), zorder=3)
    ax.annotate('', xy=(ent_x + ent_w, y_ack_0), xytext=(circle_x - circle_r, y_ack_0),
                arrowprops=dict(arrowstyle='->', lw=1.2, color='black', mutation_scale=11), zorder=3)
    ax.text(mid_left_x, y_req_0 + 16, "\n".join(processes[0]["req_left"]),
            fontsize=9.5, fontfamily='sans-serif', ha='center', va='center', color='black')
    ax.text(mid_left_x, y_ack_0 - 16, "\n".join(processes[0]["ack_left"]),
            fontsize=9.5, fontfamily='sans-serif', ha='center', va='center', color='black')
    
    # Right flows for 6.3.0
    ax.annotate('', xy=(ds_x_start, y_req_0), xytext=(circle_x + circle_r, y_req_0),
                arrowprops=dict(arrowstyle='->', lw=1.2, color='black', mutation_scale=11), zorder=3)
    ax.annotate('', xy=(circle_x + circle_r, y_ack_0), xytext=(ds_x_start, y_ack_0),
                arrowprops=dict(arrowstyle='->', lw=1.2, color='black', mutation_scale=11), zorder=3)
    ax.text(mid_right_x, y_req_0 + 16, "\n".join(processes[0]["req_right"]),
            fontsize=9.5, fontfamily='sans-serif', ha='center', va='center', color='black')
    ax.text(mid_right_x, y_ack_0 - 16, "\n".join(processes[0]["ack_right"]),
            fontsize=9.5, fontfamily='sans-serif', ha='center', va='center', color='black')
    
    # Direct right flows for 6.3.3, 6.3.4, 6.3.5
    for idx in [3, 4, 5]:
        p = processes[idx]
        y_req = ys[idx] + 16
        y_ack = ys[idx] - 16
        ax.annotate('', xy=(ds_x_start, y_req), xytext=(circle_x + circle_r, y_req),
                    arrowprops=dict(arrowstyle='->', lw=1.2, color='black', mutation_scale=11), zorder=3)
        ax.annotate('', xy=(circle_x + circle_r, y_ack), xytext=(ds_x_start, y_ack),
                    arrowprops=dict(arrowstyle='->', lw=1.2, color='black', mutation_scale=11), zorder=3)
        ax.text(mid_right_x, y_req + 15, "\n".join(p["req_right"]),
                fontsize=9.5, fontfamily='sans-serif', ha='center', va='center', color='black')
        ax.text(mid_right_x, y_ack - 15, "\n".join(p["ack_right"]),
                fontsize=9.5, fontfamily='sans-serif', ha='center', va='center', color='black')

    # 7.2 Multi-Track L-Connectors
    # Left side routing channels (Entity at [90, 300] to processes 1, 2, 3, 4, 5, 6)
    left_tracks = [
        {"idx": 1, "x_req": 180, "x_ack": 210},
        {"idx": 2, "x_req": 165, "x_ack": 225},
        {"idx": 3, "x_req": 150, "x_ack": 240},
        {"idx": 4, "x_req": 135, "x_ack": 255},
        {"idx": 5, "x_req": 120, "x_ack": 270},
        {"idx": 6, "x_req": 105, "x_ack": 285}
    ]
    
    for tr in left_tracks:
        idx = tr["idx"]
        p = processes[idx]
        y_req = ys[idx] + 16
        y_ack = ys[idx] - 16
        
        # 1. Left Request Flow: Entity bottom -> down -> right to circle
        ax.plot([tr["x_req"], tr["x_req"]], [ent_y, y_req], color='black', linewidth=1.2, zorder=2)
        ax.annotate('', xy=(circle_x - circle_r, y_req), xytext=(tr["x_req"], y_req),
                    arrowprops=dict(arrowstyle='->', lw=1.2, color='black', mutation_scale=11), zorder=3)
        
        # 2. Left Acknowledgment Flow: Circle -> left -> up to entity bottom
        ax.plot([circle_x - circle_r, tr["x_ack"]], [y_ack, y_ack], color='black', linewidth=1.2, zorder=2)
        ax.annotate('', xy=(tr["x_ack"], ent_y), xytext=(tr["x_ack"], y_ack),
                    arrowprops=dict(arrowstyle='->', lw=1.2, color='black', mutation_scale=11), zorder=3)
        
        # Left flow labels
        lbl_x = (tr["x_ack"] + circle_x - circle_r) / 2 + 25
        ax.text(lbl_x, y_req + 15, "\n".join(p["req_left"]),
                fontsize=9.5, fontfamily='sans-serif', ha='center', va='center', color='black')
        ax.text(lbl_x, y_ack - 15, "\n".join(p["ack_left"]),
                fontsize=9.5, fontfamily='sans-serif', ha='center', va='center', color='black')

    # Right side L-Connectors for 6.3.1 & 6.3.2 (connecting to ds 0 at ys[0])
    ds0_bot_y = ys[0] - 28
    right_top_tracks = [
        {"idx": 1, "x_req": 1345, "x_ack": 1225},
        {"idx": 2, "x_req": 1370, "x_ack": 1200}
    ]
    for tr in right_top_tracks:
        idx = tr["idx"]
        p = processes[idx]
        y_req = ys[idx] + 16
        y_ack = ys[idx] - 16
        
        # Req: Circle -> right -> up to ds0
        ax.plot([circle_x + circle_r, tr["x_req"]], [y_req, y_req], color='black', linewidth=1.2, zorder=2)
        ax.annotate('', xy=(tr["x_req"], ds0_bot_y), xytext=(tr["x_req"], y_req),
                    arrowprops=dict(arrowstyle='->', lw=1.2, color='black', mutation_scale=11), zorder=3)
        
        # Ack: ds0 -> down -> left to circle
        ax.plot([tr["x_ack"], tr["x_ack"]], [ds0_bot_y, y_ack], color='black', linewidth=1.2, zorder=2)
        ax.annotate('', xy=(circle_x + circle_r, y_ack), xytext=(tr["x_ack"], y_ack),
                    arrowprops=dict(arrowstyle='->', lw=1.2, color='black', mutation_scale=11), zorder=3)
        
        ax.text(mid_right_x, y_req + 15, "\n".join(p["req_right"]),
                fontsize=9.5, fontfamily='sans-serif', ha='center', va='center', color='black')
        ax.text(mid_right_x, y_ack - 15, "\n".join(p["ack_right"]),
                fontsize=9.5, fontfamily='sans-serif', ha='center', va='center', color='black')

    # Right side L-Connector for 6.3.6 (connecting to ds 3 "test" at ys[5])
    ds3_bot_y = ys[5] - 28
    idx_6 = 6
    p_6 = processes[idx_6]
    y_req_6 = ys[idx_6] + 16
    y_ack_6 = ys[idx_6] - 16
    x_req_6 = 1355
    x_ack_6 = 1215
    
    # Req: Circle -> right -> up to ds3
    ax.plot([circle_x + circle_r, x_req_6], [y_req_6, y_req_6], color='black', linewidth=1.2, zorder=2)
    ax.annotate('', xy=(x_req_6, ds3_bot_y), xytext=(x_req_6, y_req_6),
                arrowprops=dict(arrowstyle='->', lw=1.2, color='black', mutation_scale=11), zorder=3)
    
    # Ack: ds3 -> down -> left to circle
    ax.plot([x_ack_6, x_ack_6], [ds3_bot_y, y_ack_6], color='black', linewidth=1.2, zorder=2)
    ax.annotate('', xy=(circle_x + circle_r, y_ack_6), xytext=(x_ack_6, y_ack_6),
                arrowprops=dict(arrowstyle='->', lw=1.2, color='black', mutation_scale=11), zorder=3)
    
    ax.text(mid_right_x, y_req_6 + 15, "\n".join(p_6["req_right"]),
            fontsize=9.5, fontfamily='sans-serif', ha='center', va='center', color='black')
    ax.text(mid_right_x, y_ack_6 - 15, "\n".join(p_6["ack_right"]),
            fontsize=9.5, fontfamily='sans-serif', ha='center', va='center', color='black')

    # Save image
    output_filename = "faculty_side_dfd_manage_class_3rd_level.png"
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
    render_faculty_manage_class_3rd_level_dfd()
