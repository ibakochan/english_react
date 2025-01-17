from django.shortcuts import render
from django.views import View
from accounts.models import CustomUser, Sessions
from django.http import JsonResponse
from accounts.forms import StudentSignUpForm, TeacherSignUpForm
from .models import School, Classroom, Test, Question, Option, UserTestSubmission, TestRecords, Teacher, Student, MaxScore, ClassroomRequest
from django.urls import reverse
from django.http import HttpResponse
from django.contrib.auth import login
from random import shuffle
from rest_framework import viewsets
from django.utils import timezone
from rest_framework.decorators import action
from django.contrib import messages
import json
from .profile_assets import get_profile_assets, get_memories, get_total_questions, get_total_category_scores, get_eiken_pet, get_eiken_memories
from django.db.models import Sum



from .serializers import (SchoolSerializer, ClassroomSerializer, QuestionSerializer, TestQuestionSerializer, OptionSerializer, TeacherSerializer, StudentSerializer,
                          TestRecordsSerializer, SessionsSerializer, OnlySessionsSerializer, CustomUserSerializer, ConnectTestFormSerializer, TestByClassroomSerializer, ClassroomRequestSerializer, MaxScoreSerializer)

from rest_framework.response import Response

from django.contrib.auth.hashers import check_password
from .forms import SchoolCreateForm, ClassroomCreateForm, TestCreateForm, QuestionCreateForm, OptionCreateForm, TestSubmissionForm, ConnectTestForm, ClassroomJoinForm
from django.contrib.auth.mixins import LoginRequiredMixin
from django.shortcuts import get_object_or_404, redirect
from rest_framework.permissions import IsAuthenticated
from django.core.exceptions import ObjectDoesNotExist



class TestRecordsViewSet(viewsets.ModelViewSet):
    queryset = TestRecords.objects.all()
    serializer_class = TestRecordsSerializer

class SessionsViewSet(viewsets.ModelViewSet):
    queryset = Sessions.objects.all()
    serializer_class = SessionsSerializer


class ClassroomRequestViewSet(viewsets.ModelViewSet):
    queryset = ClassroomRequest.objects.all()
    serializer_class = ClassroomRequestSerializer

    @action(detail=False, methods=['get'], url_path='by-classroom/(?P<classroom_id>[^/.]+)')
    def get_classroomrequest_by_classroom(self, request, classroom_id=None):

        classroomrequest_ids = ClassroomRequest.objects.filter(classroom_id=classroom_id).values_list('id', flat=True).distinct()

        classroomrequest = ClassroomRequest.objects.filter(id__in=classroomrequest_ids, unchangeable=False)

        serializer = ClassroomRequestSerializer(classroomrequest, many=True)

        return Response(serializer.data)

class MaxScoreViewSet(viewsets.ModelViewSet):
    queryset = MaxScore.objects.all()
    serializer_class = MaxScoreSerializer

    @action(detail=False, methods=['get'], url_path='by-category-and-user/(?P<category>[^/.]+)/(?P<user_id>[^/.]+)')
    def get_maxscore_by_category_and_user(self, request, category=None, user_id=None):
        tests = Test.objects.filter(category=category)

        maxscore_ids = MaxScore.objects.filter(test__in=tests, user_id=user_id).values_list('id', flat=True).distinct()

        maxscore = MaxScore.objects.filter(id__in=maxscore_ids)

        serializer = MaxScoreSerializer(maxscore, many=True)

        return Response(serializer.data)

    @action(detail=False, methods=['get'], url_path='by-classroom_and_test/(?P<test_id>[^/.]+)')
    def get_maxscore_by_classroom_and_test(self, request, test_id=None):
        user = request.user
        teacher = Teacher.objects.get(user=user)
        classrooms = Classroom.objects.filter(teacher=teacher)

        users = []

        for classroom in classrooms:
            students = classroom.students.all()
            users.extend([student.user for student in students])
        maxscores = MaxScore.objects.filter(user__in=users, test_id=test_id)

        serializer = MaxScoreSerializer(maxscores, many=True)

        return Response(serializer.data)

    @action(detail=False, methods=['get'], url_path='by-test/(?P<test_id>[^/.]+)')
    def get_maxscore_by_test(self, request, test_id=None):
        maxscores = MaxScore.objects.filter(test_id=test_id, user_id=request.user.id)

        serializer = MaxScoreSerializer(maxscores, many=True)

        return Response(serializer.data)

class OnlySessionsViewSet(viewsets.ModelViewSet):
    queryset = Sessions.objects.all()
    serializer_class = OnlySessionsSerializer

    @action(detail=False, methods=['get'], url_path='by-test/(?P<test_id>[^/.]+)')
    def get_sessions_by_test(self, request, test_id=None):
        session_ids = TestRecords.objects.filter(test_id=test_id).values_list('account_sessions_id', flat=True).distinct()

        sessions = Sessions.objects.filter(id__in=session_ids)

        serializer = OnlySessionsSerializer(sessions, many=True)

        return Response(serializer.data)

    @action(detail=False, methods=['get'], url_path='by-test-and-user/(?P<test_id>[^/.]+)/(?P<user_id>[^/.]+)')
    def get_sessions_by_test_and_user(self, request, test_id=None, user_id=None):
        session_ids = TestRecords.objects.filter(test_id=test_id, user_id=user_id).values_list('account_sessions_id', flat=True).distinct()

        sessions = Sessions.objects.filter(id__in=session_ids)

        serializer = OnlySessionsSerializer(sessions, many=True)

        return Response(serializer.data)







class TestQuestionViewSet(viewsets.ModelViewSet):
    queryset = Question.objects.all()
    serializer_class = TestQuestionSerializer

    @action(detail=False, methods=['get'], url_path='by-test/(?P<test_id>[^/.]+)')
    def get_questions_by_test(self, request, test_id=None):
        questions = Question.objects.filter(test__id=test_id)
        questions = list(questions)
        shuffle(questions)
        serializer = TestQuestionSerializer(questions, many=True)

        return Response(serializer.data)

    @action(detail=False, methods=['get'], url_path='one-question/(?P<test_id>[^/.]+)')
    def get_one_question_by_test(self, request, test_id=None):
        question = Question.objects.filter(test__id=test_id).order_by('id').first()

        if question:
            serializer = TestQuestionSerializer(question)
            return Response(serializer.data)
        else:
            return Response({"detail": "No questions found for this test"}, status=404)

class OptionViewSet(viewsets.ModelViewSet):
    queryset = Option.objects.all()
    serializer_class = OptionSerializer

    @action(detail=False, methods=['get'], url_path='by-question/(?P<question_id>[^/.]+)')
    def get_options_by_question(self, request, question_id=None):
        options = Option.objects.filter(question__id=question_id)
        options = list(options)
        shuffle(options)

        serializer = OptionSerializer(options, many=True)

        return Response(serializer.data)

class NameIdTestViewSet(viewsets.ModelViewSet):
    queryset = Test.objects.all()
    serializer_class = TestByClassroomSerializer

    def filter_eiken_tests(self, tests, user):
        eiken_tests = tests.filter(category='eiken').exclude(lesson_number=0)
        for test in eiken_tests:
            try:

                prev_test = eiken_tests.get(lesson_number=test.lesson_number - 1)
                max_score = MaxScore.objects.filter(test=prev_test, user=user).first()
                if not max_score or (max_score.score / prev_test.total_score) < 0.7:
                    tests = tests.exclude(id=test.id)
            except Test.DoesNotExist:
                continue
        return tests


    @action(detail=False, methods=['get'], url_path='by-classroom/(?P<classroom_id>[^/.]+)')
    def by_classroom(self, request, classroom_id=None):
        tests = self.queryset.filter(classroom__id=classroom_id)
        serializer = self.get_serializer(tests, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'], url_path='by-category')
    def by_category(self, request):
        categories = request.query_params.getlist('category')
        valid_categories = ['japanese', 'english_5', 'english_6', 'phonics', 'numbers', 'eiken']

        if any(category in valid_categories for category in categories):
            tests = self.queryset.filter(category__in=categories)
            tests = self.filter_eiken_tests(tests, request.user)
            serializer = self.get_serializer(tests, many=True)
            return Response(serializer.data)
        return Response({"error": "Invalid or unspecified categories"}, status=400)


class ClassroomViewSet(viewsets.ModelViewSet):
    queryset = Classroom.objects.all()
    serializer_class = ClassroomSerializer

    @action(detail=False, methods=['get'], url_path='my-classroom')
    def get_my_classroom(self, request):
        user = request.user
        try:
            student = Student.objects.get(user=user)
            classrooms = Classroom.objects.filter(students=student)
            if classrooms.exists():
                serializer = self.get_serializer(classrooms, many=True)
                return Response(serializer.data)
            else:
                return Response({"detail": "Student is not enrolled in any classroom"}, status=404)
        except Student.DoesNotExist:
            try:
                teacher = Teacher.objects.get(user=user)
                classrooms = Classroom.objects.filter(teacher=teacher)
                if classrooms.exists():
                    serializer = self.get_serializer(classrooms, many=True)
                    return Response(serializer.data)
                else:
                    return Response({"detail": "Teacher is not assigned to any classroom"}, status=404)
            except Teacher.DoesNotExist:
                return Response({"detail": "User is not associated with any student or teacher"}, status=404)

    @action(detail=False, methods=['get'], url_path='my-classroom-teacher')
    def get_my_classroom_teacher(self, request):
        user = request.user
        try:
            teacher = Teacher.objects.get(user=user)
            classrooms = Classroom.objects.filter(teacher=teacher)
            if classrooms.exists():
                serializer = self.get_serializer(classrooms, many=True)
                return Response(serializer.data)
            else:
                return Response({"detail": "Teacher is not assigned to any classroom"}, status=404)
        except Teacher.DoesNotExist:
            return Response({"detail": "User is not a teacher"}, status=404)

class UserViewSet(viewsets.ModelViewSet):
    queryset = CustomUser.objects.all()
    serializer_class = CustomUserSerializer


class SchoolViewSet(viewsets.ModelViewSet):
    queryset = School.objects.all()
    serializer_class = SchoolSerializer

class CustomUserViewSet(viewsets.ModelViewSet):
    queryset = CustomUser.objects.all()
    serializer_class = CustomUserSerializer

    @action(detail=False, methods=['get'], url_path='by-classroom/(?P<classroom_id>[^/.]+)')
    def get_users_by_classroom(self, request, classroom_id=None):
        if Student.objects.filter(user=request.user).exists():
            users = CustomUser.objects.filter(id=request.user.id)
        else:
            students = Student.objects.filter(classrooms__id=classroom_id)
            user_ids = students.values_list('user_id', flat=True)
            users = CustomUser.objects.filter(id__in=user_ids)

        serializer = CustomUserSerializer(users, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'], url_path='current-user')
    def get_current_user_with_asset(self, request):
        user = request.user
        question_counts = get_total_questions()
        total_category_scores = get_total_category_scores(user)
        total_max_scores = user.total_max_scores
        if user.username == 'ivar' or user.username == 'gund':
            total_eiken_scores = 9999
        else:
            total_eiken_scores = user.total_eiken_score
        memories = get_memories(total_max_scores)
        asset = get_profile_assets(total_max_scores)
        pets = get_eiken_pet(total_eiken_scores)
        eiken_memories = get_eiken_memories(total_eiken_scores)
        user_data = self.get_serializer(user).data
        user_data['question_counts'] = question_counts
        user_data['profile_asset'] = asset
        user_data['memories'] = memories
        user_data['pets'] = pets
        user_data['eiken_memories'] = eiken_memories
        user_data['total_category_scores'] = total_category_scores

        return Response(user_data)


def remove_digits_from_end(string, num_digits):
    return string[:-num_digits]



class ClassroomSilenceView(View):
    def post(self, request):
        teacher = Teacher.objects.get(user=request.user)
        classroom = Classroom.objects.get(teacher=teacher)

        classroom.character_voice = not classroom.character_voice
        classroom.save()

        return redirect('main:profile')

class TestClassroomView(View):
    def post(self, request, pk):
        test = Test.objects.get(pk=pk)
        try:
            data = json.loads(request.body)
        except json.JSONDecodeError:
            return JsonResponse({'status': 'error', 'message': 'Invalid JSON'})

        connect_form = ConnectTestForm(data)
        print(data)
        print(connect_form.errors)

        if connect_form.is_valid():
            classroom_name = connect_form.cleaned_data.get('classroom_name')
            classroom_password = connect_form.cleaned_data.get('classroom_password')

            try:
                classroom = Classroom.objects.get(name=classroom_name)
                if classroom.hashed_password == classroom_password:
                    test.classroom.add(classroom)
                    response_data = {'status': 'success', 'message': 'Successfully added to the classroom!'}
                else:
                    response_data = {'status': 'error', 'message': 'Invalid classroom password.'}
            except Classroom.DoesNotExist:
                response_data = {'status': 'error', 'message': 'Classroom not found.'}
        else:
            response_data = {'status': 'error', 'message': 'Form is not valid.', 'errors': connect_form.errors}

        return JsonResponse(response_data)

class ClassroomJoinView(View):

    def post(self, request):
        form = ClassroomJoinForm(request.POST)
        user = request.user
        if form.is_valid():
            classroom_name = form.cleaned_data.get('classroom_name')
            try:
                classroom = Classroom.objects.get(name=classroom_name)
                if classroom:
                    try:
                        student = user.student
                        student.classrooms.clear()
                        classroom.students.add(student)
                        messages.success(request, 'Successfully joined the classroom as a student!')
                    except ObjectDoesNotExist:
                        try:
                            teacher = user.teacher
                            if user.is_superuser or ClassroomRequest.objects.filter(classroom=classroom, teacher=teacher, is_accepted=True).exists():
                                teacher.classrooms.clear()
                                classroom.teacher.add(teacher)
                                messages.success(request, 'Successfully joined the classroom as a teacher!')
                            elif not ClassroomRequest.objects.filter(classroom=classroom, teacher=teacher).exists():
                                ClassroomRequest.objects.create(classroom=classroom, teacher=teacher)
                            else:
                                messages.warning(request, 'まだリクエストがアクセプトされていません。')
                        except ObjectDoesNotExist:
                            messages.error(request, 'User is neither a student nor a teacher.')
                else:
                    messages.error(request, 'Invalid classroom name.')
            except Classroom.DoesNotExist:
                messages.error(request, 'Classroom not found.')
        else:
            messages.error(request, 'Form is not valid.')

        return redirect('main:profile')


class ClassroomAcceptView(LoginRequiredMixin, View):
    def post(self, request, pk):
        response_data = {}
        try:
            classroom_request = ClassroomRequest.objects.get(pk=pk)
            teacher = classroom_request.teacher
            classroom = Classroom.objects.filter(teacher=teacher).first()

            if classroom_request.is_accepted:
                classroom_request.is_accepted = False
                if classroom_request.classroom == classroom:
                    open_room = Classroom.objects.get(name="open_room")
                    teacher.classrooms.clear()
                    open_room.teacher.add(teacher)
                response_data['status'] = 'Teacher removed from classroom'
            else:
                classroom_request.is_accepted = True
                response_data['status'] = 'Classroom request accepted'

            classroom_request.save()
            response_data['success'] = True
        except ClassroomRequest.DoesNotExist:
            response_data['success'] = False
            response_data['error'] = 'Classroom request not found'
        except Classroom.DoesNotExist:
            response_data['success'] = False
            response_data['error'] = 'Open room not found'
        except Exception as e:
            response_data['success'] = False
            response_data['error'] = str(e)

        return JsonResponse(response_data)





class ProfilePageView(LoginRequiredMixin, View):


    template_name = 'main/test.html'

    def get(self, request):

        user=request.user
        join_form = None
        if Student.objects.filter(user=user).exists() or Teacher.objects.filter(user=user).exists():
            join_form = ClassroomJoinForm()

        connect_form = ConnectTestForm()
        total_max_scores = request.user.total_max_scores
        profile_assets = get_profile_assets(total_max_scores)

        classroom = None

        try:
            student = Student.objects.get(user=user)
            classroom = Classroom.objects.filter(students=student).first()
            if not classroom:
                classroom = Classroom.objects.get(name="open_room")
                classroom.students.add(student)
        except Student.DoesNotExist:
            try:
                teacher = Teacher.objects.get(user=user)
                classroom = Classroom.objects.filter(teacher=teacher).first()
                if not classroom:
                    classroom = Classroom.objects.get(name="open_room")
                    classroom.students.add(student)
            except Teacher.DoesNotExist:
                raise Teacher.DoesNotExist("This user is somehow neither teacher nor student")

        return render(request, self.template_name, {
                'user': user,
                'join_form': join_form,
                'users': CustomUser.objects.all(),
                'schools': School.objects.all(),
                'school_form': SchoolCreateForm(),
                'test_form': TestCreateForm(),
                'question_form': QuestionCreateForm(),
                'option_form': OptionCreateForm(),
                'classroom_form': ClassroomCreateForm(),
                'connect_form': connect_form,
                'total_max_scores': total_max_scores,
                'profile_image': profile_assets['image'],
                'profile_text': profile_assets['text'],
                'profile_audio': profile_assets['audio'],
                'classroom': classroom,
            })




class StudentSignUpView(View):
    template_name = 'accounts/student_signup.html'

    def get(self, request):
        form = StudentSignUpForm()
        return render(request, self.template_name, {'form': form})

    def post(self, request):
        form = StudentSignUpForm(request.POST)

        username = request.POST.get('username')
        if CustomUser.objects.filter(username=username).exists():
            error_message = "このユーザネームはすでに使われている"
            return render(request, self.template_name, {'form': form, 'error_message': error_message})

        if len(username) > 10:
            error_message = "ユーザーネームは最大１０文字"
            return render(request, self.template_name, {'form': form, 'error_message': error_message})


        if form.is_valid():
            user = form.save()
            login(request, user)
            return redirect('/')
        else:
            error_message = "パスワードが一致してない"
            return render(request, self.template_name, {'form': form, 'error_message': error_message})
        return render(request, self.template_name, {'form': form})

class TeacherSignUpView(View):
    template_name = 'accounts/teacher_signup.html'

    def get(self, request):
        form = TeacherSignUpForm()

        return render(request, self.template_name, {'form': form})

    def post(self, request):
        form = TeacherSignUpForm(request.POST)

        username = request.POST.get('username')
        if CustomUser.objects.filter(username=username).exists():
            error_message = "A user with that username already exists."
            return render(request, self.template_name, {'form': form, 'error_message': error_message})


        if form.is_valid():
            school_name = form.cleaned_data.get('school_name')
            school_password = form.cleaned_data.get('school_password')

            try:
                school = School.objects.get(school_name=school_name, school_password=school_password)
            except School.DoesNotExist:
                error_message = "Invalid school name or password"
                return render(request, self.template_name, {'form': form, 'error_message': error_message})

            user = form.save()
            classroom = Classroom.objects.get(name='open_room')
            teacher =Teacher.objects.create(user=user, school=school)
            classroom.teacher.add(teacher)

            login(request, user)
            return redirect('/')

        else:
            error_message = "Passwords don't match."
            return render(request, self.template_name, {'form': form, 'error_message': error_message})

        return render(request, self.template_name, {'form': form})



class AccountDeleteView(LoginRequiredMixin, View):
    def post(self, request, pk):
        try:
            user = CustomUser.objects.get(pk=pk)
            user.delete()
            return JsonResponse({'status': 'success', 'message': 'Account deleted'})
        except ObjectDoesNotExist:
            return JsonResponse({'status': 'error', 'message': 'User not found'}, status=404)


class SchoolCreateView(LoginRequiredMixin, View):
    def post(self, request):
        form = SchoolCreateForm(request.POST, request.FILES or None)
        if form.is_valid():
            school = form.save(commit=False)
            school.save()
            return JsonResponse({'success': True})
        else:
            return JsonResponse({'success': False, 'errors': form.errors}, status=400)





class ClassroomCreateView(LoginRequiredMixin, View):
    def post(self, request):
        form = ClassroomCreateForm(request.POST, request.FILES or None)
        name = request.POST.get('name')
        if Classroom.objects.filter(name=name).exists():
            return redirect('main:profile')
        if form.is_valid():
            teacher = Teacher.objects.get(user=request.user)
            teacher.classrooms.clear()
            classroom = form.save(commit=False)
            classroom.save()
            classroom.teacher.add(teacher)
            ClassroomRequest.objects.create(teacher=teacher, classroom=classroom, is_accepted=True, unchangeable=True)
            return redirect('main:profile')


class TestCreateView(LoginRequiredMixin, View):
    def post(self, request, pk):
        try:
            data = request.POST.dict()
        except json.JSONDecodeError:
            return JsonResponse({'status': 'error', 'message': 'Invalid JSON'})

        form = TestCreateForm(data, request.FILES or None)
        classroom = get_object_or_404(Classroom, pk=pk)
        if form.is_valid():
            test = form.save(commit=False)
            test.save()
            test.classroom.add(classroom)
            response_data = {'status': 'success', 'message': 'Test created successfully!', 'classroom_pk': classroom.pk, 'id': test.pk, 'name': test.name}
        else:
            response_data = {'status': 'error', 'message': 'Form is not valid.', 'errors': form.errors, 'classroom_pk': classroom.pk}

        return JsonResponse(response_data)

class TestDeleteView(LoginRequiredMixin, View):

    def post(self, request, pk):
        test = get_object_or_404(Test, pk=pk)


        test.delete()


        response_data = {'status': 'success', 'pk': pk}
        return JsonResponse(response_data)

class QuestionCreateView(LoginRequiredMixin, View):
    def post(self, request, pk=None):
        try:
            data = request.POST.dict()
        except json.JSONDecodeError:
            return JsonResponse({'status': 'error', 'message': 'Invalid JSON'})

        form = QuestionCreateForm(data, request.FILES or None)
        test = get_object_or_404(Test, pk=pk)
        if form.is_valid():
            question = form.save(commit=False)
            question.test = test
            question.save()
            Option.objects.create(question=question, is_correct=True)
            if question.write_answer == False:
                for _ in range(3):
                    Option.objects.create(question=question, is_correct=False)

            total_question_number = Question.objects.filter(test=test).count()
            total_questions = total_question_number * test.score_multiplier
            test.total_questions = total_questions
            test.save()

            test.total_questions == total_questions


            response_data = {'success': True, 'test_pk': test.pk, 'id': question.pk, 'name': question.name, 'test_name': test.name}
            return JsonResponse(response_data)
        else:
            response_data = {'success': False, 'errors': form.errors, 'test_name': test.name, 'test_pk': test.pk}
            return JsonResponse(response_data, status=400)


class QuestionDeleteView(LoginRequiredMixin, View):

    def post(self, request, pk):
        question = get_object_or_404(Question, pk=pk)
        test = question.test


        question.delete()

        total_questions = Question.objects.filter(test=test).count() * test.score_multiplier
        test.total_questions = total_questions
        test.save()


        response_data = {'status': 'success', 'pk': pk}
        return JsonResponse(response_data)


class OptionCreateView(LoginRequiredMixin, View):
    def post(self, request, pk=None):
        try:
            data = request.POST.dict()
        except json.JSONDecodeError:
            return JsonResponse({'status': 'error', 'message': 'Invalid JSON'})

        form = OptionCreateForm(data, request.FILES or None)
        question = get_object_or_404(Question, pk=pk)
        if form.is_valid():
            option = form.save(commit=False)
            option.question = question
            option.save()
            response_data = {'success': True, 'question_pk': question.pk, 'pk': option.pk, 'name': option.name}
            return JsonResponse(response_data)
        else:
            response_data = {'success': False, 'errors': form.errors, 'question_pk': question.pk}
            return JsonResponse(response_data, status=400)

class OptionDeleteView(LoginRequiredMixin, View):

    def post(self, request, pk):
        option = get_object_or_404(Option, pk=pk)

        option.delete()

        response_data = {'status': 'success', 'pk': pk}
        return JsonResponse(response_data)



def school_stream_file(request, pk):

    school = get_object_or_404(School, id=pk)
    response = HttpResponse()
    response['Content-Type'] = school.school_content_type
    response['Content-Length'] = len(school.school_picture)
    response.write(school.school_picture)
    return response


def classroom_stream_file(request, pk):

    classroom = get_object_or_404(Classroom, id=pk)
    response = HttpResponse()
    response['Content-Type'] = classroom.classroom_content_type
    response['Content-Length'] = len(classroom.classroom_picture)
    response.write(classroom.classroom_picture)
    return response


def test_stream_file(request, pk):

    test = get_object_or_404(Test, id=pk)
    response = HttpResponse()
    response['Content-Type'] = test.test_content_type
    response['Content-Length'] = len(test.test_picture)
    response.write(test.test_picture)
    return response


def question_stream_file(request, pk):

    question = get_object_or_404(Question, id=pk)
    response = HttpResponse()
    response['Content-Type'] = question.question_content_type
    response['Content-Length'] = len(question.question_picture)
    response.write(question.question_picture)
    return response

def question_sound_file(request, pk):

    question = get_object_or_404(Question, id=pk)
    response = HttpResponse()
    response['Content-Type'] = question.question_sound_content_type
    response['Content-Length'] = len(question.question_sound)
    response.write(question.question_sound)
    return response


def option_stream_file(request, pk):

    option = get_object_or_404(Option, id=pk)
    response = HttpResponse()
    response['Content-Type'] = option.option_content_type
    response['Content-Length'] = len(option.option_picture)
    response.write(option.option_picture)
    return response


class TestAnswerView(View):
    def post(self, request, test_id, question_id):
        json_data = json.loads(request.body)
        selected_option_id = json_data.get('selected_option')

        try:
            test = Test.objects.get(pk=test_id)
            question = Question.objects.get(pk=question_id, test=test)

            try:
                selected_option = Option.objects.get(pk=selected_option_id, question=question)
            except Option.DoesNotExist:
                selected_option = None

            correct_option = Option.objects.get(question=question, is_correct=True)

            if selected_option:
                score = 1 if selected_option.is_correct else 0
            else:
                score = 0

            UserTestSubmission.objects.create(
                user=request.user,
                test=test,
                question=question,
                selected_option=selected_option,
                score=score,
            )

            if selected_option:
                message = 'Correct answer' if selected_option.is_correct else f'Correct option: {correct_option.name}'
            else:
                message = f'Correct option: {correct_option.name}'


            return JsonResponse({'success': True, 'message': message})

        except (Test.DoesNotExist, Question.DoesNotExist, Option.DoesNotExist) as e:
            return JsonResponse({'success': False, 'error': str(e)}, status=404)
        except Exception as e:
            return JsonResponse({'success': False, 'error': str(e)}, status=500)


class TestRecordView(View):
    def post(self, request, pk):
        test = get_object_or_404(Test, pk=pk)
        total_questions = test.total_questions
        user = request.user

        TestRecordView.activation_counter += 1
        group_id = TestRecordView.activation_counter
        current_time = timezone.now().strftime('%Y-%m-%d %H:%M')

        user_test_submissions = UserTestSubmission.objects.filter(user=user, test=test)

        total_score = sum(user_test_submission.score for user_test_submission in user_test_submissions)
        total_score = int(total_score)
        total_questions = 0
        for user_test_submission in user_test_submissions:
            total_questions += 1
        account_sessions = Sessions.objects.create(number=test.pk, user=user, session_name=test.name, timestamp=current_time, total_recorded_score=total_score, total_questions=total_questions)
        try:
            maxscore = MaxScore.objects.get(user=user, test=test)
            if maxscore.score < total_score:
                maxscore.delete()
                MaxScore.objects.create(user=user, test=test, score=total_score, total_questions=total_questions)
        except ObjectDoesNotExist:
            MaxScore.objects.create(user=user, test=test, score=total_score, total_questions=total_questions)
        test_record_ids = []

        total_max_scores = MaxScore.objects.filter(user=user).aggregate(total_score=Sum('score'))['total_score'] or 0
        user.total_max_scores = total_max_scores
        user.save()

        tests = Test.objects.filter(category=test.category)
        total_category_score = MaxScore.objects.filter(test__in=tests, user=user).aggregate(total_score=Sum('score'))['total_score'] or 0

        if test.category == 'japanese':
            user.total_japanese_score = total_category_score
        elif test.category == 'english_5':
            user.total_english_5_score = total_category_score
        elif test.category == 'english_6':
            user.total_english_6_score = total_category_score
        elif test.category == 'phonics':
            user.total_phonics_score = total_category_score
        elif test.category == 'numbers':
            user.total_numbers_score = total_category_score

        user.save()



        for user_test_submission in user_test_submissions:
            try:
                question_name = str(user_test_submission.selected_option.question.name)
            except:
                question_name = ''
            try:
                selected_option_name = str(user_test_submission.selected_option.name)
            except:
                selected_option_name = ''
            recorded_score = int(user_test_submission.score)
            question = user_test_submission.question

            test_record = TestRecords.objects.create(
                user=user,
                test=test,
                question=question,
                question_name=question_name,
                selected_option_name=selected_option_name,
                recorded_score=recorded_score,
                group_id=group_id,
                account_sessions=account_sessions
            )

            test_record_ids.append(test_record.id)


        total_score_record = TestRecords.objects.create(
            user=user,
            test=test,
            total_recorded_score=total_score,
            group_id=group_id,
            account_sessions=account_sessions
        )

        test_record_ids.append(total_score_record.id)
        user_test_submissions.delete()

        response_data = {
            'success': True,
            'message': f'Total score: {total_score}/{total_questions}!',
            'test_record_ids': test_record_ids
        }

        return JsonResponse(response_data)
TestRecordView.activation_counter = 0



class ScoreRecordView(View):
    def post(self, request, pk):
        json_data = json.loads(request.body)
        score_data = json_data.get('score')
        test = get_object_or_404(Test, pk=pk)
        user = request.user
        score = score_data * test.score_multiplier

        total_score = test.total_score
        try:
            maxscore = MaxScore.objects.get(user=user, test=test)
            if maxscore.score < score:
                maxscore.delete()
                MaxScore.objects.create(user=user, test=test, score=score, total_questions=total_score)
        except ObjectDoesNotExist:
            MaxScore.objects.create(user=user, test=test, score=score, total_questions=total_score)

        total_max_scores = MaxScore.objects.filter(user=user).aggregate(total_score=Sum('score'))['total_score'] or 0

        tests = Test.objects.filter(category=test.category)
        total_category_score = MaxScore.objects.filter(test__in=tests, user=user).aggregate(total_score=Sum('score'))['total_score'] or 0

        if test.category == 'japanese':
            user.total_japanese_score = total_category_score
        elif test.category == 'english_5':
            user.total_english_5_score = total_category_score
        elif test.category == 'english_6':
            user.total_english_6_score = total_category_score
        elif test.category == 'phonics':
            user.total_phonics_score = total_category_score
        elif test.category == 'numbers':
            user.total_numbers_score = total_category_score
        elif test.category == 'eiken':
            user.total_eiken_score = total_category_score

        user.save()
        user.total_max_scores = total_max_scores - user.total_eiken_score
        if user.username == 'ivar':
            user.total_max_scores = 9999
        user.save()


        response_data = {'success': True, 'message': f'点数: {score}/{total_score}!'}

        return JsonResponse(response_data)

class TestsubmissionsDeleteView(View):
    def post(self, request):
        user_test_submissions = UserTestSubmission.objects.filter(user=request.user)


        user_test_submissions.delete()



        response_data = {
            'success': True,
        }

        return JsonResponse(response_data)

class UpdateAllTestsView(View):
    def post(self, request):
        tests = Test.objects.all()
        for test in tests:
            test.save()
        return redirect('main:profile')