# Generated by Django 4.2.7 on 2024-11-26 01:04

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("main", "0041_question_sound4"),
    ]

    operations = [
        migrations.AddField(
            model_name="test",
            name="description",
            field=models.TextField(blank=True),
        ),
    ]
