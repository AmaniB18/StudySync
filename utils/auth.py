from functools import wraps
from flask import request
import jwt
import hashlib

SECRET_KEY = "SECRET_KEY"


# PASSWORD HELPERS
def hash_password(password):
    return hashlib.sha256(password.encode()).hexdigest()


def check_password(password, hashed):
    return hash_password(password) == hashed

#tOKEN MIDDLEWARE

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):

        token = request.headers.get("Authorization")

        if not token:
            return {"message": "token missing"}, 401

        try:
            data = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
            current_user_id = data["user_id"]
        except:
            return {"message": "invalid token"}, 401

        return f(current_user_id, *args, **kwargs)

    return decorated