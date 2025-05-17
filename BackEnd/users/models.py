from django.db import models

from django.contrib.auth.models import AbstractUser
from django.dispatch import receiver
from django.db.models.signals import post_delete, pre_save

class User(AbstractUser):
    ROLE_CHOICES = (
        ('admin', 'Admin'),
        ('user', 'User'),
    )
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default='user')
    profile_picture = models.ImageField(upload_to='profile_pictures/', blank=True, null=True, default='profile_pictures/default.png')
    
    def __str__(self):
        return f"{self.username} - ({self.role})"

@receiver(pre_save, sender=User)
def Clear_On_Update(sender, instance, **kwargs):
    if not instance.pk:
        # if its a new USER so it would not have a pk yet
        return

    try:
        old_image = User.objects.get(pk=instance.pk).profile_picture
    except User.DoesNotExist:
        return

    new_image = instance.profile_picture
    if old_image and old_image != new_image and old_image.name != 'profile_pictures/default.png':
        old_image.delete(save=False)

    if not new_image:
        instance.profile_picture = 'profile_pictures/default.png'


@receiver(post_delete, sender=User)
def Clear_On_Erased(sender, instance, **kwargs):
    if instance.profile_picture and instance.profile_picture.name != 'profile_pictures/default.png':
        instance.profile_picture.delete(save=False)
