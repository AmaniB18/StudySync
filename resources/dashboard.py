from flask import Blueprint
from flask_jwt_extended import jwt_required, get_jwt_identity
from models.student import Student

dashboard_bp = Blueprint("dashboard", __name__)

@dashboard_bp.route("/dashboard", methods=["GET"])
@jwt_required()
def dashboard():
    student_id = get_jwt_identity()

    student = Student.query.get(student_id)

    active_groups = len(student.group_memberships)
    my_courses = len(student.courses)

    # fake placeholder for now (you'll connect real table later)
    upcoming_sessions = [
        {"title": "Study session", "date": "2026-04-08 16:00"}
    ]

    total_study_hours = 12  # later calculate from sessions table

    return {
        "active_groups": active_groups,
        "my_courses": my_courses,
        "upcoming_sessions": len(upcoming_sessions),
        "total_study_hours": total_study_hours,
        "sessions": upcoming_sessions
    }