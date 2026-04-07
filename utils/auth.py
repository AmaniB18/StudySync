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

        auth = request.headers.get("Authorization")

        if not auth:
            return {"message": "token missing"}, 401

        token = auth.replace("Bearer ", "")

        try:
            data = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
            request.user_id = data.get("user_id") or data.get("sub")
        except Exception as e:
            print("JWT ERROR:", e)
            return {"message": "invalid token"}, 401

        return f(*args, **kwargs)   

    return decorated