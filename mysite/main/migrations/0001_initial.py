# Generated by Django 4.2.7 on 2024-05-21 03:18

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion
import django.utils.timezone


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ("accounts", "0001_initial"),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name="Classroom",
            fields=[
                (
                    "id",
                    models.BigAutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                ("teacher", models.CharField(default=None, max_length=200)),
                ("name", models.CharField(max_length=200, unique=True)),
                ("hashed_password", models.CharField(max_length=200)),
                ("classroom_picture", models.BinaryField(editable=True, null=True)),
                (
                    "classroom_content_type",
                    models.CharField(
                        help_text="The MIMEType of the file", max_length=256, null=True
                    ),
                ),
            ],
        ),
        migrations.CreateModel(
            name="Option",
            fields=[
                (
                    "id",
                    models.BigAutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                ("name", models.CharField(max_length=200)),
                ("is_correct", models.BooleanField(default=False)),
                ("option_picture", models.BinaryField(editable=True, null=True)),
                (
                    "option_content_type",
                    models.CharField(
                        help_text="The MIMEType of the file", max_length=256, null=True
                    ),
                ),
            ],
        ),
        migrations.CreateModel(
            name="Question",
            fields=[
                (
                    "id",
                    models.BigAutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                ("name", models.CharField(max_length=500)),
                ("question_picture", models.BinaryField(editable=True, null=True)),
                (
                    "question_content_type",
                    models.CharField(
                        help_text="The MIMEType of the file", max_length=256, null=True
                    ),
                ),
                ("question_sound", models.BinaryField(editable=True, null=True)),
                (
                    "question_sound_content_type",
                    models.CharField(
                        help_text="The MIMEType of the file", max_length=256, null=True
                    ),
                ),
            ],
        ),
        migrations.CreateModel(
            name="School",
            fields=[
                (
                    "id",
                    models.BigAutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                ("name", models.CharField(max_length=200, unique=True)),
                ("hashed_password", models.CharField(max_length=200)),
                ("school_picture", models.BinaryField(editable=True, null=True)),
                (
                    "school_content_type",
                    models.CharField(
                        help_text="The MIMEType of the file", max_length=256, null=True
                    ),
                ),
            ],
        ),
        migrations.CreateModel(
            name="Test",
            fields=[
                (
                    "id",
                    models.BigAutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                ("name", models.CharField(max_length=200)),
                ("test_picture", models.BinaryField(editable=True, null=True)),
                (
                    "test_content_type",
                    models.CharField(
                        help_text="The MIMEType of the file", max_length=256, null=True
                    ),
                ),
                ("total_questions", models.PositiveIntegerField(default=0)),
                ("classroom", models.ManyToManyField(blank=True, to="main.classroom")),
            ],
        ),
        migrations.CreateModel(
            name="UserTestSubmission",
            fields=[
                (
                    "id",
                    models.BigAutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                ("timestamp", models.DateTimeField(default=django.utils.timezone.now)),
                ("score", models.FloatField(default=0)),
                ("total_score", models.FloatField(default=0)),
                (
                    "question",
                    models.ForeignKey(
                        blank=True,
                        null=True,
                        on_delete=django.db.models.deletion.SET_NULL,
                        to="main.question",
                    ),
                ),
                (
                    "selected_option",
                    models.ForeignKey(
                        blank=True,
                        null=True,
                        on_delete=django.db.models.deletion.CASCADE,
                        to="main.option",
                    ),
                ),
                (
                    "test",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE, to="main.test"
                    ),
                ),
                (
                    "user",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        to=settings.AUTH_USER_MODEL,
                    ),
                ),
            ],
        ),
        migrations.CreateModel(
            name="TestRecords",
            fields=[
                (
                    "id",
                    models.BigAutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                ("question_name", models.CharField(max_length=500)),
                (
                    "selected_option_name",
                    models.CharField(blank=True, max_length=200, null=True),
                ),
                ("recorded_score", models.FloatField(default=0)),
                ("total_recorded_score", models.FloatField(default=0)),
                ("group_id", models.IntegerField(default=0)),
                (
                    "account_sessions",
                    models.ForeignKey(
                        default=None,
                        on_delete=django.db.models.deletion.CASCADE,
                        to="accounts.sessions",
                    ),
                ),
                (
                    "question",
                    models.ForeignKey(
                        blank=True,
                        null=True,
                        on_delete=django.db.models.deletion.CASCADE,
                        to="main.question",
                    ),
                ),
                (
                    "test",
                    models.ForeignKey(
                        default=None,
                        on_delete=django.db.models.deletion.CASCADE,
                        to="main.test",
                    ),
                ),
                (
                    "user",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        to=settings.AUTH_USER_MODEL,
                    ),
                ),
            ],
        ),
        migrations.AddField(
            model_name="question",
            name="test",
            field=models.ForeignKey(
                null=True, on_delete=django.db.models.deletion.CASCADE, to="main.test"
            ),
        ),
        migrations.AddField(
            model_name="option",
            name="question",
            field=models.ForeignKey(
                null=True,
                on_delete=django.db.models.deletion.CASCADE,
                to="main.question",
            ),
        ),
        migrations.AddField(
            model_name="classroom",
            name="school",
            field=models.ForeignKey(
                null=True, on_delete=django.db.models.deletion.CASCADE, to="main.school"
            ),
        ),
    ]
