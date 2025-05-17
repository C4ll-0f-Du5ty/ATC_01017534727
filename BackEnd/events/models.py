from django.db import models
from users.models import User
from django.dispatch import receiver
from django.db.models.signals import post_delete, pre_save


class Event(models.Model):
    name = models.CharField(max_length=255)
    description = models.TextField()
    category = models.CharField(max_length=100)
    date = models.DateTimeField()
    venue = models.CharField(max_length=255)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    seats = models.PositiveIntegerField(default=0)
    image = models.ImageField(upload_to='event_images/', blank=True, null=True, default='event_images/default.png')
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='events')
    published_at = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=10, choices=[
        ('upcoming', 'Upcoming'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
    ], default='upcoming')
    location_link = models.URLField(blank=True, null=True)

    def __str__(self):
        return self.name

# @receiver(pre_save, sender=Event)
# def Clear_On_Update(sender, instance, **kwargs):
#     if not instance.pk:
#         # Not a User Yet:
#         return
#     try:
#         old_image = User.objects.get(pk=instance.pk).image
#     except User.DoesNotExist:
#         return
    
#     new_image = instance.image
#     if old_image and new_image != old_image and old_image != 'event_images/default.jpg':
#         old_image.delete()
    
#     if not new_image:
#         # Setting the default image if a new one was not provided
#         instance.image = 'event_images/default.jpg'

@receiver(pre_save, sender=Event)
def Clear_On_Update(sender, instance, **kwargs):
    if not instance.pk:  # New event
        if not instance.image:  # No image provided
            instance.image = 'event_images/default.png'
        return

    try:
        old_event = Event.objects.get(pk=instance.pk)
        old_image = old_event.image
    except Event.DoesNotExist:
        return

    new_image = instance.image
    if old_image and new_image != old_image and old_image.name != 'event_images/default.png':
        old_image.delete(save=False)

    if not new_image:  # No new image provided
        instance.image = 'event_images/default.png'

@receiver(post_delete, sender=Event)
def Clear_On_Erased(sender, instance, **kwargs):
    
    if instance.image and instance.image.name != 'event_images/default.jpg':
        instance.image.delete(save=False)


class Booking(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    event = models.ForeignKey(Event, on_delete=models.CASCADE)
    booked_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'event')

    def __str__(self):
        return f"{self.user.username} => {self.event.name}"
