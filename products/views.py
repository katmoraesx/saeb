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
        # ajustar quantidade via endpoint /api/products/{pk}/adjust/
        product = self.get_object()
        amount = int(request.data.get('amount', 0))
        mtype = request.data.get('movement_type', StockMovement.ENTRY)
        if mtype == StockMovement.ENTRY:
            product.quantity += amount
        else:
            product.quantity -= amount
        product.save()
        # criar movimento
        StockMovement.objects.create(product=product, movement_type=mtype, amount=amount, performed_by=request.user, notes=request.data.get('notes',''))
        serializer = self.get_serializer(product)
        return Response(serializer.data)

class StockMovementViewSet(viewsets.ModelViewSet):
    queryset = StockMovement.objects.select_related('product').all()
    serializer_class = StockMovementSerializer
    permission_classes = [IsAuthenticated]
