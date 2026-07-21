"""Complaint service for business logic."""
from datetime import datetime
from typing import Optional, List, Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.models import Complaint, ComplaintHistory, ComplaintImage, IssueType, Department
from app.models.complaint import ComplaintStatus, Priority
from app.models.issue_type import RiskLevel
from app.schemas.complaint import ComplaintResponse, DashboardStats


class ComplaintService:
    """Service for complaint management."""

    @staticmethod
    def create_complaint(
        db: Session,
        user_id: int,
        location_lat: float,
        location_lon: float,
        location_address: Optional[str],
        description: str,
        image_path: Optional[str] = None,
        detected_issue: Optional[str] = None,
        risk_level: Optional[str] = None,
    ) -> Complaint:
        """Create a new complaint."""
        # Determine priority based on risk level
        priority = Priority.MEDIUM
        if risk_level:
            if risk_level.lower() == "critical":
                priority = Priority.CRITICAL
            elif risk_level.lower() == "high":
                priority = Priority.HIGH
            elif risk_level.lower() == "low":
                priority = Priority.LOW

        # Create complaint
        complaint = Complaint(
            user_id=user_id,
            location_lat=location_lat,
            location_lon=location_lon,
            location_address=location_address,
            description=description,
            priority=priority,
            status=ComplaintStatus.SUBMITTED,
        )

        db.add(complaint)
        db.flush()

        # Add image if provided
        if image_path:
            image = ComplaintImage(
                complaint_id=complaint.id,
                image_path=image_path,
                detected_issues=detected_issue,
                risk_level=risk_level,
                confidence_score=70,  # Default confidence
            )
            db.add(image)

        # Record history
        history = ComplaintHistory(
            complaint_id=complaint.id,
            old_status=None,
            new_status=ComplaintStatus.SUBMITTED,
            change_reason="Initial submission",
        )
        db.add(history)

        db.commit()
        db.refresh(complaint)
        return complaint

    @staticmethod
    def get_complaint(db: Session, complaint_id: int) -> Optional[Complaint]:
        """Get complaint by ID."""
        return db.query(Complaint).filter(Complaint.id == complaint_id).first()

    @staticmethod
    def list_complaints(
        db: Session,
        user_id: Optional[int] = None,
        status: Optional[str] = None,
        priority: Optional[str] = None,
        limit: int = 50,
        offset: int = 0,
    ) -> tuple:
        """List complaints with filters."""
        query = db.query(Complaint)

        if user_id is not None:
            query = query.filter(Complaint.user_id == user_id)

        if status:
            try:
                status_enum = ComplaintStatus(status)
                query = query.filter(Complaint.status == status_enum)
            except ValueError:
                pass

        if priority:
            try:
                priority_enum = Priority(priority)
                query = query.filter(Complaint.priority == priority_enum)
            except ValueError:
                pass

        total = query.count()
        complaints = query.order_by(Complaint.created_at.desc()).offset(offset).limit(limit).all()

        return complaints, total

    @staticmethod
    def update_complaint_status(
        db: Session,
        complaint_id: int,
        new_status: str,
        change_reason: Optional[str] = None,
    ) -> Complaint:
        """Update complaint status."""
        complaint = db.query(Complaint).filter(Complaint.id == complaint_id).first()
        
        if not complaint:
            raise ValueError(f"Complaint {complaint_id} not found")

        old_status = complaint.status

        # Update status
        complaint.status = new_status
        
        if new_status == ComplaintStatus.RESOLVED:
            complaint.resolved_at = datetime.utcnow()
        elif new_status == ComplaintStatus.ASSIGNED:
            complaint.assigned_at = datetime.utcnow()

        # Record history
        history = ComplaintHistory(
            complaint_id=complaint_id,
            old_status=str(old_status),
            new_status=new_status,
            change_reason=change_reason,
        )
        db.add(history)
        db.commit()
        db.refresh(complaint)

        return complaint

    @staticmethod
    def get_dashboard_stats(db: Session) -> DashboardStats:
        """Get dashboard statistics."""
        total = db.query(func.count(Complaint.id)).scalar() or 0
        resolved = (
            db.query(func.count(Complaint.id))
            .filter(Complaint.status == ComplaintStatus.RESOLVED)
            .scalar()
            or 0
        )
        pending = (
            db.query(func.count(Complaint.id))
            .filter(Complaint.status == ComplaintStatus.SUBMITTED)
            .scalar()
            or 0
        )
        in_progress = (
            db.query(func.count(Complaint.id))
            .filter(Complaint.status == ComplaintStatus.IN_PROGRESS)
            .scalar()
            or 0
        )

        # Calculate average resolution time
        resolved_complaints = (
            db.query(Complaint)
            .filter(Complaint.status == ComplaintStatus.RESOLVED, Complaint.resolved_at.isnot(None))
            .all()
        )
        
        avg_resolution_time = None
        if resolved_complaints:
            total_hours = 0
            for complaint in resolved_complaints:
                if complaint.resolved_at and complaint.created_at:
                    delta = complaint.resolved_at - complaint.created_at
                    total_hours += delta.total_seconds() / 3600
            avg_resolution_time = total_hours / len(resolved_complaints)

        # Count by priority
        by_priority = {}
        for priority in Priority:
            count = (
                db.query(func.count(Complaint.id))
                .filter(Complaint.priority == priority)
                .scalar()
                or 0
            )
            by_priority[priority.value] = count

        # Count by status
        by_status = {}
        for status in ComplaintStatus:
            count = (
                db.query(func.count(Complaint.id))
                .filter(Complaint.status == status)
                .scalar()
                or 0
            )
            by_status[status.value] = count

        return DashboardStats(
            total_complaints=total,
            resolved_count=resolved,
            pending_count=pending,
            in_progress_count=in_progress,
            avg_resolution_time_hours=avg_resolution_time,
            by_priority=by_priority,
            by_status=by_status,
        )

    @staticmethod
    def get_heatmap_data(db: Session, grid_size: float = 0.01) -> List[Dict[str, Any]]:
        """Generate heatmap data by location grid."""
        complaints = db.query(Complaint).all()
        
        # Group by grid
        grid: Dict[str, Dict[str, Any]] = {}
        
        for complaint in complaints:
            # Round to grid cell
            grid_lat = round(complaint.location_lat / grid_size) * grid_size
            grid_lon = round(complaint.location_lon / grid_size) * grid_size
            grid_id = f"{grid_lat},{grid_lon}"
            
            if grid_id not in grid:
                grid[grid_id] = {
                    "grid_id": grid_id,
                    "lat": grid_lat,
                    "lon": grid_lon,
                    "complaint_count": 0,
                    "issues": set(),
                }
            
            grid[grid_id]["complaint_count"] += 1
            if complaint.issue_type and complaint.issue_type.name:
                grid[grid_id]["issues"].add(complaint.issue_type.name)

        # Convert to list with severity
        heatmap_data = []
        for grid_point in grid.values():
            count = grid_point["complaint_count"]
            if count >= 5:
                severity = "high"
            elif count >= 3:
                severity = "medium"
            else:
                severity = "low"
            
            heatmap_data.append({
                "grid_id": grid_point["grid_id"],
                "lat": grid_point["lat"],
                "lon": grid_point["lon"],
                "complaint_count": count,
                "severity": severity,
                "issues": list(grid_point["issues"]),
            })

        return heatmap_data
