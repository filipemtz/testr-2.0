from rest_framework import permissions

class IsStudent(permissions.BasePermission):
    """
    Permissão personalizada que concede acesso apenas se o usuário for do grupo 'student'.
    """

    def has_permission(self, request, view):
        # Verifica se o usuário está autenticado e pertence ao grupo 'student'
        return request.user and request.user.is_authenticated and request.user.groups.filter(name='student').exists()
