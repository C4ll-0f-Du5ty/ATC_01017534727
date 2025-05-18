from .models import Event, Booking
from users.serializers import UserSerializer
from rest_framework import serializers
from django.utils import timezone

class EventSerializer(serializers.ModelSerializer):
    class Meta:
        model = Event
        fields = ['id', 'name', 'description', 'category', 'date', 'venue', 'price', 'seats', 'status', 'location_link', 'image', 'created_by', 'published_at']
        extra_kwargs = {
            'image': {'required': False},
            'location_link': {'required': False},
            'created_by': {'read_only': True},
            'published_at': {'read_only': True},
        }

    def create(self, validated_data):

        validated_data['created_by'] = self.context['request'].user
        return super().create(validated_data)

    def update(self, instance, validated_data):

        validated_data.pop('created_by', None)
        return super().update(instance, validated_data)

class BookingSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    event = serializers.PrimaryKeyRelatedField(
        queryset=Event.objects.all(), write_only=True
    )
    event_details = EventSerializer(source='event', read_only=True)

    class Meta:
        model = Booking
        fields = ['id', 'user', 'event', 'event_details', 'booked_at']

    def validate_event(self, value):
        if value.status != 'upcoming':
            raise serializers.ValidationError("Cannot book a non-upcoming event.")
        if value.date < timezone.now():
            raise serializers.ValidationError("Cannot book a past event.")
        if value.seats <= 0:
            raise serializers.ValidationError("No seats available for this event.")
        if Booking.objects.filter(user=self.context['request'].user, event=value).exists():
            raise serializers.ValidationError("You have already booked this event.")
        return value

    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)
