from pydantic import BaseModel
from typing import List, Dict, Optional
from datetime import datetime

class CaptureMetadata(BaseModel):
    """Metadata for a capture job."""
    project_name: str
    area_id: str
    scan_mode: str  # live-camera, video-import, image-set
    guided_pattern: str  # orbit, walk-around, top-down
    frame_count: int
    frame_duration: int
    operator_id: str
    equipment_tags: List[str]
    modular_io_context: Optional[Dict] = None
    historian_context: Optional[Dict] = None
    created_at: datetime

class ReconstructionJob(BaseModel):
    """State of a reconstruction job."""
    job_id: str
    capture_id: str
    status: str  # queued, processing, ready, failed
    progress: int  # 0-100
    phase: str  # frames, sfm, depth, mesh, texture, splat
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    error_message: Optional[str] = None

class SceneOutput(BaseModel):
    """Final reconstructed scene output."""
    scene_id: str
    job_id: str
    mesh_path: str  # PLY or OBJ
    texture_path: str  # PNG/JPG atlas
    gltf_path: Optional[str] = None
    usdz_path: Optional[str] = None
    splat_path: Optional[str] = None
    metadata: Optional[Dict] = None
    historian_data: Optional[List[Dict]] = None
    tags: List[str] = []
    created_at: datetime
