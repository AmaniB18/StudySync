from extensions import db
from datetime import datetime


class GroupMember(db.Model):
    __tablename__ = "group_members"

    mid = db.Column(db.Integer, primary_key=True, autoincrement=True)
    gid = db.Column(db.Integer, db.ForeignKey("study_groups.gid", ondelete="CASCADE"), nullable=False)
    sid = db.Column(db.Integer, db.ForeignKey("students.sid", ondelete="CASCADE"), nullable=False)

    role = db.Column(db.String(50), db.CheckConstraint("role IN ('admin', 'member')"), default="member", nullable=False)
    status = db.Column(db.String(50), db.CheckConstraint("status IN ('active', 'pending', 'left')"), default="active", nullable=False)
    joined_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)

    # Unique constraint: a student can only be in a group once
    __table_args__ = (db.UniqueConstraint("gid", "sid", name="uq_group_member"),)

    def __repr__(self):
        return f"<GroupMember student={self.sid} group={self.gid} role={self.role}>"