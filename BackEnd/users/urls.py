from django.urls import path
from . import views
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import (
    TokenRefreshView
)

Router = DefaultRouter()
Router.register('all', views.UserDetails, basename='users')
Router.register('public', views.UserDetails, basename='public-users')

urlpatterns = [
    path('register/', views.Register.as_view()),
    path('profile/', views.Profile.as_view()),
    
    
    path('login/', views.MyTokenObtain.as_view()),
    path('refresh/', TokenRefreshView.as_view()),
]

urlpatterns += Router.urls
