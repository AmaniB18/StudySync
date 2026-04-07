from flask import Blueprint, request
import jwt
from datetime import datetime

from models.student import Student
from models.group_member import GroupMember
from models.study_group import StudyGroup
from models.course import Course

dashboard_bp = Blueprint("dashboard", __name__)

SECRET_KEY = "SECRET_KEY"


def _decode_token(auth_header):
    if not auth_header:
        return None, ({"message": "Missing token"}, 401)
    try:
        token = auth_header.split(" ")[1]
        decoded = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
        return decoded["user_id"], None
    except Exception:
        return None, ({"message": "Invalid token"}, 401)


@dashboard_bp.route("/dashboard", methods=["GET"])
def dashboard():
    student_id, err = _decode_token(request.headers.get("Authorization"))
    if err:
        return err

    student = Student.query.get(student_id)
    if not student:
        return {"message": "User not found"}, 404

    memberships = student.group_memberships
    active_groups = len(memberships)

    # Unique courses
    course_ids = set()

    for m in memberships:
        group = StudyGroup.query.get(m.gid)
        if not group:
            continue
        course_ids.add(group.cid)

    return {
        "active_groups": active_groups,
        "my_courses": len(course_ids),
        "upcoming_sessions": 0,   # removed next_meeting logic
        "total_study_hours": active_groups * 2,
        "sessions": []            # no sessions for now
    }


@dashboard_bp.route("/my-groups", methods=["GET"])
def my_groups():
    student_id, err = _decode_token(request.headers.get("Authorization"))
    if err:
        return err

    student = Student.query.get(student_id)
    if not student:
        return {"message": "User not found"}, 404

    result = []
    for m in student.group_memberships:
        group = StudyGroup.query.get(m.gid)
        if not group:
            continue
        course = Course.query.get(group.cid)

        result.append({
            "gid": group.gid,
            "group_name": group.group_name,
            "course_code": course.course_code if course else "",
            "course_name": course.course_name if course else "",
            "member_count": GroupMember.query.filter_by(gid=group.gid).count(),
            "max_members": group.max_members,
            "meeting_mode": group.meeting_mode,
            "location": group.location,
            "role": m.role,
            "unread": len(group.messages)
        })

    return result


@dashboard_bp.route("/my-availability", methods=["GET"])
def my_availability():
    student_id, err = _decode_token(request.headers.get("Authorization"))
    if err:
        return err

    from models.availability import Availability
    avail = Availability.query.filter_by(sid=student_id).all()

    return [
        {
            "aid": a.aid,
            "sid": a.sid,
            "day_of_week": a.day_of_week,
            "start_time": a.start_time.strftime("%H:%M"),
            "end_time": a.end_time.strftime("%H:%M")
        }
        for a in avail
    ]