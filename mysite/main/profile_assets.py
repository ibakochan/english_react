from .models import Question, MaxScore
from django.db.models import Sum

def get_profile_assets(total_max_scores):
    level = total_max_scores // 20

    assets = {
        0: {"image": "https://storage.googleapis.com/profile_assets/OIG1.PHUIW02Q63fP.jpeg", "text": "泣くことしかできない生まれたての赤ちゃんです", "audio": "https://storage.googleapis.com/profile_assets/2024_10_28_13_01_19_1.mp3"},
        1: {"image": "https://storage.googleapis.com/profile_assets/OIG1.jpeg", "text": "MamaとIvar殿しか言えない赤ちゃんです", "audio": "https://storage.googleapis.com/profile_assets/2024_10_28_13_01_31_1.mp3"},
        2: {"image": "https://storage.googleapis.com/profile_assets/OIG3.jpeg", "text": "なんとなく歩けるようになった子供だ", "audio": "https://storage.googleapis.com/profile_assets/2024_10_29_15_52_45_1.mp3"},
        3: {"image": "https://storage.googleapis.com/profile_assets/OIG2%20(1).jpeg", "text": "絵本を読めるようになった", "audio": "https://storage.googleapis.com/profile_assets/2024_10_29_15_52_53_1.mp3"},
        4: {"image": "https://storage.googleapis.com/profile_assets/OIG4.jpeg", "text": "自分が強いと思ってるけど、実はまだまだあまい！", "audio": "https://storage.googleapis.com/profile_assets/2024_10_29_15_53_00_1.mp3"},
        5: {"image": "https://storage.googleapis.com/profile_assets/OIG2.tae9p.jpeg", "text": "弱い先生ならたまに腕相撲で勝てる", "audio": "https://storage.googleapis.com/profile_assets/2024_10_29_15_54_58_1.mp3"},
        6: {"image": "https://storage.googleapis.com/profile_assets/OIG4%20(1).jpeg", "text": "一般的な少年として口から火出せる", "audio": "https://storage.googleapis.com/profile_assets/2024_10_29_15_56_57_1.mp3"},
        7: {"image": "https://storage.googleapis.com/profile_assets/OIG2.ST0Mq.jpeg", "text": "一般的な大人です。握力５００キロ", "audio": "https://storage.googleapis.com/profile_assets/2024_10_29_15_57_34_1.mp3"},
        8: {"image": "https://storage.googleapis.com/profile_assets/OIG1%20(1).jpeg", "text": "ちょっとヒーローぽい存在", "audio": "https://storage.googleapis.com/profile_assets/2024_10_29_16_07_09_1.mp3"},
        9: {"image": "https://storage.googleapis.com/profile_assets/OIG2%20(2).jpeg", "text": "雷の力を持つ本物のヒーロー", "audio": "https://storage.googleapis.com/profile_assets/2024_10_29_15_58_51_1.mp3"},
        10: {"image": "https://storage.googleapis.com/profile_assets/OIG3%20(1).jpeg", "text": "雷とレーザーの力を持つ本物のヒーロー", "audio": "https://storage.googleapis.com/profile_assets/2024_10_29_16_00_03_1.mp3"},
        11: {"image": "https://storage.googleapis.com/profile_assets/OIG2%20(3).jpeg", "text": "地球を１秒で破壊できる侍", "audio": "https://storage.googleapis.com/profile_assets/2024_10_29_16_04_48_1.mp3"},
        12: {"image": "https://storage.googleapis.com/profile_assets/OIG3%20(2).jpeg", "text": "宇宙のすべてを１秒で破壊できる存在", "audio": "https://storage.googleapis.com/profile_assets/2024_10_29_16_05_21_1.mp3"},
        13: {"image": "https://storage.googleapis.com/profile_assets/WhatsApp%E7%94%BB%E5%83%8F%202024-02-14%2013.27.37_9343389c%20(2).jpg", "text": "このサイトの理解を超えてる存在", "audio": "https://storage.googleapis.com/profile_assets/sound13.mp3"},
    }

    if total_max_scores >= 280:
        return assets[13]
    else:
        return assets.get(level, assets[max(assets)])

def get_memories(total_max_scores):
    levels = int(total_max_scores // 20)

    memories = {
        1: {"image": "https://storage.googleapis.com/profile_assets/a-baby.png", "text": "泣くことしかできない生まれたての赤ちゃんです", "audio": "https://storage.googleapis.com/profile_assets/2024_10_28_13_01_19_1.mp3"},
        2: {"image": "https://storage.googleapis.com/profile_assets/b-baby.png", "text": "MamaとIvar殿しか言えない赤ちゃんです", "audio": "https://storage.googleapis.com/profile_assets/2024_10_28_13_01_31_1.mp3"},
        3: {"image": "https://storage.googleapis.com/profile_assets/c-walking.png", "text": "なんとなく歩けるようになった子供だ", "audio": "https://storage.googleapis.com/profile_assets/2024_10_29_15_52_45_1.mp3"},
        4: {"image": "https://storage.googleapis.com/profile_assets/d-reading.png", "text": "絵本を読めるようになった", "audio": "https://storage.googleapis.com/profile_assets/2024_10_29_15_52_53_1.mp3"},
        5: {"image": "https://storage.googleapis.com/profile_assets/e-amai.png", "text": "自分が強いと思ってるけど、実はまだまだあまい！", "audio": "https://storage.googleapis.com/profile_assets/2024_10_29_15_53_00_1.mp3"},
        6: {"image": "https://storage.googleapis.com/profile_assets/f-armwrestler.png", "text": "弱い先生ならたまに腕相撲で勝てる", "audio": "https://storage.googleapis.com/profile_assets/2024_10_29_15_54_58_1.mp3"},
        7: {"image": "https://storage.googleapis.com/profile_assets/g-flames.png", "text": "一般的な少年として口から火出せる", "audio": "https://storage.googleapis.com/profile_assets/2024_10_29_15_56_57_1.mp3"},
        8: {"image": "https://storage.googleapis.com/profile_assets/h-adult.png", "text": "一般的な大人です。握力５００キロ", "audio": "https://storage.googleapis.com/profile_assets/2024_10_29_15_57_34_1.mp3"},
        9: {"image": "https://storage.googleapis.com/profile_assets/i-hero.png", "text": "ちょっとヒーローぽい存在", "audio": "https://storage.googleapis.com/profile_assets/2024_10_29_16_07_09_1.mp3"},
        10: {"image": "https://storage.googleapis.com/profile_assets/j-lightning.png", "text": "雷の力を持つ本物のヒーロー", "audio": "https://storage.googleapis.com/profile_assets/2024_10_29_15_58_51_1.mp3"},
        11: {"image": "https://storage.googleapis.com/profile_assets/k-lazer.png", "text": "雷とレーザーの力を持つ本物のヒーロー", "audio": "https://storage.googleapis.com/profile_assets/2024_10_29_16_00_03_1.mp3"},
        12: {"image": "https://storage.googleapis.com/profile_assets/l-earth.png", "text": "地球を１秒で破壊できる侍", "audio": "https://storage.googleapis.com/profile_assets/2024_10_29_16_04_48_1.mp3"},
        13: {"image": "https://storage.googleapis.com/profile_assets/m-universe.png", "text": "宇宙のすべてを１秒で破壊できる存在", "audio": "https://storage.googleapis.com/profile_assets/2024_10_29_16_05_21_1.mp3"},
    }
    result = {level: memories[level] for level in range(1, levels + 1) if level in memories}
    return result

def get_total_questions():
    question_counts = {
        "total_japanese_questions": Question.objects.filter(test__category='japanese').count(),
        "total_english_5_questions": Question.objects.filter(test__category='english_5').count(),
        "total_english_6_questions": Question.objects.filter(test__category='english_6').count(),
        "total_phonics_questions": Question.objects.filter(test__category='phonics').count(),
        "total_numbers_questions": Question.objects.filter(test__category='numbers').count(),
    }
    return question_counts

def get_total_category_scores(user):
    total_category_scores = {
        "total_japanese_scores": MaxScore.objects.filter(user=user, test__category='japanese').aggregate(total_score=Sum('score'))['total_score'] or 0,
        "total_english_5_scores": MaxScore.objects.filter(user=user, test__category='english_5').aggregate(total_score=Sum('score'))['total_score'] or 0,
        "total_english_6_scores": MaxScore.objects.filter(user=user, test__category='english_6').aggregate(total_score=Sum('score'))['total_score'] or 0,
        "total_phonics_scores": MaxScore.objects.filter(user=user, test__category='phonics').aggregate(total_score=Sum('score'))['total_score'] or 0,
        "total_numbers_scores": MaxScore.objects.filter(user=user, test__category='numbers').aggregate(total_score=Sum('score'))['total_score'] or 0,
    }
    return total_category_scores