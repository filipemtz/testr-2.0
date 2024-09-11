from rest_framework import permissions

class IsTeacher(permissions.BasePermission):
    """
    Permissão personalizada que concede acesso apenas se o usuário for do grupo 'teacher'.
    """
    def has_permission(self, request, view):
        # Verifica se o usuário está autenticado e pertence ao grupo 'teacher'
        return request.user and request.user.is_authenticated and request.user.groups.filter(name='teacher').exists()
