# Generated by Django 4.2.7 on 2024-10-31 04:46

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("main", "0030_classroom_character_voice"),
    ]

    operations = [
        migrations.AddField(
            model_name="question",
            name="picture2",
            field=models.BooleanField(default=False),
        ),
    ]
