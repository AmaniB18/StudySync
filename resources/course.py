from flask import request
from flask_restful import Resource
from extensions import db
from models.course import Course
from models.study_group import StudyGroup
from models.group_member import GroupMember


class CourseListResource(Resource):

    def get(self):
        courses = Course.query.all()
        return [_serialize_course(c) for c in courses], 200

    def post(self):
        data = request.get_json()
        course = Course(
            course_code=data['course_code'],
            course_name=data['course_name'],
            semester=data.get('semester')
        )
        db.session.add(course)
        db.session.commit()
        return {'message': 'Course created', 'cid': course.cid}, 201


class CourseResource(Resource):

    def get(self, cid):
        c = Course.query.get(cid)
        if not c:
            return {'message': 'Not found'}, 404
        return _serialize_course(c), 200

    def put(self, cid):
        c = Course.query.get(cid)
        if not c:
            return {'message': 'Not found'}, 404
        data = request.get_json()
        c.course_code = data.get('course_code', c.course_code)
        c.course_name = data.get('course_name', c.course_name)
        c.semester = data.get('semester', c.semester)
        db.session.commit()
        return {'message': 'Updated'}, 200

    def delete(self, cid):
        c = Course.query.get(cid)
        if not c:
            return {'message': 'Not found'}, 404
        db.session.delete(c)
        db.session.commit()
        return {'message': 'Deleted'}, 200


def _serialize_course(c):
    groups = StudyGroup.query.filter_by(cid=c.cid).all()
    # Count unique students enrolled via group memberships
    student_ids = set()
    for g in groups:
        for m in GroupMember.query.filter_by(gid=g.gid).all():
            student_ids.add(m.sid)
    return {
        'cid': c.cid,
        'course_code': c.course_code,
        'course_name': c.course_name,
        'semester': c.semester,
        'group_count': len(groups),
        'student_count': len(student_ids)
    }
