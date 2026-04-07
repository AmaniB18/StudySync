from app import create_app
from extensions import db
from models.course import Course

app = create_app()

with app.app_context():
    c1 = Course(course_code="CS101", course_name="Intro to Web", semester="1")
    c2 = Course(course_code="CS102", course_name="Databases", semester="1")
    c3 = Course(course_code="CS103", course_name="Networks", semester="2")

    db.session.add_all([c1, c2, c3])
    db.session.commit()

print("done seeding courses")