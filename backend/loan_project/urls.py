from django.contrib import admin
from django.urls import path, include
from users.views import AuthViewSet

auth = AuthViewSet.as_view

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/token/', auth({'post': 'login'}), name='token_obtain_pair'),
    path('api/users/', include('users.urls')),
    path('api/loans/', include('loans.urls')),
]
