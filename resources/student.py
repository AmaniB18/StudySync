from flask import request
from flask_restful import Resource
from extensions import db
from models.student import Student
from utils.auth import hash_password


class StudentListResource(Resource):

    # CREATE
    def post(self):
        data = request.get_json()

        # Validate required fields
        if not data.get("email") or not data.get("password") or not data.get("full_name"):
            return {"message": "full_name, email, and password are required"}, 400

        # Check if email already exists
        if Student.query.filter_by(email=data["email"]).first():
            return {"message": "Email already registered"}, 409

        student = Student(
            full_name=data.get("full_name"),
            email=data.get("email"),
            password_hash=hash_password(data.get("password")),  # hash via utils.py
            major=data.get("major"),
            year_level=data.get("year_level")
        )

        db.session.add(student)
        db.session.commit()

        return {"message": "Student created", "sid": student.sid}, 201

    # READ ALL
    def get(self):
        students = Student.query.all()

        return [
            {
                "sid": s.sid,
                "full_name": s.full_name,
                "email": s.email,
                "major": s.major,
                "year_level": s.year_level,
                "registered_at": s.registered_at.isoformat() if s.registered_at else None
            }
            for s in students
        ], 200


class StudentResource(Resource):

    # READ ONE
    def get(self, sid):
        s = Student.query.get(sid)

        if not s:
            return {"message": "Student not found"}, 404

        return {
            "sid": s.sid,
            "full_name": s.full_name,
            "email": s.email,
            "major": s.major,
            "year_level": s.year_level,
            "registered_at": s.registered_at.isoformat() if s.registered_at else None
        }, 200

    # UPDATE
    def put(self, sid):
        data = request.get_json()
        s = Student.query.get(sid)

        if not s:
            return {"message": "Student not found"}, 404

        s.full_name = data.get("full_name", s.full_name)
        s.email = data.get("email", s.email)
        s.major = data.get("major", s.major)
        s.year_level = data.get("year_level", s.year_level)

        # Re-hash password only if a new one is provided
        if data.get("password"):
            s.password_hash = hash_password(data.get("password"))

        db.session.commit()

        return {"message": "Student updated"}, 200

    # DELETE
    def delete(self, sid):
        s = Student.query.get(sid)

        if not s:
            return {"message": "Student not found"}, 404

        db.session.delete(s)
        db.session.commit()

        return {"message": "Student deleted"}, 200