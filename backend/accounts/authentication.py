# import jwt, datetime
# from datetime import timezone
# from rest_framework.authentication import BaseAuthentication,  get_authorization_header
# from rest_framework import exceptions
# from django.contrib.auth.models import User

# class JWTAuthentication(BaseAuthentication):
#     def authenticate(self, request):
#         auth = get_authorization_header(request).split()
#         if auth and len(auth) == 2:
#             token = auth[1].decode('utf-8')
#             id = decode_access_token(token)
            
#             user = User.objects.filter(pk=id).first()
#             return (user, None)
        
#         raise exceptions.AuthenticationFailed('unauthenticated')

# def create_access_token(id):
#     return jwt.encode({
#         'user_id': id,
#         'exp' : datetime.datetime.now(tz=timezone.utc) + datetime.timedelta(seconds=30),
#         'iat' : datetime.datetime.now(tz=timezone.utc)
#     }, 'access_secret', algorithm='HS256')


# def decode_access_token(token):
#     try:
#         payload = jwt.decode(token, 'access_secret', algorithms=['HS256'])
#         return payload['user_id']
#     except:
#         raise exceptions.AuthenticationFailed('unauthenticated')

# def create_refresh_token(id):
#     return jwt.encode({
#         'user_id': id,
#         'exp' : datetime.datetime.now(tz=timezone.utc) + datetime.timedelta(days=7),
#         'iat' : datetime.datetime.now(tz=timezone.utc)
#     }, 'refresh_secret', algorithm='HS256')


# def decode_refresh_token(token):
#     try:
#         print(token)
#         payload = jwt.decode(token, 'refresh_secret', algorithms=['HS256'])
#         print(payload)
#         return payload['user_id']
#     except:
#         raise exceptions.AuthenticationFailed('unauthenticated')