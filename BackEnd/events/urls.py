from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register('all', views.EventViewSet, basename='events')
router.register('manage', views.EventWriteViewSet, basename='manage-events')
router.register('bookings', views.BookingViewSet, basename='booking')

urlpatterns = router.urls
