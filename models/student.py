from extensions import db
from datetime import datetime


class Student(db.Model):
    __tablename__ = "students"

    sid = db.Column(db.Integer, primary_key=True, autoincrement=True)
    full_name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(100), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    major = db.Column(db.String(100), nullable=True)
    year_level = db.Column(db.Integer, db.CheckConstraint("year_level >= 1 AND year_level <= 6"), nullable=True)
    registered_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    availabilities = db.relationship("Availability", backref="student", lazy=True, cascade="all, delete-orphan")
    group_memberships = db.relationship("GroupMember", backref="student", lazy=True, cascade="all, delete-orphan")
    sent_messages = db.relationship("Message", backref="sender", lazy=True, cascade="all, delete-orphan")
   
    def __repr__(self):
        return f"<Student {self.sid} - {self.email}>"