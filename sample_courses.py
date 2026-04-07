from app import create_app
from extensions import db
from models.course import Course
from models.study_group import StudyGroup

app = create_app()

with app.app_context():   # 🔥 REQUIRED WRAPPER

    c1 = Course.query.filter_by(course_code="CS101").first()
    c2 = Course.query.filter_by(course_code="CS102").first()
    c3 = Course.query.filter_by(course_code="CS103").first()

    if not all([c1, c2, c3]):
        print("some courses missing in DB")
        exit()

    g1 = StudyGroup(
        cid=c1.cid,
        group_name="Web Final Prep",
        description="frontend + backend grind",
        max_members=10,
        meeting_mode="online",
        location="Zoom"
    )

    g2 = StudyGroup(
        cid=c1.cid,
        group_name="JS Legends",
        description="js + projects",
        max_members=8,
        meeting_mode="hybrid",
        location="Campus + Zoom"
    )

    g3 = StudyGroup(
        cid=c2.cid,
        group_name="Database Study Group",
        description="sql + design",
        max_members=6,
        meeting_mode="in-person",
        location="Library"
    )

    g4 = StudyGroup(
        cid=c3.cid,
        group_name="Study Networks",
        description="Network protocols",
        max_members=15,
        meeting_mode="in-person",
        location="Lab"
    )

    db.session.add_all([g1, g2, g3, g4])
    db.session.commit()

print("done")