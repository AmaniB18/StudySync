from extensions import db
from datetime import datetime


class Message(db.Model):
    __tablename__ = "messages"

    msg_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    gid = db.Column(db.Integer, db.ForeignKey("study_groups.gid", ondelete="CASCADE"), nullable=False)
    sender_id = db.Column(db.Integer, db.ForeignKey("students.sid", ondelete="CASCADE"), nullable=False)

    message_text = db.Column(db.Text, nullable=False)
    sent_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)

    def __repr__(self):
        return f"<Message {self.msg_id} from student={self.sender_id} in group={self.gid}>"