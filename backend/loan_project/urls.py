from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from users.views import CustomTokenObtainPairView
from rest_framework_simplejwt.views import TokenRefreshView

urlpatterns = [
    path('api/token/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('admin/', admin.site.urls),
    path('api/users/', include('users.urls')),
    path('api/loans/', include('loans.urls')),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
] 


