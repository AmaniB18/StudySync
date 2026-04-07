from flask import request
from flask_restful import Resource
from extensions import db
from models.message import Message


class MessageListResource(Resource):

    # READ ALL
    def get(self):
        messages = Message.query.all()

        return [
            {
                "msg_id": m.msg_id,
                "message_text": m.message_text,
                "sender_id": m.sender_id,
                "gid": m.gid,
                "sent_at": m.sent_at.isoformat()
            }
            for m in messages
        ], 200


    # CREATE
    def post(self):
        data = request.get_json()

        try:
            message = Message(
                message_text=data["message_text"],
                sender_id=data["sender_id"],
                gid=data["gid"]
            )

            db.session.add(message)
            db.session.commit()

            return {"message": "Message created successfully"}, 201

        except Exception as e:
            return {"message": "Error creating message", "error": str(e)}, 400


class MessageResource(Resource):

    # READ ONE
    def get(self, mid):
        message = Message.query.get(mid)

        if not message:
            return {"message": "Message not found"}, 404

        return {
            "msg_id": message.msg_id,
            "message_text": message.message_text,
            "sender_id": message.sender_id,
            "gid": message.gid,
            "sent_at": message.sent_at.isoformat()
        }, 200


    # UPDATE
    def put(self, mid):
        message = Message.query.get(mid)

        if not message:
            return {"message": "Message not found"}, 404

        data = request.get_json()

        message.message_text = data.get(
            "message_text",
            message.message_text
        )

        message.sender_id = data.get(
            "sender_id",
            message.sender_id
        )

        message.gid = data.get(
            "gid",
            message.gid
        )

        db.session.commit()

        return {"message": "Message updated successfully"}, 200


    # DELETE
    def delete(self, mid):
        message = Message.query.get(mid)

        if not message:
            return {"message": "Message not found"}, 404

        db.session.delete(message)
        db.session.commit()

        return {"message": "Message deleted successfully"}, 200