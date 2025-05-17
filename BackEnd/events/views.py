from users.permissions import IsAdmin, IsUser
from rest_framework.viewsets import ModelViewSet, ReadOnlyModelViewSet
from .models import Event, Booking
from .serializers import EventSerializer, BookingSerializer
from rest_framework.permissions import AllowAny, IsAuthenticated
from django.db import transaction
from rest_framework.exceptions import ValidationError
from django.utils import timezone

# class EventViewSet(ModelViewSet):
#     queryset = Event.objects.all()
#     serializer_class = EventSerializer
    
#     def get_permissions(self):
#         if self.action in ['create', 'update', 'destroy']:
#             return [IsAuthenticated(), IsAdmin()]
#         return [AllowAny()]
    
#     def perform_create(self, serializer):
#         serializer.save(created_by=self.request.user)

class EventViewSet(ReadOnlyModelViewSet):
    queryset = Event.objects.all()
    serializer_class = EventSerializer
    permission_classes = [AllowAny]

class EventWriteViewSet(ModelViewSet):
    queryset = Event.objects.all()
    serializer_class = EventSerializer
    permission_classes = [IsAuthenticated, IsAdmin]

class BookingViewSet(ModelViewSet):
    serializer_class = BookingSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Booking.objects.filter(user=self.request.user).select_related('event', 'user')

    @transaction.atomic
    def perform_create(self, serializer):
        event = serializer.validated_data['event']
        # Validation already handled in serializer, but kept here for consistency
        if event.date < timezone.now():
            raise ValidationError("Cannot book a past event.")
        if event.seats <= 0:
            raise ValidationError("No more seats available for this event.")
        event.seats -= 1
        event.save()
        serializer.save(user=self.request.user)

    @transaction.atomic
    def perform_destroy(self, instance):
        event = instance.event
        if event.date < timezone.now():
            raise ValidationError("Cannot cancel booking for a past event.")
        event.seats += 1
        event.save()
        instance.delete()
