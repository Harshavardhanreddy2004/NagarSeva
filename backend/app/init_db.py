"""Database initialization and seeding."""
from sqlalchemy.orm import Session
from app.database import Base, engine
from app.models.user import User
from app.models.department import Department
from app.models.issue_type import IssueType
from app.models.issue_type import RiskLevel


def init_db():
    """Initialize database tables and seed initial data."""
    # Create all tables
    Base.metadata.create_all(bind=engine)
    print("✓ Database tables created")


def seed_departments_and_issues(db: Session):
    """Seed basic departments and issue types."""
    # Check if data already seeded
    existing_dept = db.query(Department).filter_by(name="Road").first()
    if existing_dept:
        print("✓ Database already seeded, skipping...")
        return

    # Create departments
    departments_data = [
        {
            "name": "Road",
            "description": "Roads, potholes, street damage",
            "escalation_level": 1,
        },
        {
            "name": "Electricity",
            "description": "Street lights, power lines, electricity issues",
            "escalation_level": 2,
        },
        {
            "name": "Sanitation",
            "description": "Garbage, waste, cleanliness issues",
            "escalation_level": 1,
        },
        {
            "name": "Drainage",
            "description": "Water logging, drainage, sewage issues",
            "escalation_level": 2,
        },
        {
            "name": "Police",
            "description": "Safety, crime, security issues",
            "escalation_level": 3,
        },
    ]

    departments = {}
    for dept_data in departments_data:
        dept = Department(**dept_data)
        db.add(dept)
        db.flush()
        departments[dept.name] = dept

    # Create issue types linked to departments
    issue_types_data = [
        # Road issues
        {
            "name": "Pothole",
            "description": "Holes in the road surface",
            "department_name": "Road",
            "risk_level": RiskLevel.MEDIUM,
        },
        {
            "name": "Road Damage",
            "description": "Cracks, broken asphalt, damaged roads",
            "department_name": "Road",
            "risk_level": RiskLevel.HIGH,
        },
        {
            "name": "Footpath Blocked",
            "description": "Encroachment or blockage of footpaths",
            "department_name": "Road",
            "risk_level": RiskLevel.LOW,
        },
        # Electricity issues
        {
            "name": "Street Light Not Working",
            "description": "Broken or non-functional street lights",
            "department_name": "Electricity",
            "risk_level": RiskLevel.MEDIUM,
        },
        {
            "name": "Power Line Down",
            "description": "Fallen or damaged power lines",
            "department_name": "Electricity",
            "risk_level": RiskLevel.CRITICAL,
        },
        # Sanitation issues
        {
            "name": "Garbage Dumping",
            "description": "Illegal waste/garbage dumping",
            "department_name": "Sanitation",
            "risk_level": RiskLevel.LOW,
        },
        {
            "name": "Dirty Street",
            "description": "Uncleaned streets and public spaces",
            "department_name": "Sanitation",
            "risk_level": RiskLevel.LOW,
        },
        # Drainage issues
        {
            "name": "Water Logging",
            "description": "Water accumulation causing flooding",
            "department_name": "Drainage",
            "risk_level": RiskLevel.HIGH,
        },
        {
            "name": "Clogged Drain",
            "description": "Blocked drainage system",
            "department_name": "Drainage",
            "risk_level": RiskLevel.MEDIUM,
        },
        # Police/Safety issues
        {
            "name": "Dark Street",
            "description": "Poorly lit streets creating safety concerns",
            "department_name": "Police",
            "risk_level": RiskLevel.MEDIUM,
        },
        {
            "name": "Suspicious Activity",
            "description": "Unusual or suspicious activity reported",
            "department_name": "Police",
            "risk_level": RiskLevel.HIGH,
        },
    ]

    for issue_data in issue_types_data:
        dept_name = issue_data.pop("department_name")
        issue_data["department_id"] = departments[dept_name].id
        issue_type = IssueType(**issue_data)
        db.add(issue_type)

    db.commit()
    print("✓ Departments seeded: Road, Electricity, Sanitation, Drainage, Police")
    print("✓ Issue types seeded (11 total)")


def init_db_with_seed():
    """Initialize DB tables and seed data in one call."""
    from app.database import SessionLocal

    init_db()
    db = SessionLocal()
    try:
        seed_departments_and_issues(db)
    finally:
        db.close()
