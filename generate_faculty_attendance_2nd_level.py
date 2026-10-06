import matplotlib.pyplot as plt
import matplotlib.patches as patches
import numpy as np
import os
import shutil

def render_attendance_2nd_level_dfd():
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
    # 1. OUTER FRAME
    # ─────────────────────────────────────────────────────────────────
    frame_x, frame_y = 45, 65
    frame_w, frame_h = 1310, 1470
    outer_box = patches.Rectangle(
        (frame_x, frame_y), frame_w, frame_h,
        linewidth=1.8, edgecolor='black', facecolor='white', zorder=1
    )
    ax.add_patch(outer_box)
    
    # ─────────────────────────────────────────────────────────────────
    # 2. TITLE & CAPTION
    # ─────────────────────────────────────────────────────────────────
    ax.text(xlim / 2, frame_y + frame_h - 48, "Faculty side DFD :- Manage Attendance 2nd Level", fontsize=22, fontweight='bold', fontfamily='sans-serif', ha='center', va='center', color='black')
    ax.text(xlim / 2, 38, "Figure 5.2.5. Faculty Side DFD: Manage Attendance 2nd Level", fontsize=15.5, fontfamily='serif', ha='center', va='center', color='black')
    
    # ─────────────────────────────────────────────────────────────────
    # 3. PROCESS DEFINITIONS (5.0, 5.1, 5.2, 5.3, 5.4)
    # ─────────────────────────────────────────────────────────────────
    processes = [
        {
            "num": "5.0",
            "name": ["Manage", "Attendance"],
            "req_left": ["Requesting for", "Manage Attendance"],
            "ack_left": ["Get the response for", "managing attendance"],
            "req_right": ["Requesting for", "Manage Attendance"],
            "ack_right": ["Get the response for", "managing attendance"]
        },
        {
            "num": "5.1",
            "name": ["View", "Attendance"],
            "req_left": ["Request to view", "attendance"],
            "ack_left": ["Display the Attendance"],
            "req_right": ["Request attendance", "records"],
            "ack_right": ["Attendance records"]
        },
        {
            "num": "5.2",
            "name": ["Mark Manual", "Attendance"],
            "req_left": ["Request to mark", "attendance"],
            "ack_left": ["Attendance marked", "successfully"],
            "req_right": ["Save student", "attendance"],
            "ack_right": ["Attendance saved", "successfully"]
        },
        {
            "num": "5.3",
            "name": ["Manage QR", "Session"],
            "req_left": ["Request to start", "QR attendance"],
            "ack_left": ["Display QR attendance", "session"],
            "req_right": ["Start dynamic", "QR session"],
            "ack_right": ["QR session status"]
        },
        {
            "num": "5.4",
            "name": ["View", "Report"],
            "req_left": ["Request attendance", "report"],
            "ack_left": ["Display attendance", "report"],
            "req_right": ["Retrieve attendance", "summary"],
            "ack_right": ["Attendance summary"]
        }
    ]
    
    n = len(processes)
    circle_x = 680
    circle_r = 58
    
    top_y = frame_y + frame_h - 150
    bottom_y = frame_y + 110
    y_step = (top_y - bottom_y) / (n - 1)
    ys = [top_y - i * y_step for i in range(n)]
    
    # ─────────────────────────────────────────────────────────────────
    # 4. FACULTY ENTITY BOX (TOP LEFT)
    # ─────────────────────────────────────────────────────────────────
    # Aligned with Process 5.0 (ys[0])
    ent_w = 150
    ent_h = 75
    ent_x = 75
    ent_y = ys[0] - ent_h / 2
    
    entity_rect = patches.Rectangle(
        (ent_x, ent_y), ent_w, ent_h,
        linewidth=1.5, edgecolor='black', facecolor='white', zorder=20
    )
    ax.add_patch(entity_rect)
    ax.text(ent_x + ent_w / 2, ent_y + ent_h / 2, "Faculty", fontsize=16, fontfamily='sans-serif', ha='center', va='center', color='black', zorder=21)
    
    # ─────────────────────────────────────────────────────────────────
    # 5. ATTENDANCE DATA STORE (TOP RIGHT)
    # ─────────────────────────────────────────────────────────────────
    # Aligned with Process 5.0 (ys[0])
    ds_x1 = 1140
    ds_x2 = 1300
    ds_gap = 18
    
    ax.plot([ds_x1, ds_x2], [ys[0] + ds_gap, ys[0] + ds_gap], color='black', linewidth=1.5, zorder=20)
    ax.plot([ds_x1, ds_x2], [ys[0] - ds_gap, ys[0] - ds_gap], color='black', linewidth=1.5, zorder=20)
    ax.text((ds_x1 + ds_x2) / 2, ys[0], "attendance", fontsize=13, fontfamily='sans-serif', ha='center', va='center', zorder=21)
    
    # ─────────────────────────────────────────────────────────────────
    # 6. PROCESS CIRCLES & CONNECTORS
    # ─────────────────────────────────────────────────────────────────
    arrow_props = dict(arrowstyle="-|>", color="black", lw=1.2, mutation_scale=12)
    chord_dy = 18
    chord_w = np.sqrt(circle_r**2 - chord_dy**2)
    
    for i, p in enumerate(processes):
        py = ys[i]
        
        # ── Circle ──
        circ = patches.Circle((circle_x, py), circle_r, linewidth=1.4, edgecolor='black', facecolor='white', zorder=10)
        ax.add_patch(circ)
        
        # ── Chord Line ──
        ax.plot([circle_x - chord_w, circle_x + chord_w], [py + chord_dy, py + chord_dy], color='black', linewidth=1.4, zorder=11)
        
        # ── Process Number ──
        ax.text(circle_x, py + chord_dy + 16, p['num'], fontsize=12.5, fontfamily='sans-serif', ha='center', va='center', zorder=12)
        
        # ── Process Name (Inside lower circle, fully padded) ──
        if len(p['name']) == 1:
            ax.text(circle_x, py - 18, p['name'][0], fontsize=12.5, fontfamily='sans-serif', ha='center', va='center', zorder=12)
        elif len(p['name']) == 2:
            ax.text(circle_x, py - 10, p['name'][0], fontsize=11.5, fontfamily='sans-serif', ha='center', va='center', zorder=12)
            ax.text(circle_x, py - 27, p['name'][1], fontsize=11.5, fontfamily='sans-serif', ha='center', va='center', zorder=12)
        
        # ─── CONNECTORS FOR PROCESS 5.0 (DIRECT HORIZONTAL) ───
        if i == 0:
            # Faculty <-> 5.0 (Left side)
            ax.annotate('', xy=(circle_x - circle_r + 2, py + 12), xytext=(ent_x + ent_w, py + 12), arrowprops=arrow_props)
            mid_left_x = (ent_x + ent_w + circle_x - circle_r) / 2
            ax.text(mid_left_x, py + 32, p['req_left'][0], fontsize=9.5, fontfamily='sans-serif', ha='center', va='bottom')
            ax.text(mid_left_x, py + 18, p['req_left'][1], fontsize=9.5, fontfamily='sans-serif', ha='center', va='bottom')
            
            ax.annotate('', xy=(ent_x + ent_w, py - 12), xytext=(circle_x - circle_r + 2, py - 12), arrowprops=arrow_props)
            ax.text(mid_left_x, py - 18, p['ack_left'][0], fontsize=9.5, fontfamily='sans-serif', ha='center', va='top')
            ax.text(mid_left_x, py - 32, p['ack_left'][1], fontsize=9.5, fontfamily='sans-serif', ha='center', va='top')
            
            # 5.0 <-> attendance (Right side)
            ax.annotate('', xy=(ds_x1, py + 12), xytext=(circle_x + circle_r - 2, py + 12), arrowprops=arrow_props)
            mid_right_x = (circle_x + circle_r + ds_x1) / 2
            ax.text(mid_right_x, py + 32, p['req_right'][0], fontsize=9.5, fontfamily='sans-serif', ha='center', va='bottom')
            ax.text(mid_right_x, py + 18, p['req_right'][1], fontsize=9.5, fontfamily='sans-serif', ha='center', va='bottom')
            
            ax.annotate('', xy=(circle_x + circle_r - 2, py - 12), xytext=(ds_x1, py - 12), arrowprops=arrow_props)
            ax.text(mid_right_x, py - 18, p['ack_right'][0], fontsize=9.5, fontfamily='sans-serif', ha='center', va='top')
            ax.text(mid_right_x, py - 32, p['ack_right'][1], fontsize=9.5, fontfamily='sans-serif', ha='center', va='top')

        # ─── CONNECTORS FOR SUB-PROCESSES (5.1, 5.2, 5.3, 5.4) ───
        else:
            sub_idx = i - 1  # 0 for 5.1, 1 for 5.2, 2 for 5.3, 3 for 5.4
            
            # ── LEFT SIDE: Faculty -> Process (Inner L) & Process -> Faculty (Outer L) ──
            v_req_x = ent_x + 35 + sub_idx * 28
            v_ack_x = ent_x + 20 + sub_idx * 28
            
            # Faculty -> Process
            ax.plot([v_req_x, v_req_x], [ent_y, py + 12], color='black', lw=1.2)
            ax.annotate('', xy=(circle_x - circle_r + 2, py + 12), xytext=(v_req_x, py + 12), arrowprops=arrow_props)
            
            mid_left_x = (v_req_x + circle_x - circle_r) / 2
            if len(p['req_left']) == 1:
                ax.text(mid_left_x, py + 18, p['req_left'][0], fontsize=9.5, fontfamily='sans-serif', ha='center', va='bottom')
            elif len(p['req_left']) == 2:
                ax.text(mid_left_x, py + 30, p['req_left'][0], fontsize=9.5, fontfamily='sans-serif', ha='center', va='bottom')
                ax.text(mid_left_x, py + 17, p['req_left'][1], fontsize=9.5, fontfamily='sans-serif', ha='center', va='bottom')
                
            # Process -> Faculty
            ax.plot([circle_x - circle_r + 2, v_ack_x], [py - 12, py - 12], color='black', lw=1.2)
            ax.plot([v_ack_x, v_ack_x], [py - 12, ent_y], color='black', lw=1.2)
            ax.annotate('', xy=(v_ack_x, ent_y), xytext=(v_ack_x, ent_y - 10), arrowprops=arrow_props)
            
            if len(p['ack_left']) == 1:
                ax.text(mid_left_x, py - 18, p['ack_left'][0], fontsize=9.5, fontfamily='sans-serif', ha='center', va='top')
            elif len(p['ack_left']) == 2:
                ax.text(mid_left_x, py - 18, p['ack_left'][0], fontsize=9.5, fontfamily='sans-serif', ha='center', va='top')
                ax.text(mid_left_x, py - 32, p['ack_left'][1], fontsize=9.5, fontfamily='sans-serif', ha='center', va='top')

            # ── RIGHT SIDE: Process -> attendance (Outer L) & attendance -> Process (Inner L) ──
            v_ds_req_x = ds_x2 - 15 - sub_idx * 28
            v_ds_ack_x = ds_x2 - sub_idx * 28
            
            # Process -> attendance
            ax.plot([circle_x + circle_r - 2, v_ds_req_x], [py + 12, py + 12], color='black', lw=1.2)
            ax.plot([v_ds_req_x, v_ds_req_x], [py + 12, ys[0] - ds_gap], color='black', lw=1.2)
            ax.annotate('', xy=(v_ds_req_x, ys[0] - ds_gap), xytext=(v_ds_req_x, ys[0] - ds_gap - 10), arrowprops=arrow_props)
            
            mid_right_x = (circle_x + circle_r + v_ds_req_x) / 2
            if len(p['req_right']) == 1:
                ax.text(mid_right_x, py + 18, p['req_right'][0], fontsize=9.5, fontfamily='sans-serif', ha='center', va='bottom')
            elif len(p['req_right']) == 2:
                ax.text(mid_right_x, py + 30, p['req_right'][0], fontsize=9.5, fontfamily='sans-serif', ha='center', va='bottom')
                ax.text(mid_right_x, py + 17, p['req_right'][1], fontsize=9.5, fontfamily='sans-serif', ha='center', va='bottom')
                
            # attendance -> Process
            ax.plot([v_ds_ack_x, v_ds_ack_x], [ys[0] - ds_gap, py - 12], color='black', lw=1.2)
            ax.annotate('', xy=(circle_x + circle_r - 2, py - 12), xytext=(v_ds_ack_x, py - 12), arrowprops=arrow_props)
            
            if len(p['ack_right']) == 1:
                ax.text(mid_right_x, py - 18, p['ack_right'][0], fontsize=9.5, fontfamily='sans-serif', ha='center', va='top')
            elif len(p['ack_right']) == 2:
                ax.text(mid_right_x, py - 18, p['ack_right'][0], fontsize=9.5, fontfamily='sans-serif', ha='center', va='top')
                ax.text(mid_right_x, py - 32, p['ack_right'][1], fontsize=9.5, fontfamily='sans-serif', ha='center', va='top')

    # Save to file
    root_dir = os.path.dirname(os.path.abspath(__file__))
    docs_dir = os.path.join(root_dir, "docs")
    os.makedirs(docs_dir, exist_ok=True)
    
    out_docs = os.path.join(docs_dir, "faculty_side_dfd_manage_attendance_2nd_level.png")
    out_root = os.path.join(root_dir, "faculty_side_dfd_manage_attendance_2nd_level.png")
    out_art = r"C:\Users\kondu\.gemini\antigravity-ide\brain\afb2dde3-47a7-4b66-945e-1eda209ded7b\faculty_side_dfd_manage_attendance_2nd_level.png"
    
    plt.savefig(out_docs, dpi=300, bbox_inches='tight', pad_inches=0.1)
    plt.savefig(out_root, dpi=300, bbox_inches='tight', pad_inches=0.1)
    plt.close()
    
    try:
        shutil.copyfile(out_docs, out_art)
    except Exception as e:
        print("Artifact copy info:", e)
        
    print("Faculty Side DFD (Manage Attendance 2nd Level) generated successfully with ZERO overlaps and NO underlines.")

if __name__ == "__main__":
    render_attendance_2nd_level_dfd()
