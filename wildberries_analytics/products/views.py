from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import Product
from .serializers import ProductSerializer

class ProductListAPIView(APIView):
    """
    GET /api/products/?min_price=...&min_rating=...&min_feedbacks=...
    """

    def get(self, request):
        products = Product.objects.all()

        # фильтрация
        min_price = request.GET.get('min_price')
        min_rating = request.GET.get('min_rating')
        min_feedbacks = request.GET.get('min_feedbacks')

        if min_price:
            products = products.filter(price__gte=float(min_price))
        if min_rating:
            products = products.filter(rating__gte=float(min_rating))
        if min_feedbacks:
            products = products.filter(feedback_count__gte=int(min_feedbacks))

        serializer = ProductSerializer(products, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
