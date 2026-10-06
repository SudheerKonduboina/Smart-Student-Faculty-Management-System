import matplotlib.pyplot as plt
import matplotlib.patches as patches
import numpy as np
import os
import shutil

def render_faculty_timetable_dfd():
    fig_w, fig_h = 13.5, 12
    fig = plt.figure(figsize=(fig_w, fig_h), dpi=300)
    ax = fig.add_axes([0, 0, 1, 1])
    
    xlim = 1350
    ylim = 1200
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
    frame_w, frame_h = 1260, 1070
    outer_box = patches.Rectangle(
        (frame_x, frame_y), frame_w, frame_h,
        linewidth=1.6, edgecolor='black', facecolor='white', zorder=1
    )
    ax.add_patch(outer_box)
    
    # ─────────────────────────────────────────────────────────────────
    # 2. TITLE & CAPTION
    # ─────────────────────────────────────────────────────────────────
    ax.text(xlim / 2, frame_y + frame_h - 45, "Faculty side DFD :- View Time-Table 2nd Level", fontsize=21, fontweight='bold', fontfamily='sans-serif', ha='center', va='center', color='black')
    ax.text(xlim / 2, 38, "Figure 5.2.4. Faculty Side DFD: View Time-Table 2nd Level", fontsize=15, fontfamily='serif', ha='center', va='center', color='black')
    
    # ─────────────────────────────────────────────────────────────────
    # 3. 2ND-LEVEL PROCESS DEFINITIONS (Smart-SMS Read-Only for Faculty)
    # ─────────────────────────────────────────────────────────────────
    processes = [
        {
            "num": "2.0",
            "name": ["View", "Time-Table"],
            "store": "timetable",
            "req_left": ["Request to view", "Time Table"],
            "ack_left": ["Display Time-Table"],
            "req_right": ["Request timetable data"],
            "ack_right": ["Return timetable data"]
        },
        {
            "num": "2.1",
            "name": ["Retrieve", "Time-Table"],
            "store": "timetable",
            "req_left": ["Request to retrieve", "Time Table"],
            "ack_left": ["Time Table retrieved", "successfully"],
            "req_right": ["Retrieve timetable data"],
            "ack_right": ["Timetable data"]
        },
        {
            "num": "2.2",
            "name": ["View Class", "Schedule"],
            "store": "timetable",
            "req_left": ["Request to view", "class schedule"],
            "ack_left": ["Class schedule displayed"],
            "req_right": ["Request class schedule"],
            "ack_right": ["Class schedule data"]
        },
        {
            "num": "2.3",
            "name": ["View", "Personalized", "Schedule"],
            "store": "timetable",
            "req_left": ["Request personalized", "schedule"],
            "ack_left": ["Personalized schedule", "displayed"],
            "req_right": ["Request personalized", "timetable"],
            "ack_right": ["Personalized timetable", "data"]
        }
    ]
    
    n = len(processes)
    circle_x = 650
    circle_r = 62
    
    top_y = frame_y + frame_h - 150
    bottom_y = frame_y + 120
    y_step = (top_y - bottom_y) / (n - 1)
    ys = [top_y - i * y_step for i in range(n)]
    
    # ─────────────────────────────────────────────────────────────────
    # 4. FACULTY ENTITY BOX (LEFT)
    # ─────────────────────────────────────────────────────────────────
    # Entity sits on left, spanning the vertical range of 2.1 and 2.2
    ent_w = 145
    ent_h = y_step * 1.55
    ent_x = 85
    ent_center_y = (ys[1] + ys[2]) / 2
    ent_y = ent_center_y - ent_h / 2
    
    entity_rect = patches.Rectangle(
        (ent_x, ent_y), ent_w, ent_h,
        linewidth=1.5, edgecolor='black', facecolor='white', zorder=20
    )
    ax.add_patch(entity_rect)
    ax.text(ent_x + ent_w / 2, ent_y + ent_h / 2, "Faculty", fontsize=16, fontfamily='sans-serif', ha='center', va='center', color='black', zorder=21)
    
    # ─────────────────────────────────────────────────────────────────
    # 5. DATA STORES (RIGHT)
    # ─────────────────────────────────────────────────────────────────
    ds_x1 = 1060
    ds_x2 = 1220
    ds_gap = 18
    
    arrow_props = dict(arrowstyle="-|>", color="black", lw=1.2, mutation_scale=12)
    chord_dy = 19
    chord_w = np.sqrt(circle_r**2 - chord_dy**2)
    
    for i, p in enumerate(processes):
        py = ys[i]
        
        # ── 1. Circle ──
        circ = patches.Circle((circle_x, py), circle_r, linewidth=1.4, edgecolor='black', facecolor='white', zorder=10)
        ax.add_patch(circ)
        
        # ── 2. Chord Line ──
        ax.plot([circle_x - chord_w, circle_x + chord_w], [py + chord_dy, py + chord_dy], color='black', linewidth=1.4, zorder=11)
        
        # ── 3. Process Number ──
        ax.text(circle_x, py + chord_dy + 17, p['num'], fontsize=13, fontfamily='sans-serif', ha='center', va='center', zorder=12)
        
        # ── 4. Process Name (Inside lower circle, fully padded) ──
        if len(p['name']) == 1:
            ax.text(circle_x, py - 18, p['name'][0], fontsize=12.5, fontfamily='sans-serif', ha='center', va='center', zorder=12)
        elif len(p['name']) == 2:
            ax.text(circle_x, py - 10, p['name'][0], fontsize=11.5, fontfamily='sans-serif', ha='center', va='center', zorder=12)
            ax.text(circle_x, py - 28, p['name'][1], fontsize=11.5, fontfamily='sans-serif', ha='center', va='center', zorder=12)
        elif len(p['name']) == 3:
            ax.text(circle_x, py - 6, p['name'][0], fontsize=10.5, fontfamily='sans-serif', ha='center', va='center', zorder=12)
            ax.text(circle_x, py - 20, p['name'][1], fontsize=10.5, fontfamily='sans-serif', ha='center', va='center', zorder=12)
            ax.text(circle_x, py - 34, p['name'][2], fontsize=10.5, fontfamily='sans-serif', ha='center', va='center', zorder=12)
        
        # ── 5. Data Store (Parallel Lines) ──
        ax.plot([ds_x1, ds_x2], [py + ds_gap, py + ds_gap], color='black', linewidth=1.4)
        ax.plot([ds_x1, ds_x2], [py - ds_gap, py - ds_gap], color='black', linewidth=1.4)
        ax.text((ds_x1 + ds_x2) / 2, py, p['store'], fontsize=12, fontfamily='sans-serif', ha='center', va='center')
        
        # ── 6. Connectors: Process <-> Data Store (Right Side) ──
        req_y = py + 12
        ack_y = py - 12
        
        # Request Arrow -> Data Store
        ax.annotate('', xy=(ds_x1, req_y), xytext=(circle_x + circle_r - 2, req_y), arrowprops=arrow_props)
        mid_ds_x = (circle_x + circle_r + ds_x1) / 2
        if len(p['req_right']) == 1:
            ax.text(mid_ds_x, req_y + 8, p['req_right'][0], fontsize=9.5, fontfamily='sans-serif', ha='center', va='bottom')
        elif len(p['req_right']) == 2:
            ax.text(mid_ds_x, req_y + 20, p['req_right'][0], fontsize=9.5, fontfamily='sans-serif', ha='center', va='bottom')
            ax.text(mid_ds_x, req_y + 7, p['req_right'][1], fontsize=9.5, fontfamily='sans-serif', ha='center', va='bottom')
            
        # Ack Arrow <- Data Store
        ax.annotate('', xy=(circle_x + circle_r - 2, ack_y), xytext=(ds_x1, ack_y), arrowprops=arrow_props)
        if len(p['ack_right']) == 1:
            ax.text(mid_ds_x, ack_y - 8, p['ack_right'][0], fontsize=9.5, fontfamily='sans-serif', ha='center', va='top')
        elif len(p['ack_right']) == 2:
            ax.text(mid_ds_x, ack_y - 8, p['ack_right'][0], fontsize=9.5, fontfamily='sans-serif', ha='center', va='top')
            ax.text(mid_ds_x, ack_y - 21, p['ack_right'][1], fontsize=9.5, fontfamily='sans-serif', ha='center', va='top')

        # ── 7. Connectors: Faculty <-> Process (Left Side) ──
        if i == 0:
            # Process 2.0 (Top): L-track up from Faculty top
            v_req_x = ent_x + 35
            v_ack_x = ent_x + 65
            
            # Faculty -> 2.0
            ax.plot([v_req_x, v_req_x], [ent_y + ent_h, py + 14], color='black', lw=1.2)
            ax.annotate('', xy=(circle_x - circle_r + 2, py + 14), xytext=(v_req_x, py + 14), arrowprops=arrow_props)
            
            mid_flow_x = (v_req_x + circle_x - circle_r) / 2
            if len(p['req_left']) == 1:
                ax.text(mid_flow_x, py + 22, p['req_left'][0], fontsize=10, fontfamily='sans-serif', ha='center', va='bottom')
            elif len(p['req_left']) == 2:
                ax.text(mid_flow_x, py + 34, p['req_left'][0], fontsize=10, fontfamily='sans-serif', ha='center', va='bottom')
                ax.text(mid_flow_x, py + 20, p['req_left'][1], fontsize=10, fontfamily='sans-serif', ha='center', va='bottom')
                
            # 2.0 -> Faculty
            ax.plot([circle_x - circle_r + 2, v_ack_x], [py - 14, py - 14], color='black', lw=1.2)
            ax.plot([v_ack_x, v_ack_x], [py - 14, ent_y + ent_h], color='black', lw=1.2)
            ax.annotate('', xy=(v_ack_x, ent_y + ent_h), xytext=(v_ack_x, ent_y + ent_h + 10), arrowprops=arrow_props)
            ax.text(mid_flow_x, py - 6, p['ack_left'][0], fontsize=10, fontfamily='sans-serif', ha='center', va='bottom')

        elif i == 1:
            # Process 2.1: Direct horizontal from upper part of Faculty entity
            ax.annotate('', xy=(circle_x - circle_r + 2, py + 14), xytext=(ent_x + ent_w, py + 14), arrowprops=arrow_props)
            mid_flow_x = (ent_x + ent_w + circle_x - circle_r) / 2
            if len(p['req_left']) == 1:
                ax.text(mid_flow_x, py + 22, p['req_left'][0], fontsize=10, fontfamily='sans-serif', ha='center', va='bottom')
            elif len(p['req_left']) == 2:
                ax.text(mid_flow_x, py + 34, p['req_left'][0], fontsize=10, fontfamily='sans-serif', ha='center', va='bottom')
                ax.text(mid_flow_x, py + 20, p['req_left'][1], fontsize=10, fontfamily='sans-serif', ha='center', va='bottom')
                
            ax.annotate('', xy=(ent_x + ent_w, py - 14), xytext=(circle_x - circle_r + 2, py - 14), arrowprops=arrow_props)
            if len(p['ack_left']) == 1:
                ax.text(mid_flow_x, py - 22, p['ack_left'][0], fontsize=10, fontfamily='sans-serif', ha='center', va='top')
            elif len(p['ack_left']) == 2:
                ax.text(mid_flow_x, py - 22, p['ack_left'][0], fontsize=10, fontfamily='sans-serif', ha='center', va='top')
                ax.text(mid_flow_x, py - 36, p['ack_left'][1], fontsize=10, fontfamily='sans-serif', ha='center', va='top')

        elif i == 2:
            # Process 2.2: Direct horizontal from lower part of Faculty entity
            ax.annotate('', xy=(circle_x - circle_r + 2, py + 14), xytext=(ent_x + ent_w, py + 14), arrowprops=arrow_props)
            mid_flow_x = (ent_x + ent_w + circle_x - circle_r) / 2
            if len(p['req_left']) == 1:
                ax.text(mid_flow_x, py + 22, p['req_left'][0], fontsize=10, fontfamily='sans-serif', ha='center', va='bottom')
            elif len(p['req_left']) == 2:
                ax.text(mid_flow_x, py + 34, p['req_left'][0], fontsize=10, fontfamily='sans-serif', ha='center', va='bottom')
                ax.text(mid_flow_x, py + 20, p['req_left'][1], fontsize=10, fontfamily='sans-serif', ha='center', va='bottom')
                
            ax.annotate('', xy=(ent_x + ent_w, py - 14), xytext=(circle_x - circle_r + 2, py - 14), arrowprops=arrow_props)
            if len(p['ack_left']) == 1:
                ax.text(mid_flow_x, py - 22, p['ack_left'][0], fontsize=10, fontfamily='sans-serif', ha='center', va='top')
            elif len(p['ack_left']) == 2:
                ax.text(mid_flow_x, py - 22, p['ack_left'][0], fontsize=10, fontfamily='sans-serif', ha='center', va='top')
                ax.text(mid_flow_x, py - 36, p['ack_left'][1], fontsize=10, fontfamily='sans-serif', ha='center', va='top')

        elif i == 3:
            # Process 2.3 (Bottom): L-track down from Faculty bottom
            v_ack_x = ent_x + 35
            v_req_x = ent_x + 65
            
            # Faculty -> 2.3
            ax.plot([v_req_x, v_req_x], [ent_y, py + 14], color='black', lw=1.2)
            ax.annotate('', xy=(circle_x - circle_r + 2, py + 14), xytext=(v_req_x, py + 14), arrowprops=arrow_props)
            
            mid_flow_x = (v_req_x + circle_x - circle_r) / 2
            if len(p['req_left']) == 1:
                ax.text(mid_flow_x, py + 22, p['req_left'][0], fontsize=10, fontfamily='sans-serif', ha='center', va='bottom')
            elif len(p['req_left']) == 2:
                ax.text(mid_flow_x, py + 34, p['req_left'][0], fontsize=10, fontfamily='sans-serif', ha='center', va='bottom')
                ax.text(mid_flow_x, py + 20, p['req_left'][1], fontsize=10, fontfamily='sans-serif', ha='center', va='bottom')
                
            # 2.3 -> Faculty
            ax.plot([circle_x - circle_r + 2, v_ack_x], [py - 14, py - 14], color='black', lw=1.2)
            ax.plot([v_ack_x, v_ack_x], [py - 14, ent_y], color='black', lw=1.2)
            ax.annotate('', xy=(v_ack_x, ent_y), xytext=(v_ack_x, ent_y - 10), arrowprops=arrow_props)
            
            if len(p['ack_left']) == 1:
                ax.text(mid_flow_x, py - 22, p['ack_left'][0], fontsize=10, fontfamily='sans-serif', ha='center', va='top')
            elif len(p['ack_left']) == 2:
                ax.text(mid_flow_x, py - 22, p['ack_left'][0], fontsize=10, fontfamily='sans-serif', ha='center', va='top')
                ax.text(mid_flow_x, py - 36, p['ack_left'][1], fontsize=10, fontfamily='sans-serif', ha='center', va='top')

    # Save to file
    root_dir = os.path.dirname(os.path.abspath(__file__))
    docs_dir = os.path.join(root_dir, "docs")
    os.makedirs(docs_dir, exist_ok=True)
    
    out_docs = os.path.join(docs_dir, "faculty_side_dfd_view_timetable_2nd_level.png")
    out_root = os.path.join(root_dir, "faculty_side_dfd_view_timetable_2nd_level.png")
    out_art = r"C:\Users\kondu\.gemini\antigravity-ide\brain\afb2dde3-47a7-4b66-945e-1eda209ded7b\faculty_side_dfd_view_timetable_2nd_level.png"
    
    plt.savefig(out_docs, dpi=300, bbox_inches='tight', pad_inches=0.1)
    plt.savefig(out_root, dpi=300, bbox_inches='tight', pad_inches=0.1)
    plt.close()
    
    try:
        shutil.copyfile(out_docs, out_art)
    except Exception as e:
        print("Artifact copy info:", e)
        
    print("Faculty Side DFD (View Time-Table 2nd Level) generated successfully with all 4 processes connected.")

if __name__ == "__main__":
    render_faculty_timetable_dfd()
