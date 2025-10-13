from rest_framework import permissions

class IsStudentSafeMethods(permissions.BasePermission):
    """
    Permissão personalizada que concede acesso apenas se o usuário for do grupo 'student'.
    """

    def has_permission(self, request, view):
        # Verifica se o usuário está autenticado, pertence ao grupo 'student' e se o método é seguro
        return request.user and request.user.is_authenticated and request.user.groups.filter(name='student').exists() and request.method in permissions.SAFE_METHODS

