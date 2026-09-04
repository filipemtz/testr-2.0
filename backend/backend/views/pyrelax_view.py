from pyrelax.data import databases
from rest_framework.response import Response
from rest_framework.views import APIView


class PyrelaxDatabasesView(APIView):
    def get(self, request):
        return Response(list(databases.keys()))
