from flask import Flask
from flask_restful import Api
from config import Config
from extensions import db, migrate
from flask_migrate import Migrate
from flask_cors import CORS
from flask_jwt_extended import JWTManager

# import resources
from resources.course import CourseListResource, CourseResource
from resources.student import StudentListResource, StudentResource
from resources.study_group import StudyGroupListResource, StudyGroupResource
from resources.availability import AvailabilityListResource, AvailabilityResource
from resources.group_member import GroupMemberListResource, GroupMemberResource
from resources.message import MessageListResource, MessageResource
from resources.auth import LoginResource

# import models (VERY IMPORTANT for migrations)
from models.student import Student
from models.course import Course
from models.study_group import StudyGroup
from models.group_member import GroupMember
from models.availability import Availability
from models.message import Message

def seed_demo_data():
    if Course.query.first():
        return

    courses = [
        Course(name="CS101 - Intro to Web"),
        Course(name="CS102 - Databases"),
        Course(name="CS103 - Algorithms"),
        Course(name="CS104 - Operating Systems"),
        Course(name="CS105 - Networks"),
        Course(name="CS106 - Software Engineering"),
        Course(name="CS107 - AI Basics"),
        Course(name="CS108 - Data Structures")
    ]

    db.session.add_all(courses)
    db.session.commit()

    groups = [
        # CS101
        StudyGroup(name="Web Group A", course_id=courses[0].id, capacity=5),
        StudyGroup(name="Web Group B", course_id=courses[0].id, capacity=6),

        # CS102
        StudyGroup(name="DB Group A", course_id=courses[1].id, capacity=4),
        StudyGroup(name="DB Group B", course_id=courses[1].id, capacity=5),

        # CS103
        StudyGroup(name="Algo Group A", course_id=courses[2].id, capacity=6),

        # CS104
        StudyGroup(name="OS Group A", course_id=courses[3].id, capacity=5),
        StudyGroup(name="OS Group B", course_id=courses[3].id, capacity=5),

        # CS105
        StudyGroup(name="Networks Group A", course_id=courses[4].id, capacity=4),

        # CS106
        StudyGroup(name="SE Group A", course_id=courses[5].id, capacity=6),
        StudyGroup(name="SE Group B", course_id=courses[5].id, capacity=5),

        # CS107
        StudyGroup(name="AI Group A", course_id=courses[6].id, capacity=5),

        # CS108
        StudyGroup(name="DS Group A", course_id=courses[7].id, capacity=6),
        StudyGroup(name="DS Group B", course_id=courses[7].id, capacity=5),
    ]

    db.session.add_all(groups)
    db.session.commit()

    print("demo data seeded: 8 courses + groups ready")

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    app.config["JWT_SECRET_KEY"] = "super-secret-key"
    app.config["JWT_TOKEN_LOCATION"] = ["headers"]
    app.config["JWT_ALGORITHM"] = "HS256"

    jwt = JWTManager(app)

    CORS(app)

    db.init_app(app)
    migrate.init_app(app, db)

    api = Api(app)

    from resources.dashboard import dashboard_bp
    app.register_blueprint(dashboard_bp)

    from flask import send_from_directory

    @app.route("/")
    def home():
        return send_from_directory("frontend", "login.html")

    @app.route("/<path:path>")
    def static_files(path):
        return send_from_directory("frontend", path)

    # ------ ROUTES ------
    # COURSE
    api.add_resource(CourseListResource, "/courses")
    api.add_resource(CourseResource, "/courses/<int:cid>")

    # STUDENT
    api.add_resource(StudentListResource, "/students")
    api.add_resource(StudentResource, "/students/<int:sid>")

    api.add_resource(LoginResource, "/login")

    # STUDY GROUP
    api.add_resource(StudyGroupListResource, "/groups")
    api.add_resource(StudyGroupResource, "/groups/<int:gid>")

    # AVAILABILITY
    api.add_resource(AvailabilityListResource, "/availability")
    api.add_resource(AvailabilityResource, "/availability/<int:aid>")

    # GROUP MEMBER
    api.add_resource(GroupMemberListResource, "/group-members")
    api.add_resource(GroupMemberResource, "/group-members/<int:gm_id>")

    # MESSAGE
    api.add_resource(MessageListResource, "/messages")
    api.add_resource(MessageResource, "/messages/<int:mid>")

    with app.app_context():
        seed_demo_data()

    return app


app = create_app()

if __name__ == "__main__":
    app.run(debug=True)