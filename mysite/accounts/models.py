from django.contrib.auth.models import AbstractUser
from django.db import models





class CustomUser(AbstractUser):
    total_max_scores = models.FloatField(default=0)
    total_japanese_score = models.FloatField(default=0.0)
    total_english_5_score = models.FloatField(default=0.0)
    total_english_6_score = models.FloatField(default=0.0)
    total_phonics_score = models.FloatField(default=0.0)
    total_numbers_score = models.FloatField(default=0.0)





class Sessions(models.Model):
    session_name = models.CharField(max_length=200, default=None)
    user = models.CharField(max_length=200, default=None)
    number = models.IntegerField(default=0)
    timestamp = models.DateTimeField(auto_now_add=True)
    total_recorded_score = models.FloatField(default=0)
    total_questions = models.FloatField(default=0)



    def __str__(self):
        return self.session_name