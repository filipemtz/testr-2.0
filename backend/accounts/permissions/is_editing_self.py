from rest_framework.permissions import BasePermission

class IsEditingSelf(BasePermission):
    """
    Permite que um usuário edite apenas a si mesmo.
    """    
    def has_object_permission(self, request, view, obj):
        # Usuário só pode acessar/modificar a si mesmo
        return obj == request.user
