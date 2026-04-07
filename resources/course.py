from flask import request
from extensions import db
from flask_restful import Resource
from models.course import Course
from utils.auth import token_required

class CourseListResource(Resource):

    # CREATE
    def post(self):
        data = request.get_json()

        course = Course(
            course_code=data.get("course_code"),
            course_name=data.get("course_name"),
            semester=data.get("semester")
        )

        db.session.add(course)
        db.session.commit()

        return {
            "message": "Course created successfully"
        }, 201

    # READ ALL (USER-SPECIFIC)
    @token_required
    def get(self):
        courses = Course.query.all()

        return [
            {
                "cid": c.cid,
                "course_code": c.course_code,
                "course_name": c.course_name,
                "semester": c.semester,

               
                "group_count": len(c.study_groups),

              
                "student_count": sum(len(g.members) for g in c.study_groups)
            }
            for c in courses
        ], 200



class CourseResource(Resource):
    # READ ONE
    def get(self, cid):
        course = Course.query.get(cid)

        if not course:
            return {"message": "Course not found"}, 404

        return {
            "cid": course.cid,
            "course_code": course.course_code,
            "course_name": course.course_name,
            "semester": course.semester
        }, 200

    # UPDATE
    def put(self, cid):
        data = request.get_json()
        course = Course.query.get(cid)

        if not course:
            return {"message": "Course not found"}, 404

        course.course_code = data.get("course_code", course.course_code)
        course.course_name = data.get("course_name", course.course_name)
        course.semester = data.get("semester", course.semester)

        db.session.commit()

        return {
            "message": "Course updated successfully"
        }, 200

    # DELETE
    def delete(self, cid):
        course = Course.query.get(cid)

        if not course:
            return {"message": "Course not found"}, 404

        db.session.delete(course)
        db.session.commit()

        return {
            "message": "Course deleted successfully"
        }, 200

