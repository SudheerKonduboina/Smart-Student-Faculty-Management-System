"""
Smart Student & Faculty Management System - QR Attendance Microservice
FastAPI service responsible for generating dynamic, cryptographically signed QR code tokens and verifying them.
"""

import os
import io
import time
import base64
from typing import Optional
from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
import qrcode
import jwt

app = FastAPI(
    title="SMS QR Attendance Service",
    description="Microservice for dynamic QR token generation and validation",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

JWT_SECRET = os.getenv("QR_JWT_SECRET", "SmartSMS_QR_SecretKey_2026_Secure_JWT_Key_987654321")
JWT_ALGORITHM = "HS256"

class QrGenerateRequest(BaseModel):
    sessionId: int = Field(..., description="Attendance Session ID")
    subjectId: int = Field(..., description="Subject ID")
    facultyId: int = Field(..., description="Faculty ID")
    className: Optional[str] = Field("CS-A", description="Class / Section Name")
    expirySeconds: Optional[int] = Field(60, description="Token validity duration in seconds")
    expiresInSeconds: Optional[int] = Field(None, description="Alternative field for expiry in seconds")

class QrGenerateResponse(BaseModel):
    token: str
    qrImageBase64: str
    expiresAt: int
    sessionId: int

class QrValidateRequest(BaseModel):
    token: str

class QrValidateResponse(BaseModel):
    valid: bool
    sessionId: int
    subjectId: int
    facultyId: int
    className: str
    issuedAt: int
    expiresAt: int

@app.get("/health")
def health_check():
    return {"status": "UP", "service": "qr-attendance-service"}

@app.post("/api/qr/generate", response_model=QrGenerateResponse)
@app.post("/qr/generate", response_model=QrGenerateResponse)
def generate_qr(req: QrGenerateRequest):
    now = int(time.time())
    duration = req.expiresInSeconds if req.expiresInSeconds is not None else (req.expirySeconds or 60)
    expires_at = now + duration
    
    payload = {
        "sessionId": req.sessionId,
        "subjectId": req.subjectId,
        "facultyId": req.facultyId,
        "className": req.className or "CS-A",
        "iat": now,
        "exp": expires_at
    }
    
    token = jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)
    
    # Generate QR Code image
    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_M,
        box_size=10,
        border=4,
    )
    qr.add_data(token)
    qr.make(fit=True)
    
    img = qr.make_image(fill_color="#1E3A8A", back_color="#FFFFFF")
    buffered = io.BytesIO()
    img.save(buffered, format="PNG")
    img_str = base64.b64encode(buffered.getvalue()).decode()
    
    return QrGenerateResponse(
        token=token,
        qrImageBase64=f"data:image/png;base64,{img_str}",
        expiresAt=expires_at,
        sessionId=req.sessionId
    )

@app.post("/api/qr/validate", response_model=QrValidateResponse)
@app.post("/qr/validate", response_model=QrValidateResponse)
def validate_qr(req: QrValidateRequest):
    try:
        payload = jwt.decode(req.token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        return QrValidateResponse(
            valid=True,
            sessionId=payload["sessionId"],
            subjectId=payload["subjectId"],
            facultyId=payload["facultyId"],
            className=payload["className"],
            issuedAt=payload["iat"],
            expiresAt=payload["exp"]
        )
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="QR code token has expired. Please refresh the QR code."
        )
    except jwt.InvalidTokenError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid QR code token."
        )

@app.get("/api/qr/validate/{token}")
@app.get("/qr/validate/{token}")
def validate_qr_get(token: str):
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        return {
            "valid": True,
            "sessionId": payload["sessionId"],
            "subjectId": payload["subjectId"],
            "facultyId": payload["facultyId"],
            "className": payload["className"],
            "issuedAt": payload["iat"],
            "expiresAt": payload["exp"]
        }
    except jwt.ExpiredSignatureError:
        return {"valid": False, "detail": "QR code token has expired"}
    except jwt.InvalidTokenError:
        return {"valid": False, "detail": "Invalid QR code token"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
