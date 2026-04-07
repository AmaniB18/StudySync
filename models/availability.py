from extensions import db


class Availability(db.Model):
    __tablename__ = "availability"

    aid = db.Column(db.Integer, primary_key=True, autoincrement=True)
    sid = db.Column(db.Integer, db.ForeignKey("students.sid", ondelete="CASCADE"), nullable=False)

    day_of_week = db.Column(
        db.String(10),
        db.CheckConstraint("day_of_week IN ('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday')"),
        nullable=False
    )
    start_time = db.Column(db.Time, nullable=False)
    end_time = db.Column(db.Time, nullable=False)

    def __repr__(self):
        return f"<Availability student={self.sid} {self.day_of_week} {self.start_time}-{self.end_time}>"