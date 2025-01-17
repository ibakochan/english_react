from .models import Test, Question, MaxScore
from django.db.models import Sum

def get_profile_assets(total_max_scores):
    level = total_max_scores // 20




    assets = {
        0: {"english_audio": "https://storage.googleapis.com/profile_assets/2024_10_28_13_01_19_1.mp3", "image": "https://storage.googleapis.com/profile_assets/a-crying.jpeg", "text": "泣くことしかできない生まれたての赤ちゃんです", "english_text" : "are a baby that can do nothing but cry", "audio": "https://storage.googleapis.com/profile_assets/2024_10_28_13_01_19_1.mp3"},
        1: {"english_audio": "https://storage.googleapis.com/profile_assets/2024_12_07_18_58_04_1.mp3", "image": "https://storage.googleapis.com/profile_assets/b-mamaivar.jpeg", "text": "MamaとIvar殿しか言えない赤ちゃんです", "english_text" : "are a baby that can only say Mama and Ivar", "audio": "https://storage.googleapis.com/profile_assets/2024_10_28_13_01_31_1.mp3"},
        2: {"english_audio": "https://storage.googleapis.com/profile_assets/2024_12_07_18_58_11_1.mp3", "image": "https://storage.googleapis.com/profile_assets/c-walkingwalking.jpeg", "text": "なんとなく歩けるようになった子供だ", "english_text" : "have just learned how to walk", "audio": "https://storage.googleapis.com/profile_assets/2024_10_29_15_52_45_1.mp3"},
        3: {"english_audio": "https://storage.googleapis.com/profile_assets/2024_12_07_18_58_19_1.mp3", "image": "https://storage.googleapis.com/profile_assets/crayon.jpeg", "text": "お描きできるようになった", "english_text" : "have just learned how to draw pictures", "audio": "https://storage.googleapis.com/profile_assets/2024_11_16_11_40_45_1.mp3"},
        4: {"english_audio": "https://storage.googleapis.com/profile_assets/2024_12_07_18_58_30_1.mp3", "image": "https://storage.googleapis.com/profile_assets/d-read.jpeg", "text": "絵本を読めるようになった", "english_text" : "have just learned how to read picture books", "audio": "https://storage.googleapis.com/profile_assets/2024_10_29_15_52_53_1.mp3"},
        5: {"english_audio": "https://storage.googleapis.com/profile_assets/2024_12_07_18_59_01_1.mp3", "image": "https://storage.googleapis.com/profile_assets/math.png", "text": "算数できるようになった", "english_text" : "have just learned how to do simple math", "audio": "https://storage.googleapis.com/profile_assets/2024_11_16_11_41_52_1.mp3"},
        6: {"english_audio": "https://storage.googleapis.com/profile_assets/2024_12_07_18_59_17_1.mp3", "image": "https://storage.googleapis.com/profile_assets/boxing_boy.jpeg", "text": "パンチできるようになったけど、あまり威力ないな", "english_text" : "have just learned how to punch, still pretty weak though", "audio": "https://storage.googleapis.com/profile_assets/2024_11_16_11_43_39_1.mp3"},
        7: {"english_audio": "https://storage.googleapis.com/profile_assets/2024_12_07_18_59_25_1.mp3", "image": "https://storage.googleapis.com/profile_assets/e-ama.jpeg", "text": "自分が強いと思ってるけど、実はまだまだあまい！", "english_text" : "think you are strong but the truth is you are still naive", "audio": "https://storage.googleapis.com/profile_assets/2024_10_29_15_53_00_1.mp3"},
        8: {"english_audio": "https://storage.googleapis.com/profile_assets/2024_12_07_18_59_34_1.mp3", "image": "https://storage.googleapis.com/profile_assets/rocklift.png", "text": "５０キロの岩持ち上げれるようになった", "english_text" : "have just become able to lift a 50kg stone", "audio": "https://storage.googleapis.com/profile_assets/2024_11_16_11_44_57_1.mp3"},
        9: {"english_audio": "https://storage.googleapis.com/profile_assets/2024_11_16_11_46_02_1.mp3", "image": "https://storage.googleapis.com/profile_assets/ninja.png", "text": "アニメ見すぎて、自分が忍者だと思い込んでしまった", "english_text" : "watched too much anime and now you think you are a ninja", "audio": "https://storage.googleapis.com/profile_assets/2024_11_16_11_46_02_1.mp3"},
        10: {"english_audio": "https://storage.googleapis.com/profile_assets/2024_12_07_19_00_18_1.mp3", "image": "https://storage.googleapis.com/profile_assets/f-arm.jpeg", "text": "弱い先生ならたまに腕相撲で勝てる", "english_text" : "can beat weak teachers in armwrestling", "audio": "https://storage.googleapis.com/profile_assets/2024_10_29_15_54_58_1.mp3"},
        11: {"english_audio": "https://storage.googleapis.com/profile_assets/2024_12_07_19_00_35_1.mp3", "image": "https://storage.googleapis.com/profile_assets/g-fire.jpeg", "text": "一般的な少年として口から火出せる", "english_text" : "can breathe fire like most normal boys can", "audio": "https://storage.googleapis.com/profile_assets/2024_10_29_15_56_57_1.mp3"},
        12: {"english_audio": "https://storage.googleapis.com/profile_assets/2024_12_07_19_00_46_1.mp3", "image": "https://storage.googleapis.com/profile_assets/rock_smash.png", "text": "パンチで岩を壊せる", "english_text" : "can destroy rocks with your punches", "audio": "https://storage.googleapis.com/profile_assets/2024_11_16_11_48_47_1.mp3"},
        13: {"english_audio": "https://storage.googleapis.com/profile_assets/2024_12_07_19_01_05_1.mp3", "image": "https://storage.googleapis.com/profile_assets/soap_bubbles.png", "text": "シャボン玉攻撃できるようになった", "english_text" : "can now use soap bubble attacks", "audio": "https://storage.googleapis.com/profile_assets/2024_11_16_11_49_58_1.mp3"},
        14: {"english_audio": "https://storage.googleapis.com/profile_assets/2024_12_07_19_01_17_1.mp3", "image": "https://storage.googleapis.com/profile_assets/h-grown.jpeg", "text": "一般的な大人です。握力５００キロ", "english_text" : "are a normal adult with a grip strenght of 500kg", "audio": "https://storage.googleapis.com/profile_assets/2024_10_29_15_57_34_1.mp3"},
        15: {"english_audio": "https://storage.googleapis.com/profile_assets/2024_12_07_19_01_28_1.mp3", "image": "https://storage.googleapis.com/profile_assets/sun.png", "text": "勉強の成果で小さい太陽作れるようになった", "english_text" : "have from your intense studies learned how to make a sun", "audio": "https://storage.googleapis.com/profile_assets/2024_11_16_11_52_29_1.mp3"},
        16: {"english_audio": "https://storage.googleapis.com/profile_assets/2024_12_07_19_01_41_1.mp3", "image": "https://storage.googleapis.com/profile_assets/firewolf.png", "text": "この可愛いペットを乗れるようになった", "english_text" : "are now able to ride this cute pet", "audio": "https://storage.googleapis.com/profile_assets/2024_11_16_11_57_07_1.mp3"},
        17: {"english_audio": "https://storage.googleapis.com/profile_assets/2024_12_07_19_01_51_1.mp3", "image": "https://storage.googleapis.com/profile_assets/i-mukimuki.jpeg", "text": "ちょっとヒーローぽい存在", "english_text" : "are a bit like a hero now", "audio": "https://storage.googleapis.com/profile_assets/2024_10_29_16_07_09_1.mp3"},
        18: {"english_audio": "https://storage.googleapis.com/profile_assets/2024_12_07_19_02_02_1.mp3", "image": "https://storage.googleapis.com/profile_assets/j-electricity.jpeg", "text": "雷の力を持つ本物のヒーロー", "english_text" : "are now a true hero with the power of lightning", "audio": "https://storage.googleapis.com/profile_assets/2024_10_29_15_58_51_1.mp3"},
        19: {"english_audio": "https://storage.googleapis.com/profile_assets/2024_12_07_19_02_21_1.mp3", "image": "https://storage.googleapis.com/profile_assets/blackhole.png", "text": "勉強の成果で小さいブラックホール作れるようになった", "english_text" : "have from your intense studies learned how to make a black hole", "audio": "https://storage.googleapis.com/profile_assets/2024_11_16_11_58_39_1.mp3"},
        20: {"english_audio": "https://storage.googleapis.com/profile_assets/2024_12_07_19_02_33_1.mp3", "image": "https://storage.googleapis.com/profile_assets/k-superhero.jpeg", "text": "雷とレーザーの力を持つ本物のヒーロー", "english_text" : "are a true hero with the power of lightning and lazer", "audio": "https://storage.googleapis.com/profile_assets/2024_10_29_16_00_03_1.mp3"},
        21: {"english_audio": "https://storage.googleapis.com/profile_assets/2024_12_07_19_02_42_1.mp3", "image": "https://storage.googleapis.com/profile_assets/beardman.png", "text": "髭生やしてさらに強くなった", "english_text" : "have gained even more power by growing your beard", "audio": "https://storage.googleapis.com/profile_assets/2024_11_16_11_59_54_1.mp3"},
        22: {"english_audio": "https://storage.googleapis.com/profile_assets/2024_12_07_19_02_57_1.mp3", "image": "https://storage.googleapis.com/profile_assets/l-samurai.jpeg", "text": "地球を１秒で破壊できる侍", "english_text" : "are a samurai that can destroy the earth in 1 second", "audio": "https://storage.googleapis.com/profile_assets/2024_10_29_16_04_48_1.mp3"},
        23: {"english_audio": "https://storage.googleapis.com/profile_assets/2024_12_07_19_03_08_1.mp3", "image": "https://storage.googleapis.com/profile_assets/neutronstar.png", "text": "普段から朝ごはんに中性子星を食べる", "english_text" : "eat neutronstars for breakfast", "audio": "https://storage.googleapis.com/profile_assets/2024_11_16_12_00_40_1.mp3"},
        24: {"english_audio": "https://storage.googleapis.com/profile_assets/2024_12_07_19_03_21_1.mp3", "image": "https://storage.googleapis.com/profile_assets/blackholedrinker.png", "text": "喉乾いたときブラックホールをストローで飲む", "english_text" : "drink blackholes with a straw whenever you are thirsty", "audio": "https://storage.googleapis.com/profile_assets/2024_11_16_12_02_15_1.mp3"},
        25: {"english_audio": "https://storage.googleapis.com/profile_assets/2024_12_07_19_03_31_1.mp3", "image": "https://storage.googleapis.com/profile_assets/m-uni.jpeg", "text": "宇宙のすべてを１秒で破壊できる存在", "english_text" : "are a being that can destroy the whole universe in 1 second", "audio": "https://storage.googleapis.com/profile_assets/2024_10_29_16_05_21_1.mp3"},
        26: {"english_audio": "https://storage.googleapis.com/ivar_reactions/2024_12_07_19_36_49_1.mp3", "image": "https://storage.googleapis.com/profile_assets/n-ivar.jpg", "text": "このサイトの理解を超えてる存在", "english_text" : "are a being that is beyond the comprehension of this site", "audio": "https://storage.googleapis.com/ivar_reactions/sound13%20(1).mp3"},
    }


    if total_max_scores >= 540:
        return assets[26]
    else:
        return assets.get(level, assets[max(assets)])

def get_eiken_pet(total_eiken_scores):
    levels = int(total_eiken_scores // 50)

    pets = {
        0: {"image": 'https://storage.googleapis.com/profile_pets/one_cell.png', "text": 'まだ細胞一つしかない生物', "audio": 'https://storage.googleapis.com/profile_pets/2024_12_23_12_14_25_1.mp3', "english_text": 'still only a one celled organism'},
        1: {"image": 'https://storage.googleapis.com/profile_pets/multi_cell.png', "text": '複数の細胞からできている生物', "audio": 'https://storage.googleapis.com/profile_pets/2024_12_23_12_14_35_1.mp3', "english_text": 'an organism made up of multiple cells'},
        2: {"image": 'https://storage.googleapis.com/profile_pets/plancton.png', "text": 'プランクトンまで進化した', "audio": 'https://storage.googleapis.com/profile_pets/2024_12_23_12_14_47_1.mp3', "english_text": 'has evolved into a plancton'},
        3: {"image": 'https://storage.googleapis.com/profile_pets/tiny_fish.png', "text": '少し泳げる小さな魚', "audio": 'https://storage.googleapis.com/profile_pets/2024_12_23_12_14_55_1.mp3', "english_text": 'a tiny fish that can swim a little bit'},
        4: {"image": 'https://storage.googleapis.com/profile_pets/turtle.png', "text": '地上で歩ける亀', "audio": 'https://storage.googleapis.com/profile_pets/2024_12_23_12_16_47_1.mp3', "english_text": 'a turtle that can walk on land'},
        5: {"image": 'https://storage.googleapis.com/profile_pets/mouse.png', "text": 'チーズを食べれるネズミ', "audio": 'https://storage.googleapis.com/profile_pets/2024_12_23_12_17_16_1.mp3', "english_text": 'a mouse that can eat cheese'},
        6: {"image": 'https://storage.googleapis.com/profile_pets/squirel.png', "text": '木を登ってナッツを食べることができるリス', "audio": 'https://storage.googleapis.com/profile_pets/2025_01_13_19_17_26_1.mp3', "english_text": 'a squirrel that can climb trees and eat nuts'},
        7: {"image": 'https://storage.googleapis.com/profile_pets/hedge_hog.jpeg', "text": '普通のハリネズミ', "audio": 'https://storage.googleapis.com/profile_pets/2025_01_13_19_18_19_1.mp3', "english_text": 'a regular hedge hog'},
        8: {"image": 'https://storage.googleapis.com/profile_pets/rabbit.png', "text": 'IQ１２０のウサギ', "audio": 'https://storage.googleapis.com/profile_pets/2025_01_13_19_46_16_1.mp3', "english_text": 'a rabbit with in IQ of 120'},
        9: {"image": 'https://storage.googleapis.com/profile_pets/frog.png', "text": 'イバルの里で修行を受けたカエル', "audio": 'https://storage.googleapis.com/profile_pets/2025_01_13_22_40_21_1.mp3', "english_text": 'a frog that has been trained in The Village Of Ivar'},
        10: {"image": 'https://storage.googleapis.com/profile_pets/lesser_panda.png', "text": 'ちょっとオーラがあるレッサーパンダ', "audio": 'https://storage.googleapis.com/profile_pets/2025_01_13_22_40_44_1.mp3', "english_text": 'a lesser panda with a bit of aura'},
    }


    return pets.get(levels, pets[max(pets)])

def get_eiken_memories(total_eiken_scores):
    levels = int(total_eiken_scores // 50)

    pets = {
        1: {"image": 'https://storage.googleapis.com/profile_pets/one_cellframe.png', "text": 'まだ細胞一つしかない生物', "audio": 'https://storage.googleapis.com/profile_pets/2024_12_23_12_14_25_1.mp3', "english_text": 'still only a one celled organism'},
        2: {"image": 'https://storage.googleapis.com/profile_pets/multi_cellframe.png', "text": '複数の細胞からできている生物', "audio": 'https://storage.googleapis.com/profile_pets/2024_12_23_12_14_35_1.mp3', "english_text": 'an organism made up of multiple cells'},
        3: {"image": 'https://storage.googleapis.com/profile_pets/planctonframe.png', "text": 'プランクトンまで進化した', "audio": 'https://storage.googleapis.com/profile_pets/2024_12_23_12_14_47_1.mp3', "english_text": 'has evolved into a plancton'},
        4: {"image": 'https://storage.googleapis.com/profile_pets/tiny_fishframe.png', "text": '少し泳げる小さな魚', "audio": 'https://storage.googleapis.com/profile_pets/2024_12_23_12_14_55_1.mp3', "english_text": 'a tiny fish that can swim a little bit'},
        5: {"image": 'https://storage.googleapis.com/profile_pets/turtleframe.png', "text": '地上で歩ける亀', "audio": 'https://storage.googleapis.com/profile_pets/2024_12_23_12_16_47_1.mp3', "english_text": 'a turtle that can walk on land'},
        6: {"image": 'https://storage.googleapis.com/profile_pets/mouseframe.png', "text": 'チーズを食べれるネズミ', "audio": 'https://storage.googleapis.com/profile_pets/2024_12_23_12_17_16_1.mp3', "english_text": 'a mouse that can eat cheese'},
        7: {"image": 'https://storage.googleapis.com/profile_pets/squirelframe.png', "text": '木を登ってナッツを食べることができるリス', "audio": 'https://storage.googleapis.com/profile_pets/2025_01_13_19_17_26_1.mp3', "english_text": 'a squirrel that can climb trees and eat nuts'},
        8: {"image": 'https://storage.googleapis.com/profile_pets/hedge_hogframe.png', "text": '普通のハリネズミ', "audio": 'https://storage.googleapis.com/profile_pets/2025_01_13_19_18_19_1.mp3', "english_text": 'a regular hedge hog'},
        9: {"image": 'https://storage.googleapis.com/profile_pets/rabbitframe.png', "text": 'IQ１２０のウサギ', "audio": 'https://storage.googleapis.com/profile_pets/2025_01_13_19_46_16_1.mp3', "english_text": 'a rabbit with in IQ of 120'},
        10: {"image": 'https://storage.googleapis.com/profile_pets/frogframe.png', "text": 'イバルの里で修行を受けたカエル', "audio": 'https://storage.googleapis.com/profile_pets/2025_01_13_22_40_21_1.mp3', "english_text": 'a frog that has been trained in The Village Of Ivar'},
    }


    result = {level: pets[level] for level in range(1, levels + 1) if level in pets}
    return result

def get_memories(total_max_scores):
    levels = int(total_max_scores // 20)

    memories = {
        1: {"english_audio": "https://storage.googleapis.com/profile_assets/2024_10_28_13_01_19_1.mp3", "image": "https://storage.googleapis.com/profile_assets/a-baby.png", "text": "泣くことしかできない生まれたての赤ちゃんです", "audio": "https://storage.googleapis.com/profile_assets/2024_10_28_13_01_19_1.mp3"},
        2: {"english_audio": "https://storage.googleapis.com/profile_assets/2024_12_07_18_58_04_1.mp3", "image": "https://storage.googleapis.com/profile_assets/b-baby.png", "text": "MamaとIvar殿しか言えない赤ちゃんです", "audio": "https://storage.googleapis.com/profile_assets/2024_10_28_13_01_31_1.mp3"},
        3: {"english_audio": "https://storage.googleapis.com/profile_assets/2024_12_07_18_58_11_1.mp3", "image": "https://storage.googleapis.com/profile_assets/c-walking.png", "text": "なんとなく歩けるようになった子供だ", "audio": "https://storage.googleapis.com/profile_assets/2024_10_29_15_52_45_1.mp3"},
        4: {"english_audio": "https://storage.googleapis.com/profile_assets/2024_12_07_18_58_19_1.mp3", "image": "https://storage.googleapis.com/profile_assets/drawing_frame.png", "text": "お描きできるようになった", "audio": "https://storage.googleapis.com/profile_assets/2024_11_16_11_40_45_1.mp3"},
        5: {"english_audio": "https://storage.googleapis.com/profile_assets/2024_12_07_18_58_30_1.mp3", "image": "https://storage.googleapis.com/profile_assets/d-reading.png", "text": "絵本を読めるようになった", "audio": "https://storage.googleapis.com/profile_assets/2024_10_29_15_52_53_1.mp3"},
        6: {"english_audio": "https://storage.googleapis.com/profile_assets/2024_12_07_18_59_01_1.mp3", "image": "https://storage.googleapis.com/profile_assets/math_frame.png", "text": "算数できるようになった", "audio": "https://storage.googleapis.com/profile_assets/2024_11_16_11_41_52_1.mp3"},
        7: {"english_audio": "https://storage.googleapis.com/profile_assets/2024_12_07_18_59_17_1.mp3", "image": "https://storage.googleapis.com/profile_assets/boxing_frame.png", "text": "パンチできるようになったけど、あまり威力ないな", "audio": "https://storage.googleapis.com/profile_assets/2024_11_16_11_43_39_1.mp3"},
        8: {"english_audio": "https://storage.googleapis.com/profile_assets/2024_12_07_18_59_25_1.mp3", "image": "https://storage.googleapis.com/profile_assets/e-amai.png", "text": "自分が強いと思ってるけど、実はまだまだあまい！", "audio": "https://storage.googleapis.com/profile_assets/2024_10_29_15_53_00_1.mp3"},
        9: {"english_audio": "https://storage.googleapis.com/profile_assets/2024_12_07_18_59_34_1.mp3", "image": "https://storage.googleapis.com/profile_assets/rock_frame.png", "text": "５０キロの岩持ち上げれるようになった", "audio": "https://storage.googleapis.com/profile_assets/2024_11_16_11_44_57_1.mp3"},
        10: {"english_audio": "https://storage.googleapis.com/profile_assets/2024_11_16_11_46_02_1.mp3", "image": "https://storage.googleapis.com/profile_assets/ninja_frame.png", "text": "アニメ見すぎて、自分が忍者だと思い込んでしまった", "audio": "https://storage.googleapis.com/profile_assets/2024_11_16_11_46_02_1.mp3"},
        11: {"english_audio": "https://storage.googleapis.com/profile_assets/2024_12_07_19_00_18_1.mp3", "image": "https://storage.googleapis.com/profile_assets/f-armwrestler.png", "text": "弱い先生ならたまに腕相撲で勝てる", "audio": "https://storage.googleapis.com/profile_assets/2024_10_29_15_54_58_1.mp3"},
        12: {"english_audio": "https://storage.googleapis.com/profile_assets/2024_12_07_19_00_35_1.mp3", "image": "https://storage.googleapis.com/profile_assets/g-flames.png", "text": "一般的な少年として口から火出せる", "audio": "https://storage.googleapis.com/profile_assets/2024_10_29_15_56_57_1.mp3"},
        13: {"english_audio": "https://storage.googleapis.com/profile_assets/2024_12_07_19_00_46_1.mp3", "image": "https://storage.googleapis.com/profile_assets/rocksmash_frame.png", "text": "パンチで岩を壊せる", "audio": "https://storage.googleapis.com/profile_assets/2024_11_16_11_48_47_1.mp3"},
        14: {"english_audio": "https://storage.googleapis.com/profile_assets/2024_12_07_19_01_05_1.mp3", "image": "https://storage.googleapis.com/profile_assets/soap_frame.png", "text": "シャボン玉攻撃できるようになった", "audio": "https://storage.googleapis.com/profile_assets/2024_11_16_11_49_58_1.mp3"},
        15: {"english_audio": "https://storage.googleapis.com/profile_assets/2024_12_07_19_01_17_1.mp3", "image": "https://storage.googleapis.com/profile_assets/h-adult.png", "text": "一般的な大人です。握力５００キロ", "audio": "https://storage.googleapis.com/profile_assets/2024_10_29_15_57_34_1.mp3"},
        16: {"english_audio": "https://storage.googleapis.com/profile_assets/2024_12_07_19_01_28_1.mp3", "image": "https://storage.googleapis.com/profile_assets/sun_frame.png", "text": "勉強の成果で小さい太陽作れるようになった", "audio": "https://storage.googleapis.com/profile_assets/2024_11_16_11_52_29_1.mp3"},
        17: {"english_audio": "https://storage.googleapis.com/profile_assets/2024_12_07_19_01_41_1.mp3", "image": "https://storage.googleapis.com/profile_assets/wolf_frame.png", "text": "この可愛いペットを乗れるようになった", "audio": "https://storage.googleapis.com/profile_assets/2024_11_16_11_57_07_1.mp3"},
        18: {"english_audio": "https://storage.googleapis.com/profile_assets/2024_12_07_19_01_51_1.mp3", "image": "https://storage.googleapis.com/profile_assets/i-hero.png", "text": "ちょっとヒーローぽい存在", "audio": "https://storage.googleapis.com/profile_assets/2024_10_29_16_07_09_1.mp3"},
        19: {"english_audio": "https://storage.googleapis.com/profile_assets/2024_12_07_19_02_02_1.mp3", "image": "https://storage.googleapis.com/profile_assets/j-lightning.png", "text": "雷の力を持つ本物のヒーロー", "audio": "https://storage.googleapis.com/profile_assets/2024_10_29_15_58_51_1.mp3"},
        20: {"english_audio": "https://storage.googleapis.com/profile_assets/2024_12_07_19_02_21_1.mp3", "image": "https://storage.googleapis.com/profile_assets/blackhole_frame.png", "text": "勉強の成果で小さいブラックホール作れるようになった", "audio": "https://storage.googleapis.com/profile_assets/2024_11_16_11_58_39_1.mp3"},
        21: {"english_audio": "https://storage.googleapis.com/profile_assets/2024_12_07_19_02_33_1.mp3", "image": "https://storage.googleapis.com/profile_assets/k-lazer.png", "text": "雷とレーザーの力を持つ本物のヒーロー", "audio": "https://storage.googleapis.com/profile_assets/2024_10_29_16_00_03_1.mp3"},
        22: {"english_audio": "https://storage.googleapis.com/profile_assets/2024_12_07_19_02_42_1.mp3", "image": "https://storage.googleapis.com/profile_assets/beardman_frame.png", "text": "髭生やしてさらに強くなった", "audio": "https://storage.googleapis.com/profile_assets/2024_11_16_11_59_54_1.mp3"},
        23: {"english_audio": "https://storage.googleapis.com/profile_assets/2024_12_07_19_02_57_1.mp3", "image": "https://storage.googleapis.com/profile_assets/l-earth.png", "text": "地球を１秒で破壊できる侍", "audio": "https://storage.googleapis.com/profile_assets/2024_10_29_16_04_48_1.mp3"},
        24: {"english_audio": "https://storage.googleapis.com/profile_assets/2024_12_07_19_03_08_1.mp3", "image": "https://storage.googleapis.com/profile_assets/neutronstar_frame.png", "text": "普段から朝ごはんに中性子星を食べる", "audio": "https://storage.googleapis.com/profile_assets/2024_11_16_12_00_40_1.mp3"},
        25: {"english_audio": "https://storage.googleapis.com/profile_assets/2024_12_07_19_03_21_1.mp3", "image": "https://storage.googleapis.com/profile_assets/blackholedrinker_frame.png", "text": "喉乾いたときブラックホールをストローで飲む", "audio": "https://storage.googleapis.com/profile_assets/2024_11_16_12_02_15_1.mp3"},
        26: {"english_audio": "https://storage.googleapis.com/profile_assets/2024_12_07_19_03_31_1.mp3", "image": "https://storage.googleapis.com/profile_assets/m-universe.png", "text": "宇宙のすべてを１秒で破壊できる存在", "audio": "https://storage.googleapis.com/profile_assets/2024_10_29_16_05_21_1.mp3"},
    }
    result = {level: memories[level] for level in range(1, levels + 1) if level in memories}
    return result

def get_total_question():
    question_counts = {
        "total_japanese_questions": Question.objects.filter(test__category='japanese').count(),
        "total_english_5_questions": Question.objects.filter(test__category='english_5').count(),
        "total_english_6_questions": Question.objects.filter(test__category='english_6').count(),
        "total_phonics_questions": Question.objects.filter(test__category='phonics').count(),
        "total_numbers_questions": Question.objects.filter(test__category='numbers').count(),
    }
    return question_counts

def get_total_questions():
    question_counts = {
        "total_japanese_questions": Test.objects.filter(category='japanese').aggregate(total_score=Sum('total_score'))['total_score'] or 0,
        "total_english_5_questions": Test.objects.filter(category='english_5').aggregate(total_score=Sum('total_score'))['total_score'] or 0,
        "total_english_6_questions": Test.objects.filter(category='english_6').aggregate(total_score=Sum('total_score'))['total_score'] or 0,
        "total_phonics_questions": Test.objects.filter(category='phonics').aggregate(total_score=Sum('total_score'))['total_score'] or 0,
        "total_numbers_questions": Test.objects.filter(category='numbers').aggregate(total_score=Sum('total_score'))['total_score'] or 0,
        "total_eiken_questions": Test.objects.filter(category='eiken').aggregate(total_score=Sum('total_score'))['total_score'] or 0,
    }
    return question_counts





def get_total_category_scores(user):
    total_category_scores = {
        "total_japanese_scores": MaxScore.objects.filter(user=user, test__category='japanese').aggregate(total_score=Sum('score'))['total_score'] or 0,
        "total_english_5_scores": MaxScore.objects.filter(user=user, test__category='english_5').aggregate(total_score=Sum('score'))['total_score'] or 0,
        "total_english_6_scores": MaxScore.objects.filter(user=user, test__category='english_6').aggregate(total_score=Sum('score'))['total_score'] or 0,
        "total_phonics_scores": MaxScore.objects.filter(user=user, test__category='phonics').aggregate(total_score=Sum('score'))['total_score'] or 0,
        "total_numbers_scores": MaxScore.objects.filter(user=user, test__category='numbers').aggregate(total_score=Sum('score'))['total_score'] or 0,
        "total_eiken_scores": MaxScore.objects.filter(user=user, test__category='eiken').aggregate(total_score=Sum('score'))['total_score'] or 0,
    }
    return total_category_scores