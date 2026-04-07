from extensions import db
from datetime import datetime


class StudyGroup(db.Model):
    __tablename__ = "study_groups"

    gid = db.Column(db.Integer, primary_key=True, autoincrement=True)
    cid = db.Column(db.Integer, db.ForeignKey("courses.cid", ondelete="CASCADE"), nullable=False)

    group_name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.String(255), nullable=True)
    max_members = db.Column(db.Integer, db.CheckConstraint("max_members > 0"), nullable=True)
    meeting_mode = db.Column(db.String(50), db.CheckConstraint("meeting_mode IN ('online', 'in-person', 'hybrid')"), nullable=True)
    location = db.Column(db.String(100), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    members = db.relationship("GroupMember", backref="study_group", lazy=True, cascade="all, delete-orphan")
    messages = db.relationship("Message", backref="study_group", lazy=True, cascade="all, delete-orphan")

    def __repr__(self):
        return f"<StudyGroup {self.gid} - {self.group_name}>"
