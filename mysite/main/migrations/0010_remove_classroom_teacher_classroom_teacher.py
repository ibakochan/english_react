# Generated by Django 4.2.7 on 2024-07-01 00:09

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("main", "0009_alter_student_student_number"),
    ]

    operations = [
        migrations.RemoveField(
            model_name="classroom",
            name="teacher",
        ),
        migrations.AddField(
            model_name="classroom",
            name="teacher",
            field=models.ManyToManyField(
                blank=True, related_name="classrooms", to="main.teacher"
            ),
        ),
    ]
