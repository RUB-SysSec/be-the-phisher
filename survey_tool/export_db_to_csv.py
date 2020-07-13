import pymysql

data_path = "./data/results/"

def save_to_csv(headline, data, filename):
    with open(data_path + filename, "w+") as f:
        f.write(headline + "\n")
        f.write("\n".join(data))

# open database connection
db = pymysql.connect("127.0.0.1", "homer", "32bdb87a.5f5184b7925-397015b1)93", "domain_user_study")

# prepare a cursor object
cursor = db.cursor()

# merge test_persons and questionnaire and store in one file
cursor.execute("SELECT * FROM test_persons")
test_persons_data = {}
for row in cursor.fetchall():
    test_persons_data[row[1]] = ",".join([str(elem) for elem in row[2:]])

cursor.execute("SELECT q.questionnaire_id, tp.user_id, q.age, q.gender, q.education, q.origin, q.f1, q.f2, q.f3, q.f4, q.f5, q.f6, q.f7, q.f8, q.f9, q.f10, q.f11, q.f12, q.f13, q.f14, q.f15, q.f16, q.attention_test1, q.attention_test2, q.phishing, q.techniques, q.future\
                FROM questionnaire as q, test_persons as tp\
                WHERE q.test_person_id = tp.test_person_id\
                ORDER BY q.questionnaire_id")
questionnaire_data = {}
for row in cursor.fetchall():
    line = ",".join([str(elem) for elem in row[2:6]])
    sum = 0
    for elem in row[6:22]:
        if elem == "never":
            line += ",0"
        elif elem == "rarely":
            line += ",1"
            sum += 1
        elif elem == "sometimes":
            line += ",2"
            sum += 2
        elif elem == "often":
            line += ",3"
            sum += 3
        elif elem == "always":
            line += ",4"
            sum += 4
    line += "," + str(sum) + "," + str(sum/16) + ","
    line += ",".join([str(elem) for elem in row[22:]])
    questionnaire_data[row[1]] = line

data = []
for user_id in test_persons_data.keys():
    if user_id in questionnaire_data.keys():
        data.append(user_id + "," + test_persons_data[user_id] + "," + questionnaire_data[user_id])
    else:
        data.append(user_id + "," + test_persons_data[user_id] + "," + ",".join(["" for i in range(0,27)]))
headline = "user_id,completion_code,os,browser,version,is_mobile,finished_step1,finished_step2,finished_step3,\
            finished_step4,finished_questionnaire,age,gender,education,origin,f1,f2,f3,f4,f5,f6,f7,f8,f9,f10,\
            f11,f12,f13,f14,f15,f16,sum,avg,attention_test1,attention_test2,phishing,techniques,future"
save_to_csv(headline, data, "test_persons.csv")

# store step 1
cursor.execute("SELECT s.step1_id, tp.user_id, td.domain, td.classification, s.elapsed_time, s.result\
                FROM step1 as s, test_persons as tp, test_domains as td\
                WHERE s.test_person_id = tp.test_person_id AND s.test_domain_id = td.test_domain_id\
                ORDER BY s.step1_id")
data = []
for row in cursor.fetchall():
    data.append(",".join([str(elem) for elem in row[1:]]))
headline = "user_id,test_domain,classification,elapsed_time,result"
save_to_csv(headline, data, "step1.csv")

# store step 2
cursor.execute("SELECT s.step2_id, tp.user_id, rd.domain, s.squatting_technique, s.domain, s.elapsed_time, s.squatting_techniques_order\
                FROM step2 as s, test_persons as tp, reference_domains as rd\
                WHERE s.test_person_id = tp.test_person_id AND s.reference_domain_id = rd.reference_domain_id\
                ORDER BY s.step2_id")
data = []
for row in cursor.fetchall():
    data.append(",".join([str(elem) for elem in row[1:]]))
headline = "user_id,reference_domain,squatting_technique,created_domain,elapsed_time,squatting_technique1,squatting_technique2,squatting_technique3,squatting_technique4,squatting_technique5"
save_to_csv(headline, data, "step2.csv")

# store step 3
# get rated test domains
cursor.execute("SELECT s.step3_test_domain_id, tp.user_id, td.domain, s.elapsed_time, s.rating\
                FROM step3_test_domains as s, test_persons as tp, test_domains as td\
                WHERE s.test_person_id = tp.test_person_id AND s.test_domain_id = td.test_domain_id\
                ORDER BY s.step3_test_domain_id")
data = []
for row in cursor.fetchall():
    data.append(",".join([str(elem) for elem in row[1:]]) + ",0")

# get rated step 2 domains
cursor.execute("SELECT s.step3_step2_domain_id, tp.user_id, s2.domain, s.elapsed_time, s.rating\
                FROM step3_step2_domains as s, test_persons as tp, step2 as s2\
                WHERE s.test_person_id = tp.test_person_id AND s.step2_id = s2.step2_id\
                ORDER BY s.step3_step2_domain_id")
for row in cursor.fetchall():
    data.append(",".join([str(elem) for elem in row[1:]]) + ",1")

headline = "user_id,test_domain,elapsed_time,result,type"
save_to_csv(headline, data, "step3.csv")

# store step 4
cursor.execute("SELECT s.step4_id, tp.user_id, td.domain, td.classification, s.elapsed_time, s.result\
                FROM step4 as s, test_persons as tp, test_domains as td\
                WHERE s.test_person_id = tp.test_person_id AND s.test_domain_id = td.test_domain_id\
                ORDER BY s.step4_id")
data = []
for row in cursor.fetchall():
    data.append(",".join([str(elem) for elem in row[1:]]))
headline = "user_id,test_domain,classification,elapsed_time,result"
save_to_csv(headline, data, "step4.csv")

# close database connection
db.close()