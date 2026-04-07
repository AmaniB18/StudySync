from flask import Blueprint, request
import jwt

from models.student import Student

dashboard_bp = Blueprint("dashboard", __name__)

SECRET_KEY = "SECRET_KEY"

@dashboard_bp.route("/dashboard", methods=["GET"])
def dashboard():
    auth_header = request.headers.get("Authorization")

    if not auth_header:
        return {"message": "Missing token"}, 401

    try:
        token = auth_header.split(" ")[1]
        decoded = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
        student_id = decoded["user_id"]

    except Exception:
        return {"message": "Invalid token"}, 401

    student = Student.query.get(student_id)

    if not student:
        return {"message": "User not found"}, 404

    active_groups = len(student.group_memberships)
    my_courses = len(student.courses)

    upcoming_sessions = [
        {"title": "Study session", "date": "2026-04-08 16:00"}
    ]

    return {
        "active_groups": active_groups,
        "my_courses": my_courses,
        "upcoming_sessions": len(upcoming_sessions),
        "total_study_hours": 12,
        "sessions": upcoming_sessions
    }