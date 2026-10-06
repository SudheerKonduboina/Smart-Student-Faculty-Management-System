import matplotlib.pyplot as plt
import matplotlib.patches as patches
import numpy as np
import os
import shutil

def draw_actor(ax, x, y, scale=1.0):
    """
    Draws a UML actor stick figure centered horizontally at x, head at y.
    """
    # Head
    head_r = 15 * scale
    head = patches.Circle((x, y - head_r), head_r, linewidth=1.5, edgecolor='black', facecolor='white', zorder=20)
    ax.add_patch(head)
    
    # Body
    neck_y = y - 2 * head_r
    waist_y = neck_y - 30 * scale
    ax.plot([x, x], [neck_y, waist_y], color='black', linewidth=1.5, zorder=20)
    
    # Arms
    arm_y = neck_y - 12 * scale
    ax.plot([x - 24 * scale, x + 24 * scale], [arm_y, arm_y], color='black', linewidth=1.5, zorder=20)
    
    # Legs
    leg_y = waist_y - 28 * scale
    ax.plot([x, x - 20 * scale], [waist_y, leg_y], color='black', linewidth=1.5, zorder=20)
    ax.plot([x, x + 20 * scale], [waist_y, leg_y], color='black', linewidth=1.5, zorder=20)
    
    # Actor label
    ax.text(x, leg_y - 10 * scale, "User\n(Student / Faculty)", fontsize=9.5, fontfamily='sans-serif', ha='center', va='top', color='black', zorder=20)

def draw_participant(ax, x, y, w, h, text):
    """
    Draws a participant box at top with rounded corners and clean gray fill.
    """
    rx = x - w / 2
    ry = y - h / 2
    box = patches.FancyBboxPatch(
        (rx, ry), w, h,
        boxstyle="round,pad=2,rounding_size=6",
        linewidth=1.4, edgecolor='black', facecolor='#D1D5DB', zorder=20
    )
    ax.add_patch(box)
    ax.text(x, y, text, fontsize=9.5, fontweight='bold', fontfamily='sans-serif', ha='center', va='center', color='black', zorder=21)

def draw_activation(ax, x, y_top, y_bottom, w=18):
    """
    Draws an activation bar (lifeline execution box) with light blue fill.
    """
    rx = x - w / 2
    h = y_top - y_bottom
    bar = patches.FancyBboxPatch(
        (rx, y_bottom), w, h,
        boxstyle="round,pad=0,rounding_size=3",
        linewidth=1.3, edgecolor='black', facecolor='#BAE6FD', zorder=10
    )
    ax.add_patch(bar)

def draw_message(ax, x1, x2, y, text, is_return=False, text_offset_y=14, label_pos_x=None):
    """
    Draws a horizontal message arrow with label.
    """
    style = '--' if is_return else '-'
    ax.plot([x1, x2], [y, y], color='black', linewidth=1.3, linestyle=style, zorder=12)
    
    # Draw arrowhead pointing to x2
    arrow_dir = 1 if x2 > x1 else -1
    arrow_len = 10 * arrow_dir
    arrow_w = 4.5
    
    if is_return:
        # Open arrowhead for return message
        ax.plot([x2 - arrow_len, x2, x2 - arrow_len], [y + arrow_w, y, y - arrow_w], color='black', linewidth=1.3, zorder=14)
    else:
        # Solid closed arrowhead for synchronous call
        arrow_head = patches.Polygon(
            [[x2, y], [x2 - arrow_len, y + arrow_w], [x2 - arrow_len, y - arrow_w]],
            closed=True, linewidth=1.0, edgecolor='black', facecolor='black', zorder=14
        )
        ax.add_patch(arrow_head)
    
    # Message text label
    mid_x = (x1 + x2) / 2 if label_pos_x is None else label_pos_x
    ty = y + text_offset_y
    ax.text(
        mid_x, ty, text,
        fontsize=8.5, fontfamily='sans-serif', ha='center', va='center', color='black',
        bbox=dict(boxstyle='square,pad=0.25', facecolor='white', edgecolor='none'),
        zorder=16
    )

def render_sequence_diagram():
    # Canvas size: 14 x 17 inches at 300 DPI
    fig_w, fig_h = 14, 17
    fig = plt.figure(figsize=(fig_w, fig_h), dpi=300)
    ax = fig.add_axes([0, 0, 1, 1])
    
    xlim = 1400
    ylim = 1700
    ax.set_xlim(0, xlim)
    ax.set_ylim(0, ylim)
    ax.set_aspect('equal')
    ax.axis('off')
    
    fig.patch.set_facecolor('white')
    ax.set_facecolor('white')
    
    # ─────────────────────────────────────────────────────────────────
    # 1. TOP TITLE & ACADEMIC OUTER BORDER
    # ─────────────────────────────────────────────────────────────────
    ax.text(xlim / 2, 1640, "6.  Sequence Diagram (All Modules)", fontsize=22, fontweight='bold', fontfamily='serif', ha='center', va='center', color='black')
    
    frame_x, frame_y = 50, 65
    frame_w, frame_h = 1300, 1535
    outer_box = patches.Rectangle(
        (frame_x, frame_y), frame_w, frame_h,
        linewidth=2.4, edgecolor='black', facecolor='white', zorder=1
    )
    ax.add_patch(outer_box)
    
    # Caption below diagram
    ax.text(xlim / 2, 32, "Figure 9.0.1. Sequence Diagram (All Modules)", fontsize=15, fontfamily='serif', ha='center', va='center', color='black')
    
    # ─────────────────────────────────────────────────────────────────
    # 2. PARTICIPANTS & LIFELINE COORDINATES
    # ─────────────────────────────────────────────────────────────────
    x_actor = 140
    x_ui = 410
    x_ctrl = 700
    x_db = 980
    x_serv = 1240
    
    top_box_y = 1485
    box_w = 175
    box_h = 46
    
    # Top Actor
    draw_actor(ax, x_actor, 1545, scale=0.88)
    
    # Top Participant Boxes
    draw_participant(ax, x_ui, top_box_y, box_w, box_h, "Web / UI Interface")
    draw_participant(ax, x_ctrl, top_box_y, box_w, box_h, "Controller & Auth")
    draw_participant(ax, x_db, top_box_y, box_w, box_h, "Database & Services")
    draw_participant(ax, x_serv, top_box_y, box_w, box_h, "QR & Notifications")
    
    # Vertical Lifeline Dashed Lines
    lifeline_bottom_y = 110
    lifeline_top_y = 1460
    for lx in [x_actor, x_ui, x_ctrl, x_db, x_serv]:
        ax.plot([lx, lx], [lifeline_top_y, lifeline_bottom_y], color='#94A3B8', linewidth=1.2, linestyle='--', dashes=(6, 4), zorder=3)
        
    # ─────────────────────────────────────────────────────────────────
    # 3. MESSAGE Y-COORDINATES (Spaced to eliminate all overlaps)
    # ─────────────────────────────────────────────────────────────────
    y1  = 1380   # User -> UI: new session
    y2  = 1310   # UI -> Ctrl: insert credentials / token
    y3  = 1240   # Ctrl -> UI: print msg: "Enter Password"
    y4  = 1170   # User -> UI: enter password / credentials
    y5  = 1100   # UI -> Ctrl: check validity
    y6  = 1030   # Ctrl -> UI: valid
    y7  = 960    # Ctrl -> UI: choose operation
    y8  = 890    # User -> UI: query account
    y9  = 820    # UI -> Ctrl: operation underway
    y10 = 745    # Ctrl -> DB: query account request
    y11 = 665    # DB -> Ctrl: the query
    y12 = 585    # Ctrl -> UI: print msg: "Take Card"
    y13 = 515    # UI -> User: remove card
    y14 = 425    # Ctrl -> QR/Notif: request receipt
    y15 = 345    # QR/Notif -> Ctrl: print receipt
    y16 = 265    # Ctrl -> UI: print msg: "Take Receipt"
    y17 = 185    # UI -> User: get receipt
    
    # ─────────────────────────────────────────────────────────────────
    # 4. ACTIVATION BARS (Strictly aligned with reference lifelines)
    # ─────────────────────────────────────────────────────────────────
    bar_w = 20
    
    # 1. User Actor: Active from first request down to final receipt
    draw_activation(ax, x_actor, y1 + 10, y17 - 10, w=bar_w)
    
    # 2. Web / UI Interface:
    #    - 1st bar: from 'new session' down to 'remove card'
    #    - 2nd bar: from 'Take Receipt' down to 'get receipt'
    draw_activation(ax, x_ui, y1 + 10, y13 - 10, w=bar_w)
    draw_activation(ax, x_ui, y16 + 10, y17 - 10, w=bar_w)
    
    # 3. Controller & Auth:
    #    - 1st bar: from 'insert credentials' down to 'Take Card'
    #    - 2nd bar: from 'request receipt' down to 'Take Receipt'
    draw_activation(ax, x_ctrl, y2 + 10, y12 - 10, w=bar_w)
    draw_activation(ax, x_ctrl, y14 + 10, y16 - 10, w=bar_w)
    
    # 4. Database & Services:
    #    - Active during DB query operation
    draw_activation(ax, x_db, y10 + 10, y11 - 10, w=bar_w)
    
    # 5. QR & Notifications:
    #    - Active during Receipt / QR generation operation
    draw_activation(ax, x_serv, y14 + 10, y15 - 10, w=bar_w)
    
    # ─────────────────────────────────────────────────────────────────
    # 5. MESSAGES & SEQUENCE FLOW (Exact 1:1 Mapping to Reference Flow)
    # ─────────────────────────────────────────────────────────────────
    
    # Step 1: User -> UI: new session
    draw_message(ax, x_actor + bar_w/2, x_ui - bar_w/2, y1, "new session")
    
    # Step 2: UI -> Controller: insert card / credentials
    draw_message(ax, x_ui + bar_w/2, x_ctrl - bar_w/2, y2, "insert card (credentials)")
    
    # Step 3: Controller -> UI: print msg: "Enter Password"
    draw_message(ax, x_ctrl - bar_w/2, x_ui + bar_w/2, y3, 'print msg: "Enter Password"', is_return=False)
    
    # Step 4: User -> UI: enter password
    draw_message(ax, x_actor + bar_w/2, x_ui - bar_w/2, y4, "enter password")
    
    # Step 5: UI -> Controller: check validity
    draw_message(ax, x_ui + bar_w/2, x_ctrl - bar_w/2, y5, "check validity")
    
    # Step 6: Controller -> UI: valid
    draw_message(ax, x_ctrl - bar_w/2, x_ui + bar_w/2, y6, "valid", is_return=False)
    
    # Step 7: Controller -> UI: choose operation
    draw_message(ax, x_ctrl - bar_w/2, x_ui + bar_w/2, y7, "choose operation", is_return=False)
    
    # Step 8: User -> UI: query account
    draw_message(ax, x_actor + bar_w/2, x_ui - bar_w/2, y8, "query account (select module)")
    
    # Step 9: UI -> Controller: operation underway
    draw_message(ax, x_ui + bar_w/2, x_ctrl - bar_w/2, y9, "operation underway")
    
    # Step 10: Controller -> DB: query account request
    draw_message(ax, x_ctrl + bar_w/2, x_db - bar_w/2, y10, "query account request")
    
    # Step 11: DB -> Controller: the query
    draw_message(ax, x_db - bar_w/2, x_ctrl + bar_w/2, y11, "the query", is_return=False)
    
    # Step 12: Controller -> UI: print msg: "Take Card"
    draw_message(ax, x_ctrl - bar_w/2, x_ui + bar_w/2, y12, 'print msg: "Take Card"', is_return=False)
    
    # Step 13: UI -> User: remove card
    draw_message(ax, x_ui - bar_w/2, x_actor + bar_w/2, y13, "remove card", is_return=False)
    
    # Step 14: Controller -> QR/Notifications: request receipt
    # Note: Placed clearly with label avoiding any overlapping lifeline
    draw_message(ax, x_ctrl + bar_w/2, x_serv - bar_w/2, y14, "request receipt (generate QR / report)", is_return=False)
    
    # Step 15: QR/Notifications -> Controller: print receipt
    draw_message(ax, x_serv - bar_w/2, x_ctrl + bar_w/2, y15, "print receipt (QR / notification response)", is_return=False)
    
    # Step 16: Controller -> UI: print msg: "Take Receipt"
    draw_message(ax, x_ctrl - bar_w/2, x_ui + bar_w/2, y16, 'print msg: "Take Receipt"', is_return=False)
    
    # Step 17: UI -> User: get receipt
    draw_message(ax, x_ui - bar_w/2, x_actor + bar_w/2, y17, "get receipt", is_return=False)

    # Save diagram
    output_filename = "sequence_diagram_all_modules.png"
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
    render_sequence_diagram()

