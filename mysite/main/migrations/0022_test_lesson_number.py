# Generated by Django 4.2.7 on 2024-10-03 06:12

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("main", "0021_test_numbers"),
    ]

    operations = [
        migrations.AddField(
            model_name="test",
            name="lesson_number",
            field=models.PositiveIntegerField(default=0),
        ),
    ]
