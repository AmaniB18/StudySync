from flask import request
from flask_restful import Resource
from extensions import db
from models.message import Message
from models.student import Student
from models.study_group import StudyGroup


class MessageListResource(Resource):

    def get(self):
        gid = request.args.get('gid')
        query = Message.query
        if gid:
            query = query.filter_by(gid=gid)
        messages = query.order_by(Message.sent_at.desc()).all()
        return [_serialize_message(m) for m in messages], 200

    def post(self):
        data = request.get_json()
        msg = Message(
            gid=data['gid'],
            sender_id=data['sender_id'],
            message_text=data['message_text']
        )
        db.session.add(msg)
        db.session.commit()
        return {'message': 'Message sent', 'msg_id': msg.msg_id}, 201


class MessageResource(Resource):

    def get(self, mid):
        m = Message.query.get(mid)
        if not m:
            return {'message': 'Not found'}, 404
        return _serialize_message(m), 200

    def delete(self, mid):
        m = Message.query.get(mid)
        if not m:
            return {'message': 'Not found'}, 404
        db.session.delete(m)
        db.session.commit()
        return {'message': 'Deleted'}, 200


def _serialize_message(m):
    sender = Student.query.get(m.sender_id)
    group = StudyGroup.query.get(m.gid)
    return {
        'msg_id': m.msg_id,
        'gid': m.gid,
        'sender_id': m.sender_id,
        'sender_name': sender.full_name if sender else None,
        'group_name': group.group_name if group else None,
        'message_text': m.message_text,
        'sent_at': m.sent_at.isoformat() if m.sent_at else None
    }
