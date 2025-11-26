from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import Product, StockMovement
from .serializers import ProductSerializer, StockMovementSerializer
from django.shortcuts import get_object_or_404
from rest_framework.decorators import action

class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.all().order_by('name')
    serializer_class = ProductSerializer
    permission_classes = [IsAuthenticated]

    @action(detail=True, methods=['post'])
    def adjust(self, request, pk=None):
        product = self.get_object()
        
        # --- 1. Validação de Quantidade (Amount) ---
        try:
            # Tenta converter o 'amount'. Se for inválido, cai no 'except'
            amount = int(request.data.get('amount', 0))
        except ValueError:
            return Response({'amount': 'A quantidade deve ser um número inteiro válido.'}, status=status.HTTP_400_BAD_REQUEST)

        if amount <= 0:
            return Response({'amount': 'A quantidade deve ser maior que zero.'}, status=status.HTTP_400_BAD_REQUEST)
        
        mtype = request.data.get('movement_type', StockMovement.ENTRY)

        # --- 2. Lógica de Ajuste e Prevenção de Estoque Negativo ---
        if mtype == StockMovement.ENTRY:
            product.quantity += amount
        else:
            # Validação para evitar que a saída deixe o estoque negativo
            if product.quantity < amount:
                return Response({'amount': f'A saída de {amount} excede o estoque atual de {product.quantity}.'}, status=status.HTTP_400_BAD_REQUEST)
            product.quantity -= amount
            
        product.save()
        
        # --- 3. Correção do Erro Crítico (performed_by) ---
        # Verifica se o usuário está autenticado antes de atribuir ao campo ForeignKey.
        # Se for um AnonymousUser (não logado), define como None (permitido pelo model).
        user_to_assign = request.user if request.user.is_authenticated else None
        
        # Criar movimento
        StockMovement.objects.create(
            product=product, 
            movement_type=mtype, 
            amount=amount, 
            performed_by=user_to_assign, # <-- CORRIGIDO AQUI
            notes=request.data.get('notes','')
        )
        
        serializer = self.get_serializer(product)
        return Response(serializer.data)

class StockMovementViewSet(viewsets.ModelViewSet):
    queryset = StockMovement.objects.select_related('product').all()
    serializer_class = StockMovementSerializer
    permission_classes = [IsAuthenticated]