from rest_framework import serializers
from .models import Product, StockMovement

class StockMovementSerializer(serializers.ModelSerializer):
    class Meta:
        model = StockMovement
        fields = ['id','product','movement_type','amount','performed_by','notes','created_at']
        read_only_fields = ['performed_by','created_at']

class ProductSerializer(serializers.ModelSerializer):
    movements = StockMovementSerializer(many=True, read_only=True)
    class Meta:
        model = Product
        fields = ['id','name','sku','description','quantity','min_quantity','created_at','movements']
        read_only_fields = ['created_at']
