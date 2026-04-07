from flask import request
from flask_restful import Resource
from extensions import db
from models.group_member import GroupMember


class GroupMemberListResource(Resource):

    # READ ALL
    def get(self):
        members = GroupMember.query.all()

        return [
            {
                "mid": m.mid,
                "sid": m.sid,
                "gid": m.gid,
                "role": m.role,
                "status": m.status,
                "joined_at": m.joined_at.isoformat()
            }
            for m in members
        ], 200


    # CREATE
    def post(self):
        data = request.get_json()

        try:
            member = GroupMember(
                sid=data["sid"],
                gid=data["gid"],
                role=data.get("role", "member"),
                status=data.get("status", "active")
            )

            db.session.add(member)
            db.session.commit()

            return {"message": "Group member added successfully"}, 201

        except Exception as e:
            return {"message": "Error adding group member", "error": str(e)}, 400


class GroupMemberResource(Resource):

    # READ ONE
    def get(self, gm_id):
        member = GroupMember.query.get(gm_id)

        if not member:
            return {"message": "Member not found"}, 404

        return {
            "mid": member.mid,
            "sid": member.sid,
            "gid": member.gid,
            "role": member.role,
            "status": member.status,
            "joined_at": member.joined_at.isoformat()
        }, 200


    # UPDATE
    def put(self, gm_id):
        member = GroupMember.query.get(gm_id)

        if not member:
            return {"message": "Member not found"}, 404

        data = request.get_json()

        member.sid = data.get("sid", member.sid)
        member.gid = data.get("gid", member.gid)
        member.role = data.get("role", member.role)
        member.status = data.get("status", member.status)

        db.session.commit()

        return {"message": "Member updated successfully"}, 200


    # DELETE
    def delete(self, gm_id):
        member = GroupMember.query.get(gm_id)

        if not member:
            return {"message": "Member not found"}, 404

        db.session.delete(member)
        db.session.commit()

        return {"message": "Member deleted successfully"}, 200