from django import forms
from main.models import School, Classroom, Test, Question, Option, UserTestSubmission
from django.core.files.uploadedfile import InMemoryUploadedFile
from accounts.models import CustomUser
from main.humanize import naturalsize
from django.forms import DateInput
from django.core.exceptions import ValidationError
from django.forms import CharField
from .lists import alphabet_sounds2, japanese_numbers, grade_6_lesson_6, alphabet_sounds, one_twenty, one_hundred, eleven_ninety, one_thousand, one_quadrillion, thousand_quadrillion, grade_6_lesson_5, grade_5_lesson_5, grade_5_lesson_6, small_alphabet_sounds, alphabet_phonics, jlpt_n5_vocabulary, phonics1, phonics_2, lesson4_list, lesson4_grade6_dict

class ClassroomJoinForm(forms.Form):
    classroom_name = forms.CharField(
        label="教室名",
        required=True,
        widget=forms.TextInput(attrs={'class': 'form-control'}),
    )

class ConnectTestForm(forms.Form):
    classroom_name = forms.CharField(
        label="教室名",
        required=True,
        widget=forms.TextInput(attrs={'class': 'form-control'}),
    )
    classroom_password = forms.CharField(
        label="教室のパスワード",
        required=True,
        widget=forms.PasswordInput(attrs={'class': 'form-control'}),
    )


class SingleCheckboxSelect(forms.CheckboxSelectMultiple):
    def value_from_datadict(self, data, files, name):
        value = super().value_from_datadict(data, files, name)
        if isinstance(value, list):
            return value[0] if value else None
        return value



class TestSubmissionForm(forms.ModelForm):

    class Meta:
        model = UserTestSubmission
        fields = ['selected_option']
        widgets = {
            'selected_option': forms.RadioSelect(),
        }



class SchoolCreateForm(forms.ModelForm):
    # This is a form for creating a schedule.
    # You can write a title, choose color, category and upload a picture.
    max_upload_limit = 2 * 1024 * 1024
    max_upload_limit_text = naturalsize(max_upload_limit)

    school_picture = forms.FileField(required=False, label='Picture upload limit <= '+max_upload_limit_text)
    upload_field_name = 'school_picture'



    class Meta:
        model = School
        fields = ['school_name', 'school_password', 'school_picture']

        #Using widgets again for some style.
    widgets = {
        'name': forms.TextInput(attrs={'class': 'form-control'}),
        'hashed_password': forms.TextInput(attrs={'class': 'form-control'}),
    }

    def clean(self):
        cleaned_data = super().clean()
        school = cleaned_data.get('school_picture')
        if school is None:
            return
        if len(school) > self.max_upload_limit:
            self.add_error('schohol_picture', "File must be < "+self.max_upload_limit_text+" bytes")



    def save(self, commit=True):
        instance = super(SchoolCreateForm, self).save(commit=False)

        f = instance.school_picture
        if isinstance(f, InMemoryUploadedFile):
            bytearr = f.read()
            instance.school_content_type = f.content_type
            instance.school_picture = bytearr

        if commit:
            instance.save()

        return instance




class ClassroomCreateForm(forms.ModelForm):
    # This is a form for creating a schedule.
    # You can write a title, choose color, category and upload a picture.
    max_upload_limit = 2 * 1024 * 1024
    max_upload_limit_text = naturalsize(max_upload_limit)

    classroom_picture = forms.FileField(required=False, label='Picture upload limit <= '+max_upload_limit_text)
    upload_field_name = 'classroom_picture'



    class Meta:
        model = Classroom
        fields = ['name']

        labels = {
            'name': '教室名',
        }

        widgets = {
            'name': forms.TextInput(attrs={'class': 'form-control'}),
        }





class TestCreateForm(forms.ModelForm):
    # This is a form for creating a schedule.
    # You can write a title, choose color, category and upload a picture.
    max_upload_limit = 2 * 1024 * 1024
    max_upload_limit_text = naturalsize(max_upload_limit)

    test_picture = forms.FileField(required=False, label='Picture upload limit <= '+max_upload_limit_text)
    upload_field_name = 'test_picture'



    class Meta:
        model = Test
        fields = ['name', 'test_picture', 'category', 'picture_url', 'lesson_number']

        #Using widgets again for some style.
    widgets = {
        'name': forms.TextInput(attrs={'class': 'form-control'}),
    }

    def clean(self):
        cleaned_data = super().clean()
        test = cleaned_data.get('test_picture')
        if test is None:
            return
        if len(test) > self.max_upload_limit:
            self.add_error('test_picture', "File must be < "+self.max_upload_limit_text+" bytes")



    def save(self, commit=True):
        instance = super(TestCreateForm, self).save(commit=False)

        f = instance.test_picture
        if isinstance(f, InMemoryUploadedFile):
            bytearr = f.read()
            instance.test_content_type = f.content_type
            instance.test_picture = bytearr

        if commit:
            instance.save()

        return instance


class QuestionCreateForm(forms.ModelForm):
    # This is a form for creating a schedule.
    # You can write a title, choose color, category and upload a picture.
    max_upload_limit = 2 * 1024 * 1024
    max_upload_limit_text = naturalsize(max_upload_limit)
    max_sound_upload_limit = 2 * 1024 * 1024
    max_sound_upload_limit_text = naturalsize(max_sound_upload_limit)

    question_picture = forms.FileField(required=False, label='Picture upload limit <= '+max_upload_limit_text)
    upload_field_name = 'question_picture'
    question_sound = forms.FileField(required=False, label='Sound upload limit <= '+max_sound_upload_limit_text)
    upload_sound_field_name = 'question_sound'

    list_choices = [
        ('alphabet_sounds', 'Alphabet Sounds'),
        ('small_alphabet_sounds', 'Small Alphabet Sounds'),
        ('jlpt_n5_vocabulary', 'Jlpt_n5_vocabulary'),
        ('phonics1', 'Phonics1'),
        ('lesson4_list', 'Lesson4_list'),
        ('lesson4_grade6_dict', 'Lesson4_grade6_dict'),
        ('alphabet_phonics', 'Alphabet_phonics'),
        ('phonics_2', 'Phonics_2'),
        ('grade_6_lesson_5', 'grade_6_lesson_5'),
        ('grade_5_lesson_5', 'grade_5_lesson_5'),
        ('grade_5_lesson_6', 'grade_5_lesson_6'),
        ('grade_6_lesson_6', 'grade_6_lesson_6'),
        ('one_twenty', 'One Twenty'),
        ('one_hundred', 'One Hundred'),
        ('eleven_ninety', 'Eleven Ninety'),
        ('one_thousand', 'One Thousand'),
        ('one_quadrillion', 'One Quadrillion'),
        ('thousand_quadrillion', 'Thousand Quadrillion'),
        ('japanese_numbers', 'Japanese_Numbers'),
        ('alphabet_sounds2', 'Alphabet Sounds2'),
    ]
    list_selection = forms.ChoiceField(choices=list_choices, required=False, label='Select List')



    class Meta:
        model = Question
        fields = ['name', 'double_object', 'write_answer', 'question_picture', 'question_sound', 'question_list', 'list_selection', 'first_letter', 'second_letter', 'third_letter', 'last_letter', 'sound2', 'picture2', 'label']

    widgets = {
        'name': forms.TextInput(attrs={'class': 'form-control'}),
    }

    def clean(self):
        cleaned_data = super().clean()
        question = cleaned_data.get('question_picture')
        if question is None:
            return
        if len(question) > self.max_upload_limit:
            self.add_error('question_picture', "Picture must be < "+self.max_upload_limit_text+" bytes")

        question_s = cleaned_data.get('question_sound')
        if question_s is None:
            return
        if len(question_s) > self.max_sound_upload_limit:
            self.add_error('question_sound', "Sound must be < "+self.max_sound_upload_limit_text+" bytes")



    def save(self, commit=True):
        instance = super(QuestionCreateForm, self).save(commit=False)

        f = instance.question_picture
        f_s = instance.question_sound
        if isinstance(f, InMemoryUploadedFile):
            bytearr = f.read()
            instance.content_type = f.content_type
            instance.question_picture = bytearr
        if isinstance(f_s, InMemoryUploadedFile):
            bytearr = f_s.read()
            instance.sound_content_type = f_s.content_type
            instance.question_sound = bytearr

        selected_list = self.cleaned_data.get('list_selection')
        if selected_list:
            if selected_list == 'alphabet_sounds':
                instance.question_list = alphabet_sounds
            elif selected_list == 'small_alphabet_sounds':
                instance.question_list = small_alphabet_sounds
            elif selected_list == 'jlpt_n5_vocabulary':
                instance.question_list = jlpt_n5_vocabulary
            elif selected_list == 'phonics1':
                instance.question_list = phonics1
            elif selected_list == 'lesson4_list':
                instance.question_list = lesson4_list
            elif selected_list == 'lesson4_grade6_dict':
                instance.question_list = lesson4_grade6_dict
            elif selected_list == 'alphabet_phonics':
                instance.question_list = alphabet_phonics
            elif selected_list == 'phonics_2':
                instance.question_list = phonics_2
            elif selected_list == 'grade_6_lesson_5':
                instance.question_list = grade_6_lesson_5
            elif selected_list == 'grade_6_lesson_6':
                instance.question_list = grade_6_lesson_6
            elif selected_list == 'grade_5_lesson_5':
                instance.question_list = grade_5_lesson_5
            elif selected_list == 'grade_5_lesson_6':
                instance.question_list = grade_5_lesson_6
            elif selected_list == 'one_twenty':
                instance.question_list = one_twenty
            elif selected_list == 'one_hundred':
                instance.question_list = one_hundred
            elif selected_list == 'eleven_ninety':
                instance.question_list = eleven_ninety
            elif selected_list == 'one_thousand':
                instance.question_list = one_thousand
            elif selected_list == 'one_quadrillion':
                instance.question_list = one_quadrillion
            elif selected_list == 'thousand_quadrillion':
                instance.question_list = thousand_quadrillion
            elif selected_list == 'japanese_numbers':
                instance.question_list = japanese_numbers
            elif selected_list == 'alphabet_sounds2':
                instance.question_list = alphabet_sounds2

        if commit:
            instance.save()

        return instance


class OptionCreateForm(forms.ModelForm):
    # This is a form for creating a schedule.
    # You can write a title, choose color, category and upload a picture.
    max_upload_limit = 2 * 1024 * 1024
    max_upload_limit_text = naturalsize(max_upload_limit)

    option_picture = forms.FileField(required=False, label='Picture upload limit <= '+max_upload_limit_text)
    upload_field_name = 'option_picture'



    class Meta:
        model = Option
        fields = ['name', 'option_picture', 'is_correct', 'option_list']

        #Using widgets again for some style.
    widgets = {
        'name': forms.TextInput(attrs={'class': 'form-control'}),
    }


    def clean(self):
        cleaned_data = super().clean()
        option = cleaned_data.get('option_picture')
        if option is None:
            return
        if len(option) > self.max_upload_limit:
            self.add_error('option_picture', "File must be < "+self.max_upload_limit_text+" bytes")



    def save(self, commit=True):
        instance = super(OptionCreateForm, self).save(commit=False)

        f = instance.option_picture
        if isinstance(f, InMemoryUploadedFile):
            bytearr = f.read()
            instance.option_content_type = f.content_type
            instance.option_picture = bytearr


        if commit:
            instance.save()

        return instance
