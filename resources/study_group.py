from flask_restful import Resource
from flask import request
from extensions import db
from models.study_group import StudyGroup


class StudyGroupListResource(Resource):

    # CREATE
    def post(self):
        data = request.get_json()

        group = StudyGroup(
            cid=data["cid"],
            group_name=data["group_name"],
            description=data.get("description"),
            max_members=data.get("max_members"),
            meeting_mode=data.get("meeting_mode"),
            location=data.get("location")
        )

        db.session.add(group)
        db.session.commit()

        return {"message": "Group created"}, 201

    def get(self):
        cid = request.args.get("cid")

        query = StudyGroup.query

        if cid:
            query = query.filter_by(cid=cid)

        groups = query.all()

        return [
            {
                "gid": g.gid,
                "group_name": g.group_name,
                "description": g.description,
                "cid": g.cid,
                "max_members": g.max_members,
                "meeting_mode": g.meeting_mode,
                "location": g.location
            }
            for g in groups
        ], 200


class StudyGroupResource(Resource):

    # READ ONE
    def get(self, gid):
        g = StudyGroup.query.get(gid)

        if not g:
            return {"message": "Group not found"}, 404

        return {
            "gid": g.gid,
            "group_name": g.group_name,
            "description": g.description,
            "cid": g.cid,
            "max_members": g.max_members,
            "meeting_mode": g.meeting_mode,
            "location": g.location
        }, 200

    # UPDATE
    def put(self, gid):
        data = request.get_json()

        g = StudyGroup.query.get(gid)

        if not g:
            return {"message": "Group not found"}, 404

        g.group_name = data.get("group_name", g.group_name)
        g.description = data.get("description", g.description)
        g.max_members = data.get("max_members", g.max_members)
        g.meeting_mode = data.get("meeting_mode", g.meeting_mode)
        g.location = data.get("location", g.location)

        db.session.commit()

        return {"message": "Group updated"}, 200

    # DELETE
    def delete(self, gid):
        g = StudyGroup.query.get(gid)

        if not g:
            return {"message": "Group not found"}, 404

        db.session.delete(g)
        db.session.commit()

        return {"message": "Group deleted"}, 200