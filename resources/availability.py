from flask import request
from flask_restful import Resource
from extensions import db
from models.availability import Availability
from datetime import datetime


class AvailabilityListResource(Resource):

    # CREATE
    def post(self):
        data = request.get_json()

        try:
            availability = Availability(
                sid=data.get("sid"),
                day_of_week=data.get("day_of_week"),
                start_time=datetime.strptime(data.get("start_time"), "%H:%M").time(),
                end_time=datetime.strptime(data.get("end_time"), "%H:%M").time()
            )

            db.session.add(availability)
            db.session.commit()

            return {"message": "Availability created successfully"}, 201

        except Exception as e:
            return {"message": "Error creating availability", "error": str(e)}, 400


    # READ ALL
    def get(self):
        availability = Availability.query.all()

        return [
            {
                "aid": a.aid,
                "sid": a.sid,
                "day_of_week": a.day_of_week,
                "start_time": a.start_time.strftime("%H:%M"),
                "end_time": a.end_time.strftime("%H:%M")
            }
            for a in availability
        ], 200


class AvailabilityResource(Resource):

    # READ ONE
    def get(self, aid):
        availability = Availability.query.get(aid)

        if not availability:
            return {"message": "Availability not found"}, 404

        return {
            "aid": availability.aid,
            "sid": availability.sid,
            "day_of_week": availability.day_of_week,
            "start_time": availability.start_time.strftime("%H:%M"),
            "end_time": availability.end_time.strftime("%H:%M")
        }, 200


    # UPDATE
    def put(self, aid):
        availability = Availability.query.get(aid)

        if not availability:
            return {"message": "Availability not found"}, 404

        data = request.get_json()

        if data.get("day_of_week"):
            availability.day_of_week = data.get("day_of_week")

        if data.get("start_time"):
            availability.start_time = datetime.strptime(
                data.get("start_time"), "%H:%M"
            ).time()

        if data.get("end_time"):
            availability.end_time = datetime.strptime(
                data.get("end_time"), "%H:%M"
            ).time()

        db.session.commit()

        return {"message": "Availability updated successfully"}, 200


    # DELETE
    def delete(self, aid):
        availability = Availability.query.get(aid)

        if not availability:
            return {"message": "Availability not found"}, 404

        db.session.delete(availability)
        db.session.commit()

        return {"message": "Availability deleted successfully"}, 200