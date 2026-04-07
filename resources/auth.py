from flask_restful import Resource
from flask import request
import jwt
import datetime

from models.student import Student
from utils.auth import check_password

SECRET_KEY = "SECRET_KEY"


class LoginResource(Resource):
    def post(self):
        data = request.get_json()

        email = data.get("email")
        password = data.get("password")

        student = Student.query.filter_by(email=email).first()

        if not student:
            return {"message": "invalid email"}, 401

        if not check_password(password, student.password_hash):
            return {"message": "invalid password"}, 401

        token = jwt.encode({
            "user_id": student.sid,
            "exp": datetime.datetime.utcnow() + datetime.timedelta(hours=2)
        }, SECRET_KEY, algorithm="HS256")

        return {
            "token": token,
            "user": {
                "sid": student.sid,
                "full_name": student.full_name
            }
        }, 200