# Generated by Django 4.2.7 on 2024-09-04 00:09

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("main", "0016_maxscore_total_questions"),
    ]

    operations = [
        migrations.AddField(
            model_name="question",
            name="write_answer",
            field=models.BooleanField(default=False),
        ),
    ]
