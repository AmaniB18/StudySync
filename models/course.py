from extensions import db

class Course(db.Model):
    __tablename__ = "courses"

    cid = db.Column(db.Integer, primary_key=True, autoincrement=True)
    course_code = db.Column(db.String(20), unique=True, nullable=False)
    course_name = db.Column(db.String(100), nullable=False)
    semester = db.Column(db.String(50))
    
  
    study_groups = db.relationship(
        "StudyGroup",
        backref="course",
        lazy=True,
        cascade="all, delete-orphan"
    )