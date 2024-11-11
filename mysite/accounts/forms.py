from django import forms
from django.contrib.auth.forms import UserCreationForm
from .models import CustomUser
from main.models import Teacher, Student, School, Classroom
from django.contrib.auth.forms import AuthenticationForm
from django.utils.crypto import get_random_string

class CustomAuthenticationForm(AuthenticationForm):
    password = None

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields['username'].widget.attrs['placeholder'] = 'ユーザネーム'
        self.fields['username'].label = 'ユーザネーム'

class TeacherSignUpForm(forms.ModelForm):
    username = forms.CharField(
        label="ユーザー名",
        required=True,
        widget=forms.TextInput(attrs={'class': 'form-control'}),
    )

    school_name = forms.CharField(
        label="学校名",
        required=True,
        widget=forms.TextInput(attrs={'class': 'form-control'}),
    )

    school_password = forms.CharField(
        label="学校のパスワード",
        required=True,
        widget=forms.PasswordInput(attrs={'class': 'form-control'}),
    )

    class Meta:
        model = CustomUser
        fields = ('username',)

    def save(self, commit=True):
        user = super().save(commit=False)
        random_password = get_random_string(8)
        user.set_password(random_password)
        if commit:
            user.save()
        return user

    def clean(self):
        cleaned_data = super().clean()
        return cleaned_data


class StudentSignUpForm(forms.ModelForm):
    username = forms.CharField(
        label="ユーザー名",
        required=True,
        widget=forms.TextInput(attrs={'class': 'form-control'}),
    )

    student_number = forms.CharField(
        label="出席番号",
        required=True,
        widget=forms.TextInput(attrs={'class': 'form-control'}),
    )

    class Meta:
        model = CustomUser
        fields = ('username',)

    def save(self, commit=True):
        user = super().save(commit=False)
        random_password = get_random_string(8)
        user.set_password(random_password)
        classroom = Classroom.objects.get(name='open_room')
        if commit:
            user.save()
            student_number = self.cleaned_data.get('student_number')
            student = Student.objects.create(user=user, student_number=student_number)
            classroom.students.add(student)
        return user

    def clean(self):
        cleaned_data = super().clean()
        return cleaned_data
